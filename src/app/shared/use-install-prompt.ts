import React from "react"

/**
 * Cross-browser "add to home screen" support.
 *
 * Only Chromium browsers (Chrome/Edge/Samsung Internet/Opera on Android and
 * desktop) expose the `beforeinstallprompt` event that lets us trigger the
 * native install dialog. Every other browser needs a hand-rolled hint that
 * tells the user where the "Add to Home Screen" action lives.
 *
 * The module-level store exists so the event listener is registered as soon
 * as this module is evaluated (before React mounts) — `beforeinstallprompt`
 * can fire before the banner component is on screen and would otherwise be
 * lost.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * - native:          browser fires `beforeinstallprompt`; we call `prompt()`
 * - ios:             Safari / Chrome / Firefox / Edge on iPhone & iPad — Share
 *                    sheet → "Add to Home Screen" (all browsers since iOS 16.4)
 * - android-firefox: Firefox for Android — menu → "Install" / "Add to Home screen"
 * - mac-safari:      Safari 17+ on macOS Sonoma — File → "Add to Dock"
 * - unsupported:     desktop Firefox and anything else without an install path
 */
export type InstallMode =
  "native" | "ios" | "android-firefox" | "mac-safari" | "unsupported"

// snooze the auto-shown banner after a dismissal; the header button stays
const KEY_SNOOZED_UNTIL = "eDirectory_installSnoozedUntil"
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

export function isStandalone(): boolean {
  try {
    const nav = navigator as Navigator & { standalone?: boolean }
    return (
      nav.standalone === true ||
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.matchMedia?.("(display-mode: fullscreen)").matches ||
      window.matchMedia?.("(display-mode: minimal-ui)").matches ||
      window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
      document.referrer.startsWith("android-app://")
    )
  } catch {
    return false
  }
}

function detectMode(): InstallMode {
  const ua = navigator.userAgent
  const nav = navigator as Navigator & { platform?: string }

  // iPadOS 13+ reports a desktop Mac UA; touch points give it away
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (nav.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"

  if (/Android/i.test(ua)) {
    if (/Firefox|FxiOS/i.test(ua)) return "android-firefox"
    // Chrome, Samsung Internet, Edge, Opera, Brave… all Chromium
    return "native"
  }

  const isChromiumLike = /Chrome|Chromium|CriOS|Edg|OPR|Brave/i.test(ua)
  if (isChromiumLike) return "native"

  if (/Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Firefox/i.test(ua)) {
    // Add to Dock arrived with Safari 17 (macOS Sonoma)
    const version = Number(/Version\/(\d+)/.exec(ua)?.[1] ?? 0)
    return version >= 17 ? "mac-safari" : "unsupported"
  }

  return "unsupported"
}

// evaluated once per page load; a snooze set during the session flips the flag
function isSnoozed(): boolean {
  try {
    return Number(localStorage.getItem(KEY_SNOOZED_UNTIL) ?? 0) > Date.now()
  } catch {
    return false
  }
}

interface InstallStore {
  mode: InstallMode
  deferred: BeforeInstallPromptEvent | null
  installed: boolean
  standalone: boolean
  snoozed: boolean
  // set by the header button so the banner reopens regardless of snooze
  forcedOpen: boolean
}

let snapshot: InstallStore = {
  mode: detectMode(),
  deferred: null,
  installed: false,
  standalone: isStandalone(),
  snoozed: isSnoozed(),
  forcedOpen: false,
}

const listeners = new Set<() => void>()

function update(patch: Partial<InstallStore>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return snapshot
}

window.addEventListener("beforeinstallprompt", (event) => {
  // stop the mini-infobar so our banner is the only prompt on screen
  event.preventDefault()
  update({ deferred: event as BeforeInstallPromptEvent, installed: false })
})

window.addEventListener("appinstalled", () => {
  update({ deferred: null, installed: true, forcedOpen: false })
})

// user might install through the browser menu while the tab stays open;
// the display-mode query flips once the standalone window takes over
try {
  window
    .matchMedia?.("(display-mode: standalone)")
    .addEventListener("change", (event) => {
      if (event.matches) update({ standalone: true, forcedOpen: false })
    })
} catch {
  // matchMedia unsupported: standalone is only read on load
}

function snooze() {
  const until = Date.now() + SNOOZE_MS
  try {
    localStorage.setItem(KEY_SNOOZED_UNTIL, String(until))
  } catch {
    // private mode / blocked storage: snooze still applies this session
  }
  update({ snoozed: true, forcedOpen: false })
}

export function useInstallPrompt() {
  const store = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const { mode, deferred, installed, standalone, snoozed, forcedOpen } = store

  // whether an install action exists at all for this browser right now
  const available =
    !standalone &&
    !installed &&
    mode !== "unsupported" &&
    (mode !== "native" || deferred !== null)

  // whether the banner should be on screen (auto or reopened from the header)
  const visible = available && (forcedOpen || !snoozed)

  const show = React.useCallback(() => update({ forcedOpen: true }), [])

  const dismiss = React.useCallback(() => snooze(), [])

  // native mode only: hands off to the browser's install dialog
  const install = React.useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    const event = snapshot.deferred
    if (!event) return "unavailable"

    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      // the event is single-use; Chromium fires a fresh one later if needed
      update({ deferred: null, forcedOpen: false })
      if (outcome === "dismissed") snooze()
      return outcome
    } catch {
      update({ deferred: null, forcedOpen: false })
      return "unavailable"
    }
  }, [])

  return { mode, available, visible, show, dismiss, install }
}
