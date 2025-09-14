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
        short_name: "eDirectory",
        description: "eDirectory | 78th Annual Nirankari Sant Samagam",
        name: "eDirectory | Sant Samagam",
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
            name: "eDirectory",
            short_name: "eDirectory",
            description: "eDirectory | 78th Annual Nirankari Sant Samagam",
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
    // Optimize bundle for Firebase
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/firestore", "firebase/auth"],
        },
      },
    },
  },
})
