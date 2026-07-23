import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(
  new URL("../components/layout/NotificationCenter.tsx", import.meta.url),
  "utf8"
)

assert.match(
  source,
  /<DialogContent className="[^"]*\bflex\b[^"]*\bh-dvh\b[^"]*\bflex-col\b[^"]*\bgap-0\b[^"]*\boverflow-hidden\b[^"]*">/
)
assert.doesNotMatch(source, /<div className="flex h-full flex-col">/)
assert.match(
  source,
  /className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"/
)
