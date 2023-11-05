import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import checker from "vite-plugin-checker"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      selfDestroying: true,
      // add this to cache all the imports
      workbox: {
        globPatterns: ["**/*"],
      },
      // add this to cache all the
      // static assets in the public folder
      includeAssets: ["**/*"],
      manifest: {
        theme_color: "#87CEEB",
        background_color: "#87CEEB",
        display: "standalone",
        scope: "/",
        start_url: "/",
        short_name: "eDirectory",
        description: "eDirectory | 76th Annual Nirankari Sant Samagam",
        name: "eDirectory | Sant Samagam",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    checker({
      // e.g. use TypeScript check
      typescript: true,
    }),
  ],
  server: {
    open: true,
    port: 3000,
    host: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
})
