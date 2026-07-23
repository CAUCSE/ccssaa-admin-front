# Notification Center Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the notification center's recent-notification area scroll vertically when its content exceeds the viewport.

**Architecture:** Keep the fix local to `NotificationCenter` by making `DialogContent` the sole flex height boundary. Remove the nested full-height wrapper so the fixed header and flexible scroll region participate in one layout calculation.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Node.js assertions

## Global Constraints

- Modify only the notification-center UI and its focused regression test.
- Do not change notification fetching, read-state updates, or navigation.
- Do not modify the shared `components/ui/dialog.tsx`.
- Preserve Korean UI copy.

---

### Task 1: Notification Center Scroll Boundary

**Files:**
- Create: `tests/notification-center-scroll.test.mjs`
- Modify: `components/layout/NotificationCenter.tsx:76`

**Interfaces:**
- Consumes: Tailwind layout classes on `DialogContent`, `DialogHeader`, and the recent-notification list container.
- Produces: A single flex height boundary with a fixed header and `min-h-0 flex-1 overflow-y-auto` list region.

- [ ] **Step 1: Write the failing regression test**

```js
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
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node tests/notification-center-scroll.test.mjs`

Expected: FAIL because `DialogContent` does not contain the flex layout classes and the nested `h-full` wrapper still exists.

- [ ] **Step 3: Apply the minimal layout fix**

Change `DialogContent` to:

```tsx
<DialogContent className="left-auto right-0 top-0 flex h-dvh max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-l p-0 sm:max-w-md">
```

Remove only the opening and closing tags of:

```tsx
<div className="flex h-full flex-col">
```

Keep `DialogHeader` and the `min-h-0 flex-1 overflow-y-auto` list as direct `DialogContent` children.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node tests/notification-center-scroll.test.mjs`

Expected: exit code 0 with no output.

- [ ] **Step 5: Run repository verification**

Run: `npm run lint`

Expected: `✔ No ESLint warnings or errors`

Run: `npm run build`

Expected: production build completes with exit code 0.

- [ ] **Step 6: Review and commit**

Run: `git diff --check`

Expected: exit code 0.

Run:

```bash
git add tests/notification-center-scroll.test.mjs components/layout/NotificationCenter.tsx
git commit -m "fix: restore notification center scrolling"
```
