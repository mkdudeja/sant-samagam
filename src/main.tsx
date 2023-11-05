import React from "react"
import ReactDOM from "react-dom/client"
import { toast } from "react-toastify"
import { registerSW } from "virtual:pwa-register"

import "react-toastify/dist/ReactToastify.css"
import Offline from "./app/offline.component"
import "./assets/styles/style.css"

const intervalMS = 60 * 60 * 1000

registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success("App can be accessed in offline (no internet) mode as well.")
  },
  onRegisteredSW(swUrl, r) {
    r &&
      setInterval(async () => {
        if (!(!r.installing && navigator)) return

        if ("connection" in navigator && !navigator.onLine) return

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
    <Offline />
    {/* <App />
    <ScrollTop />
    <ToastContainer toastClassName="text-sm" theme="colored" /> */}
  </React.StrictMode>,
)
