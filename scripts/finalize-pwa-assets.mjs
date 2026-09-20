// The generator writes its output next to the source image (logo/), which is
// kept out of public/ so the 500 KB source never ships. This step sorts the
// generated assets into their public/ homes and drops the landscape splash
// screens: the manifest locks the app to portrait-primary and the generator
// has no portrait-only option.
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs"

const src = new URL("../logo/", import.meta.url)

// favicon.ico must stay at the site root (browsers auto-request /favicon.ico);
// everything else lives under assets/images to keep the deploy root clean
const DEST_BY_PATTERN = [
  [/^favicon\.ico$/, "../public/"],
  [/^apple-splash-portrait-.*\.png$/, "../public/assets/images/splash/"],
  [
    /^(apple-touch-icon-|maskable-icon-|pwa-).*\.png$/,
    "../public/assets/images/icons/",
  ],
]
const DROP = /^apple-splash-landscape-.*\.png$/

let moved = 0
let dropped = 0

for (const file of readdirSync(src)) {
  if (DROP.test(file)) {
    rmSync(new URL(file, src))
    dropped++
    continue
  }

  const match = DEST_BY_PATTERN.find(([pattern]) => pattern.test(file))
  if (match) {
    const dest = new URL(match[1], import.meta.url)
    mkdirSync(dest, { recursive: true })
    renameSync(new URL(file, src), new URL(file, dest))
    moved++
  }
}

console.log(
  `moved ${moved} assets into public/, dropped ${dropped} landscape splash screens`,
)
