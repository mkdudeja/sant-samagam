import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import checker from "vite-plugin-checker"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // single source of truth for the event name
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
          // iOS caches the startup image itself when the PWA is installed, so
          // precaching all 80 of them would bloat the offline install for no gain
          // - splash screens: iOS caches the startup image itself at install
          //   time, so precaching all of them would bloat the offline install
          // - icons: precached via the manifest-icons injection with content
          //   hashes; the glob would add a second, conflicting revision:null
          //   entry because plain-named files under assets/ look hash-named
          //   to the plugin (see scripts/verify-sw-precache.mjs)
          globIgnores: ["**/apple-splash-*.png", "**/assets/images/icons/**"],
          // Important for Firebase offline
          cleanupOutdatedCaches: true,
          // take over open pages so updates land without user action
          skipWaiting: true,
          clientsClaim: true,
          // Handle navigation fallback for SPA
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        },
        // add this to cache all the
        // static assets in the public folder
        // NO includeAssets: globPatterns already covers every public/ file in
        // the build output. Listing a file in both gave it two precache entries
        // with conflicting revisions (hash vs null), which makes workbox's
        // addToCacheList throw inside the sw.js module loader — silently, after
        // skipWaiting() — leaving an ACTIVE service worker with no fetch
        // handler and an empty cache: the app dies offline.
        manifest: {
          // stable identity so Chromium keeps recognising the install across
          // start_url changes
          id: "/",
          lang: "en",
          dir: "ltr",
          categories: ["utilities", "productivity"],
          theme_color: "#fbf8f2",
          background_color: "#fbf8f2",
          display: "standalone",
          display_override: ["standalone", "minimal-ui"],
          // never point users at a store listing instead of this PWA
          prefer_related_applications: false,
          scope: "/",
          start_url: "/",
          // name is what Android launchers, desktop app lists and Safari's Dock
          // show under the icon; the full event title only fits in description
          name: APP_NAME,
          short_name: APP_NAME,
          description: APP_TITLE,
          orientation: "portrait-primary",
          icons: [
            {
              src: "assets/images/icons/pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "assets/images/icons/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "assets/images/icons/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "assets/images/icons/maskable-icon-512x512.png",
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
                  src: "assets/images/icons/pwa-192x192.png",
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
      // maps were 3.5 MB of a 4.8 MB deploy; use --mode development for them
      sourcemap: mode !== "production",
      // rolldown takes codeSplitting groups, not the manualChunks object
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
