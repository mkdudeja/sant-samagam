// Guards against the silent killer found in Sep 2026: a URL listed twice in
// the precache manifest with different revisions makes workbox throw during
// sw.js evaluation — after skipWaiting() — producing an active service worker
// that caches nothing and breaks offline entirely. Fail the build instead.
import { readFileSync } from "node:fs"

const sw = readFileSync(new URL("../build/sw.js", import.meta.url), "utf8")
const entries = [...sw.matchAll(/\{url:"([^"]+)",revision:("[^"]*"|null)\}/g)]

if (entries.length === 0) {
  console.error("verify-sw-precache: no precache entries found in build/sw.js")
  process.exit(1)
}

const seen = new Map()
let failed = false

for (const [, url, revision] of entries) {
  if (seen.has(url) && seen.get(url) !== revision) {
    console.error(
      `verify-sw-precache: conflicting precache entries for "${url}": ${seen.get(url)} vs ${revision}`,
    )
    failed = true
  }
  seen.set(url, revision)
}

if (failed) process.exit(1)
console.log(`verify-sw-precache: ${seen.size} unique entries, no conflicts`)
