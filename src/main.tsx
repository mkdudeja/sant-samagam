import React from "react"
import ReactDOM from "react-dom/client"
import { toast, ToastContainer } from "react-toastify"
import { registerSW } from "virtual:pwa-register"

import "react-toastify/dist/ReactToastify.css"
import App from "./app/app.component"
import InstallPrompt from "./app/install-prompt.component"
import ScrollTop from "./app/scroll-top.component"
import "./assets/styles/style.css"

const intervalMS = 60 * 60 * 1000

registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success("App can be accessed in offline (no internet) mode as well.")
  },
  // suppresses the default reload-on-update, which would wipe the search
  onNeedReload() {},
  onRegisteredSW(swUrl, r) {
    if (!r) return

    setInterval(async () => {
      if (r.installing) return

      // unguarded: navigator.connection is Chromium-only
      if (!navigator.onLine) return

      const resp = await fetch(swUrl, {
        cache: "no-store",
        headers: {
          cache: "no-store",
          "cache-control": "no-cache",
        },
      })

      if (resp?.status === 200) await r.update()
    }, intervalMS)
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <Offline /> */}
    <App />
    <ScrollTop />
    <InstallPrompt />
    <ToastContainer toastClassName="text-sm" theme="colored" />
  </React.StrictMode>,
)
