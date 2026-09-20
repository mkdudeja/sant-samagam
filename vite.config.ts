import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import checker from "vite-plugin-checker"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Single source of truth: change VITE_EVENT_NAME in .env and every place follows.
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const APP_NAME = env.VITE_APP_NAME
  const EVENT_NAME = env.VITE_EVENT_NAME
  const APP_TITLE = `${APP_NAME} | ${EVENT_NAME}`

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        // add this to cache all the imports
        workbox: {
          // Cache all your static assets
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
          ],
          // Important for Firebase offline
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          // Handle navigation fallback for SPA
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        },
        // add this to cache all the
        // static assets in the public folder
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "pwa-*.png",
          "maskable-icon-*.png",
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
        ],
        manifest: {
          theme_color: "#87CEEB",
          background_color: "#87CEEB",
          display: "standalone",
          scope: "/",
          start_url: "/",
          short_name: APP_NAME,
          description: APP_TITLE,
          name: APP_TITLE,
          orientation: "portrait-primary",
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
          // Add shortcuts for quick access
          shortcuts: [
            {
              name: APP_NAME,
              short_name: APP_NAME,
              description: APP_TITLE,
              url: "/",
              icons: [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                },
              ],
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
      // Optimize bundle for Firebase.
      // Vite 8 bundles with rolldown, which takes codeSplitting groups
      // instead of the object form of manualChunks.
      rollupOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "firebase",
                test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              },
              {
                name: "vendor",
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              },
            ],
          },
        },
      },
    },
  }
})
