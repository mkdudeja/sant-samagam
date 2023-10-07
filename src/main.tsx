import React from "react"
import ReactDOM from "react-dom/client"
import { ToastContainer, toast } from "react-toastify"
import { registerSW } from "virtual:pwa-register"
import App from "./app/app.component"

import "react-toastify/dist/ReactToastify.css"
import "./assets/styles/style.css"

registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success("App can be accessed in offline (no internet) mode as well.")
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-full">
      <nav className="border-b border-gray-200 bg-white">
        <div className="relative m-4 lg:mx-auto max-w-5xl">
          <div className="flex flex-col space-y-2 lg:space-y-4 text-center p-4 border-4 border-black rounded-lg">
            <h1 className="text-xl lg:text-2xl font-bold">
              76th ANNUAL NIRANKARI SANT SAMAGAM
            </h1>
            <h2 className="text-base lg:text-lg underline">
              TELEPHONE / INTERCOM NUMBER LIST
            </h2>
          </div>
          <div className="absolute top-2 right-2 hidden print:hidden lg:block">
            <button
              type="button"
              onClick={window.print}
              className="cursor rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Print
            </button>
          </div>
        </div>
      </nav>

      <main className="m-4 lg:mx-auto max-w-5xl">
        <App />
      </main>
    </div>
    <ToastContainer toastClassName="text-sm" theme="colored" />
  </React.StrictMode>,
)
