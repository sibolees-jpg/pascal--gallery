# Gallery Building Linework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic homepage geometry with a minimal green line drawing derived from the real Pascal Gallery building.

**Architecture:** Keep the existing fixed decorative SVG and its scroll-state JavaScript intact. Replace only the SVG geometry and its element-specific CSS, then lock the recognizable building parts with the existing Node structure test.

**Tech Stack:** Static HTML, CSS, inline SVG, Node.js built-in test runner

## Global Constraints

- Preserve the existing right-side fixed placement, green color, and scroll fade/shift behavior.
- Show three rising industrial roof volumes, two circular windows, facade bands, and a simplified concrete entrance portal.
- Do not add brick texture, pipes, trees, sky, or photographic fills.
- Do not modify homepage content, artwork data, admin tools, or other pages.

---

### Task 1: Replace the Decorative Geometry

**Files:**
- Modify: `tests/site-structure.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `.architectural-linework` and `linework-state-0/1/2` behavior already controlled by `homepage-motion.js`.
- Produces: SVG classes `.building-roofline`, `.round-window`, `.facade-band`, and `.entrance-portal` for styling and structure verification.

- [ ] **Step 1: Write the failing structure test**

Replace the generic geometry assertions with:

```js
assert.match(index, /class="building-roofline"/);
assert.equal((index.match(/class="round-window/g) ?? []).length, 2);
assert.equal((index.match(/class="facade-band/g) ?? []).length, 2);
assert.match(index, /class="entrance-portal"/);
assert.doesNotMatch(index, /class="geometry-line-[ab]"/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test tests/site-structure.test.mjs
```

Expected: FAIL because the current SVG still uses `.roof-line` and `.geometry-line-a/b`.

- [ ] **Step 3: Replace the inline SVG geometry**

Use a `360 520` view box and add:

```html
<path class="building-roofline" d="M18 226 V178 L76 142 L126 174 V132 L190 94 L242 132 V78 L334 62 V262" />
<circle class="round-window round-window-left" cx="164" cy="190" r="17" />
<circle class="round-window round-window-right" cx="286" cy="158" r="21" />
<line class="facade-band facade-band-upper" x1="20" y1="250" x2="336" y2="250" />
<line class="facade-band facade-band-lower" x1="20" y1="274" x2="336" y2="274" />
<path class="entrance-portal" d="M194 292 H338 V458 H310 V334 H224 V458 H194 Z" />
```

Keep `aria-hidden="true"`, `focusable="false"`, and all existing linework state classes unchanged.

- [ ] **Step 4: Update the SVG styles**

Style SVG paths as well as circles and lines, use a `3px` roof stroke, `2.2px` window/portal strokes, and `1.5px` facade bands. Preserve every positioning and state transition rule. Update the stylesheet cache query in `index.html` to `styles.css?v=20260817-building`.

- [ ] **Step 5: Run focused and full tests**

Run:

```bash
node --test tests/site-structure.test.mjs
node --test tests/*.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Visually verify responsive behavior**

Serve the repository locally and inspect `index.html` at `1440x900` and `390x844`. Confirm the building is recognizable, the decoration does not cover key text or controls, scrolling changes opacity, and the document has no horizontal overflow.

- [ ] **Step 7: Commit and publish**

```bash
git add index.html styles.css tests/site-structure.test.mjs
git commit -m "Refine homepage linework from gallery building"
git push origin main
```

Verify the live GitHub Pages homepage contains `building-roofline` after deployment.
