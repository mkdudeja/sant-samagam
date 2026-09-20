import React from "react"
import ReactDOM from "react-dom/client"
import { toast } from "sonner"
import { registerSW } from "virtual:pwa-register"

import App from "./app/app.component"
// side effects: app_open event, offline queue flushing
import "./app/shared/analytics"
import InstallPrompt from "./app/install-prompt.component"
import ScrollTop from "./app/scroll-top.component"
import ThemedToaster from "./app/themed-toaster.component"
import "./assets/styles/style.css"

const intervalMS = 60 * 60 * 1000

// Without the persistent-storage grant the browser may evict CacheStorage and
// IndexedDB under disk pressure, which strands offline users on the browser's
// "You're offline" page at next launch. Best effort; denial is fine.
if ("storage" in navigator && "persist" in navigator.storage) {
  void navigator.storage.persist()
}

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
    <ThemedToaster />
  </React.StrictMode>,
)
