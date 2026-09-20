import React from "react"
import { track } from "./shared/analytics"
import { APP_NAME } from "./shared/config"
import { InstallMode, useInstallPrompt } from "./shared/use-install-prompt"

// wait for the loading screen to clear and the list to render before nudging
const SHOW_DELAY_MS = 3000

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block w-4 h-4 -mt-0.5 align-middle"
    aria-hidden="true"
  >
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
    <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
  </svg>
)

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="inline-block w-4 h-4 -mt-0.5 align-middle"
    aria-hidden="true"
  >
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
)

const Step: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
    {children}
  </span>
)

function Instructions({ mode }: { mode: InstallMode }) {
  switch (mode) {
    case "ios":
      return (
        <>
          Tap{" "}
          <Step>
            <ShareIcon /> Share
          </Step>{" "}
          in your browser bar, then choose <Step>Add to Home Screen</Step>.
        </>
      )
    case "android-firefox":
      return (
        <>
          Tap the{" "}
          <Step>
            <MenuIcon /> menu
          </Step>{" "}
          then choose <Step>Install</Step> or <Step>Add to Home screen</Step>.
        </>
      )
    case "mac-safari":
      return (
        <>
          In the Safari menu bar choose <Step>File</Step> then{" "}
          <Step>Add to Dock</Step>.
        </>
      )
    default:
      return (
        <>
          One tap from your home screen, and it keeps working without internet.
        </>
      )
  }
}

const InstallPrompt: React.FC = () => {
  const { mode, visible, install, dismiss } = useInstallPrompt()

  const [ready, setReady] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const open = ready && visible

  React.useEffect(() => {
    if (open) track("install_prompt_show", { install_mode: mode })
  }, [open, mode])

  if (!open) return null

  const onInstall = async () => {
    setBusy(true)
    const outcome = await install()
    setBusy(false)
    if (outcome === "accepted") {
      track("install_accept", { install_mode: mode })
    } else {
      track("install_dismiss", { install_mode: mode, source: "native_dialog" })
    }
  }

  const onDismiss = (source: "not_now" | "got_it" | "close") => () => {
    track("install_dismiss", { install_mode: mode, source })
    dismiss()
  }

  const isNative = mode === "native"

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-body"
      className="fixed inset-x-0 bottom-0 z-40 print:hidden pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="pointer-events-auto mx-auto max-w-lg m-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-start gap-3 p-4">
          <img
            src="/assets/images/icons/pwa-192x192.png"
            alt=""
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl shrink-0 bg-[#fbf8f2]"
          />

          <div className="min-w-0 flex-1 text-sm">
            <p
              id="install-prompt-title"
              className="font-semibold text-gray-900 dark:text-gray-100"
            >
              {isNative
                ? `Install ${APP_NAME}`
                : `Add ${APP_NAME} to Home Screen`}
            </p>
            <p
              id="install-prompt-body"
              className="mt-1 leading-relaxed text-gray-600 dark:text-gray-300"
            >
              <Instructions mode={mode} />
            </p>

            <div className="mt-3 flex items-center gap-2">
              {isNative ? (
                <>
                  <button
                    type="button"
                    onClick={onInstall}
                    disabled={busy}
                    className="cursor rounded bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
                  >
                    {busy ? "Opening…" : "Install"}
                  </button>
                  <button
                    type="button"
                    onClick={onDismiss("not_now")}
                    className="cursor rounded px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
                  >
                    Not now
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onDismiss("got_it")}
                  className="cursor rounded bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
                >
                  Got it
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss("close")}
            aria-label="Dismiss install prompt"
            className="cursor -m-1 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
