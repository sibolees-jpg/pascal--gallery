# Homepage Architectural Line Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's oversized Chinese title with the complete gallery logo and add a fixed bright-green architectural line drawing that fades and shifts as sections enter the viewport.

**Architecture:** Keep the existing static GitHub Pages structure. Add semantic decorative markup to `index.html`, isolate scroll-state behavior in a small `homepage-motion.js` module, and append scoped responsive styles to `styles.css` without changing case, works, or admin data behavior.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js test runner, GitHub Pages.

## Global Constraints

- Preserve the white, black, and bright-green visual system.
- Use the complete Pascal Gallery logo as the homepage's primary brand visual.
- The fixed right-side line drawing contains a sawtooth roof, round window, and two geometric lines.
- The decoration must not block content or interaction and must use `aria-hidden="true"`.
- Respect `prefers-reduced-motion` and prevent horizontal overflow on desktop and mobile.
- Do not modify the works administration page or data publishing behavior.

---

### Task 1: Homepage Brand Hierarchy

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: `assets/brand/pascal-gallery-logo.svg`
- Produces: `.hero-brand-mark` containing the complete logo and a sans-serif Chinese heading system.

- [ ] **Step 1: Write the failing structure test**

Assert that the homepage contains `.hero-brand-mark`, its logo source, and does not contain `<h1 id="hero-title">帕斯卡画廊</h1>`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/site-structure.test.mjs`

Expected: FAIL because `.hero-brand-mark` is absent and the old text heading remains.

- [ ] **Step 3: Implement the logo-led hero and font hierarchy**

Replace the text H1 with an accessible heading that wraps the complete logo. Add scoped styles using a modern CJK sans-serif stack, restrained text widths, and responsive Logo sizing.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/site-structure.test.mjs`

Expected: all homepage structure tests pass.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css tests/site-structure.test.mjs
git commit -m "Refine homepage logo-led hero"
```

### Task 2: Fixed Architectural Line Drawing

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Produces: `.architectural-linework[aria-hidden="true"]` with `.roof-line`, `.round-window`, `.geometry-line-a`, and `.geometry-line-b` elements.

- [ ] **Step 1: Write the failing decoration test**

Assert that the four named geometry elements exist inside an `aria-hidden` fixed decoration.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/site-structure.test.mjs`

Expected: FAIL because the architectural decoration is absent.

- [ ] **Step 3: Add semantic decorative markup and responsive CSS**

Build the roof with CSS borders and transforms, the round window with `border-radius: 50%`, and the two lines with positioned border rules. Use `pointer-events: none`, bright green strokes, responsive sizing, and lower mobile opacity.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/site-structure.test.mjs`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css tests/site-structure.test.mjs
git commit -m "Add architectural homepage linework"
```

### Task 3: Section-Aware Fade Motion

**Files:**
- Create: `homepage-motion.js`
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/homepage-motion.test.mjs`

**Interfaces:**
- Produces: `getLineworkState(sectionIndex)` returning `linework-state-0`, `linework-state-1`, or `linework-state-2`.
- Runtime behavior: an `IntersectionObserver` applies the state class to `.architectural-linework` as `[data-linework-stage]` sections enter the viewport.

- [ ] **Step 1: Write failing tests for state mapping and integration hooks**

Test indices `0`, `1`, `2`, and `5`; assert the module contains `IntersectionObserver`, the HTML loads it as a module, and CSS contains `prefers-reduced-motion`.

- [ ] **Step 2: Run the motion test and verify RED**

Run: `node --test tests/homepage-motion.test.mjs`

Expected: FAIL because the motion module and hooks do not exist.

- [ ] **Step 3: Implement minimal state mapping and observer**

Export the pure state function, observe marked homepage sections, replace prior state classes on intersection, and leave the decoration static when `IntersectionObserver` is unavailable.

- [ ] **Step 4: Add transition and reduced-motion CSS**

Use only opacity and transform transitions. In reduced-motion mode set `transition: none` and `transform: none`.

- [ ] **Step 5: Run focused and full tests**

Run: `node --test tests/homepage-motion.test.mjs tests/site-structure.test.mjs`

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add homepage-motion.js index.html styles.css tests/homepage-motion.test.mjs
git commit -m "Animate homepage architectural linework"
```

### Task 4: Visual QA and Publish

**Files:**
- Modify only if QA reveals a defect: `styles.css`, `index.html`, `homepage-motion.js`

**Interfaces:**
- Consumes: completed homepage implementation.
- Produces: verified desktop and mobile GitHub Pages release.

- [ ] **Step 1: Start a local static server**

Run: `python3 -m http.server 4173`

- [ ] **Step 2: Verify desktop and mobile layouts**

Check widths `1440×900` and `390×844`. Confirm no horizontal overflow, the Logo is complete, the decoration stays on the right, and navigation remains usable.

- [ ] **Step 3: Verify motion and fallback**

Scroll through the latest, services, and contact sections; confirm state changes are visible but restrained. Check the reduced-motion CSS rule exists and disables movement.

- [ ] **Step 4: Run final verification**

Run: `node --test tests/*.test.mjs && git diff --check`

Expected: zero failures and no whitespace errors.

- [ ] **Step 5: Merge and publish**

Fast-forward the verified branch to `main`, push `main`, and confirm the public page returns `homepage-motion.js` and `.architectural-linework`.
