import React from "react"
import ReactDOM from "react-dom/client"
import { ToastContainer } from "react-toastify"
import { registerSW } from "virtual:pwa-register"
import App from "./app/app.component"

import "react-toastify/dist/ReactToastify.css"
import "./assets/styles/style.css"

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-full">
      <nav className="border-b border-gray-200 bg-white">
        <div className="m-4 lg:mx-auto max-w-5xl">
          <div className="flex flex-col space-y-2 lg:space-y-4 text-center p-4 border-4 border-black rounded-lg">
            <h1 className="text-xl lg:text-2xl font-bold">
              76th ANNUAL NIRANKARI SANT SAMAGAM
            </h1>
            <h2 className="text-base lg:text-lg underline">
              TELEPHONE / INTERCOM NUMBER LIST
            </h2>
          </div>
        </div>
      </nav>

      <main className="m-4 lg:mx-auto max-w-5xl">
        <div className="flex flex-col text-center space-y-4">
          <h3 className="text-md lg:text-base font-semibold">
            Dr. Parveen Khullar Ji (Member In charge ICT)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 text-sm shadow ring-1 ring-black ring-opacity-5 divide-x divide-y divide-gray-200 min-w-full">
            <p className="hidden lg:col-span-2"></p>
            <p className="whitespace-nowrap p-3">
              Rev. Sunil Madan Ji (Coordinator) 9810566269
            </p>
            <p className="whitespace-nowrap p-3">
              Rev. Avinash Garg Ji (Coordinator) 9266629805
            </p>
            <p className="whitespace-nowrap p-3 font-bold lg:col-span-2">
              ICT Helpdesk : 121 (Dial from your Intercom)
            </p>
          </div>
        </div>

        <App />
      </main>
    </div>
    <ToastContainer toastClassName="text-sm" theme="colored" />
  </React.StrictMode>,
)
