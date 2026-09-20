import {
  getAnalytics,
  logEvent,
  setUserProperties,
  type Analytics,
} from "firebase/analytics"
import { app, MEASUREMENT_ID } from "../../firebase/firebase"
import { detectInstallMode, isStandalone } from "./use-install-prompt"

/**
 * Usage analytics for an offline-first app.
 *
 * Firebase Analytics on the web is gtag.js, which has no offline buffer: an
 * event fired without a network is dropped, and when the app is launched from
 * the home screen with no signal the gtag script itself never loads, so even
 * later events would sit in `dataLayer` forever. This module therefore:
 *
 *   1. writes every event to a localStorage queue first,
 *   2. flushes the queue only when the browser is online AND gtag.js has
 *      actually loaded (re-injecting the script if Firebase's attempt failed),
 *   3. replays them in order once a connection is back.
 *
 * Event naming: snake_case, `<object>_<action>` (contact_call, filter_change,
 * install_accept). Parameter names are snake_case too. GA4 limits: 40-char
 * names, 100-char string values, 25 params per event.
 */

export type EventParams = Record<string, string | number | boolean | undefined>

interface QueuedEvent {
  n: string // name
  p: EventParams // params, already enriched
}

const KEY_QUEUE = "eDirectory_analyticsQueue"
const MAX_QUEUE = 1000
const FLUSH_INTERVAL_MS = 60 * 1000
const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?l=dataLayer&id=${MEASUREMENT_ID}`

type GtagWindow = Window & {
  google_tag_manager?: Record<string, unknown>
  google_tag_data?: unknown
}

/* ------------------------------------------------------------------ */
/* context                                                             */
/* ------------------------------------------------------------------ */

export function getDisplayMode(): "standalone" | "browser" {
  return isStandalone() ? "standalone" : "browser"
}

export type Platform = "ios" | "android" | "desktop" | "other"

// GA4 records OS/browser on its own; this is a coarse bucket that is easy to
// pivot on and survives UA-reduction
export function getPlatform(): Platform {
  const ua = navigator.userAgent
  const nav = navigator as Navigator & { platform?: string }
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (nav.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
    return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return "desktop"
  return "other"
}

/**
 * Short device label: iphone, ipad, samsung, xiaomi, oneplus, pixel…
 *
 * Chrome on Android stopped putting the model in the UA string (it is now
 * "Android 10; K"), so the brand is only reliably available through the
 * async Client Hints API. We start with a UA guess and refine it once the
 * hint resolves; events fired before that carry the guess.
 */
let deviceLabel = guessDeviceFromUA()

const MODEL_RULES: Array<[RegExp, string]> = [
  [/^SM-|Samsung|Galaxy/i, "samsung"],
  [/Pixel/i, "pixel"],
  [/OnePlus|^(KB|LE|NE|CPH2[4-9])\d/i, "oneplus"],
  [/^CPH|OPPO/i, "oppo"],
  [/^RMX|realme/i, "realme"],
  [/^V\d{4}|vivo/i, "vivo"],
  [/^(M\d{4}|2\d{9,10}|Redmi|Mi |POCO|Xiaomi)/i, "xiaomi"],
  [/moto|^XT\d/i, "motorola"],
  [/Nokia/i, "nokia"],
  [/Infinix|TECNO|itel/i, "transsion"],
  [/Lenovo|^TB/i, "lenovo"],
  [/Nothing|^A0\d{2}$/i, "nothing"],
  [/iQOO/i, "iqoo"],
  [/Huawei|Honor/i, "huawei"],
]

function labelFromModel(model: string): string | null {
  for (const [re, label] of MODEL_RULES) if (re.test(model)) return label
  return null
}

function guessDeviceFromUA(): string {
  const ua = navigator.userAgent
  const nav = navigator as Navigator & { platform?: string }
  if (/iPhone|iPod/i.test(ua)) return "iphone"
  if (
    /iPad/i.test(ua) ||
    (nav.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
    return "ipad"
  if (/Android/i.test(ua)) {
    if (/SamsungBrowser/i.test(ua)) return "samsung"
    // older Chrome / most non-Chrome browsers still expose the model
    const model = /Android [\d.]+; ([^;)]+)/i.exec(ua)?.[1]?.trim() ?? ""
    return (model && model !== "K" && labelFromModel(model)) || "android"
  }
  if (/Macintosh/i.test(ua)) return "mac"
  if (/Windows/i.test(ua)) return "windows"
  if (/CrOS/i.test(ua)) return "chromebook"
  if (/Linux/i.test(ua)) return "linux"
  return "other"
}

type UADataNavigator = Navigator & {
  userAgentData?: {
    getHighEntropyValues(hints: Array<string>): Promise<{ model?: string }>
  }
}

async function refineDeviceLabel(): Promise<void> {
  if (deviceLabel !== "android") return // only the generic bucket needs help
  try {
    const data = await (
      navigator as UADataNavigator
    ).userAgentData?.getHighEntropyValues(["model"])
    const label = data?.model ? labelFromModel(data.model) : null
    if (label) {
      deviceLabel = label
      syncUserProperties()
    }
  } catch {
    // hint refused or unsupported: stay with the UA guess
  }
}

export function getDevice(): string {
  return deviceLabel
}

/* ------------------------------------------------------------------ */
/* queue                                                               */
/* ------------------------------------------------------------------ */

function readQueue(): Array<QueuedEvent> {
  try {
    const raw = localStorage.getItem(KEY_QUEUE)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(queue: Array<QueuedEvent>) {
  try {
    if (queue.length) {
      localStorage.setItem(KEY_QUEUE, JSON.stringify(queue))
    } else {
      localStorage.removeItem(KEY_QUEUE)
    }
  } catch {
    // storage full or blocked: events for this session stay in memory only
  }
}

// in-memory mirror so a blocked localStorage still buffers within the session
let queue: Array<QueuedEvent> = readQueue()

function enqueue(event: QueuedEvent) {
  queue.push(event)
  if (queue.length > MAX_QUEUE) queue = queue.slice(queue.length - MAX_QUEUE)
  writeQueue(queue)
}

/* ------------------------------------------------------------------ */
/* gtag readiness                                                      */
/* ------------------------------------------------------------------ */

let analytics: Analytics | null = null
function getAnalyticsSafe(): Analytics | null {
  if (analytics) return analytics
  try {
    analytics = getAnalytics(app)
  } catch {
    // unsupported environment (no cookies / IndexedDB); events stay queued
    analytics = null
  }
  return analytics
}

function isGtagLoaded(): boolean {
  const w = window as GtagWindow
  return !!w.google_tag_manager || !!w.google_tag_data
}

let injecting = false
// Firebase inserts gtag.js after fetching its remote config; if either step
// failed (offline launch) nothing retries, so we add the script ourselves.
// gtag.js ignores a second load for the same id, so this is safe when
// Firebase's copy is merely slow.
function ensureGtag(): Promise<boolean> {
  if (isGtagLoaded()) return Promise.resolve(true)
  if (!navigator.onLine || injecting) return Promise.resolve(false)

  injecting = true
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.async = true
    script.src = GTAG_SRC
    script.onload = () => {
      injecting = false
      resolve(true)
    }
    script.onerror = () => {
      injecting = false
      script.remove()
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

/* ------------------------------------------------------------------ */
/* flush                                                               */
/* ------------------------------------------------------------------ */

let flushing = false
export async function flush(): Promise<void> {
  if (flushing || !queue.length || !navigator.onLine) return
  flushing = true
  try {
    const ready = await ensureGtag()
    const instance = ready ? getAnalyticsSafe() : null
    if (!instance) return

    const batch = queue
    queue = []
    writeQueue(queue)

    for (const event of batch) {
      logEvent(instance, event.n, event.p)
    }
  } finally {
    flushing = false
  }
}

/* ------------------------------------------------------------------ */
/* public api                                                          */
/* ------------------------------------------------------------------ */

function clamp(value: EventParams[string]): EventParams[string] {
  return typeof value === "string" && value.length > 100
    ? value.slice(0, 100)
    : value
}

/** Record a usage event. Safe to call offline; never throws. */
export function track(name: string, params: EventParams = {}): void {
  const clean: EventParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    clean[key] = clamp(value)
  }

  enqueue({
    n: name,
    p: {
      ...clean,
      platform: getPlatform(),
      device: getDevice(),
      display_mode: getDisplayMode(),
    },
  })

  void flush()
}

/** User-scoped dimensions: who the user base is, on what, installed or not. */
export function syncUserProperties(): void {
  const instance = getAnalyticsSafe()
  if (!instance) return
  try {
    setUserProperties(instance, {
      platform: getPlatform(),
      device: getDevice(),
      display_mode: getDisplayMode(),
      install_mode: detectInstallMode(),
    })
  } catch {
    // never let analytics break the app
  }
}

/* ------------------------------------------------------------------ */
/* lifecycle (runs once at module load)                                */
/* ------------------------------------------------------------------ */

syncUserProperties()
void refineDeviceLabel()

track("app_open", { install_mode: detectInstallMode() })

window.addEventListener("online", () => void flush())

window.addEventListener("appinstalled", () => {
  track("install_complete")
})

// a tab coming back to the foreground is the cheapest moment to drain
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void flush()
})

window.setInterval(() => void flush(), FLUSH_INTERVAL_MS)
