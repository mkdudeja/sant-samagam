import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
  minimalPreset as preset,
} from "@vite-pwa/assets-generator/config"

// splash grounds: warm paper in light, near-black in dark, matching the app
const LIGHT_BG = "#fbf8f2"
const DARK_BG = "#111827"

// One device per unique pixel size; iOS matches splash images by exact
// dimensions, so each entry covers every iPhone that shares its screen.
// Deliberately small set: this app ships to low-network areas, and a device
// without a match just gets the plain background_color splash.
const DEVICES = [
  "iPhone 15 Pro Max", // 1290x2796: 14/15/16 Pro Max, 15/16 Plus
  "iPhone 15", // 1179x2556: 14 Pro, 15, 16
  "iPhone 14", // 1170x2532: 12, 13, 14, 16e
  "iPhone 11 Pro", // 1125x2436: X, XS, 11 Pro, 12/13 mini
  "iPhone 11", // 828x1792: XR, 11
  'iPhone SE 4.7"', // 750x1334: SE, 6, 7, 8
] as const

export default defineConfig({
  preset: combinePresetAndAppleSplashScreens(
    preset,
    {
      padding: 0.3,
      resizeOptions: { background: LIGHT_BG, fit: "contain" },
      darkResizeOptions: { background: DARK_BG, fit: "contain" },
    },
    [...DEVICES],
  ),
  images: ["logo/jagriti.png"],
})
