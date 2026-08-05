# Artwork Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract artwork candidates from three supplied PPTX files and build a Chinese GitHub-backed artwork administration page whose published records drive the public works catalog.

**Architecture:** A one-time extraction script maps slide relationships to source media, creates deduplicated candidate records, and copies normalized web images into `assets/works/`. Browser-independent modules own validation, filtering, import/export, public visibility, and GitHub commit payloads; thin DOM controllers render the public and administration pages. The administration page uses a session-only fine-grained GitHub token and commits changes to `main`, while the public page renders only published records.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, ZIP/XML extraction tools already available in the workspace, GitHub REST API, GitHub Pages.

## Global Constraints

- All visible interface copy is Chinese.
- New PPT-derived records default to `publishStatus: "draft"` and never appear publicly until explicitly published.
- Unknown artwork facts use `"待补充"`; no artist, title, year, medium, dimensions, price, or ownership facts are invented.
- GitHub credentials remain only in memory or `sessionStorage` and are never committed, exported, logged, or rendered publicly.
- Internal source paths, source slide numbers, and internal notes never appear on the public works page.
- Existing unrelated `outputs/` files remain untouched.

---

### Task 1: Artwork Domain And Public Filtering

**Files:**
- Create: `artwork-tools.mjs`
- Create: `tests/artwork-tools.test.mjs`
- Modify: `data/works-for-sale.json`

**Interfaces:**
- Produces: `validateArtworkData(data)`, `getPublishedWorks(data)`, `getRecommendedWorks(data)`, `filterWorks(works, mode, selectedId, query)`, `createFilterOptions(works, mode)`.
- Consumes: the current category list and normalized artwork records.

- [ ] Write tests proving duplicate IDs and inventory numbers fail validation, draft records are excluded publicly, recommended records must also be published, and category/artist/search filters compose correctly.
- [ ] Run `node --test tests/artwork-tools.test.mjs`; expect failure because `artwork-tools.mjs` does not exist.
- [ ] Implement the five pure functions with exact public/draft semantics and safe string normalization.
- [ ] Replace placeholder records with the expanded schema: `id`, `inventoryNo`, `artist`, `title`, `year`, `medium`, `dimensions`, `category`, `categoryLabel`, `price`, `status`, `publishStatus`, `recommended`, `recommendedReason`, `description`, `image`, `notes`, `source`.
- [ ] Run `node --test tests/artwork-tools.test.mjs`; expect all tests to pass.
- [ ] Commit `artwork-tools.mjs`, its tests, and the schema migration.

### Task 2: PPT Artwork Candidate Extraction

**Files:**
- Create: `scripts/extract-artwork-candidates.mjs`
- Create: `tests/artwork-extraction.test.mjs`
- Create: `assets/works/<inventory-number>/primary.jpg`
- Modify: `data/works-for-sale.json`

**Interfaces:**
- Produces: `extractCandidates(pptxPaths, outputDirectory)` returning records with SHA-256 media hash, source deck basename, slide numbers, dimensions, and copied image path.
- Consumes: the three exact user-provided PPTX paths and the Task 1 schema.

- [ ] Write fixture-level tests proving slide-to-media relationships are recorded, duplicate media hashes collapse into one candidate, tiny/decorative images are rejected, and source slide numbers remain internal metadata.
- [ ] Run `node --test tests/artwork-extraction.test.mjs`; expect failure because the extraction module does not exist.
- [ ] Implement ZIP listing/extraction, relationship parsing, image dimension checks, SHA-256 deduplication, and a deterministic candidate manifest. Reject images smaller than 500 pixels on either side or smaller than 80 KB, then review remaining candidates visually to remove logos, backgrounds, portraits, architecture references, and project photographs.
- [ ] Generate web JPEGs no wider than 2000 pixels and copy each accepted image to its inventory directory without changing the source PPTX files.
- [ ] Add accepted candidates to `data/works-for-sale.json` as draft records with `待补充` metadata and exact source deck/slide attribution.
- [ ] Run extraction tests and validate every resulting image path exists and every hash is unique.
- [ ] Commit the extraction script, draft records, and images.

### Task 3: Public Works Catalog

**Files:**
- Modify: `works.html`
- Modify: `works.js`
- Modify: `styles.css`
- Create: `tests/works-page.test.mjs`

**Interfaces:**
- Consumes: Task 1 pure functions and normalized JSON.
- Produces: published-only recommendation cards, category/artist mode controls, combined search, and published-only catalog rows.

- [ ] Write tests proving `works.js` imports the pure functions, the public page contains both classification modes and a search field, and internal fields are absent from rendering templates.
- [ ] Run `node --test tests/works-page.test.mjs`; expect failure because the controls and module imports are absent.
- [ ] Convert `works.js` to an ES module controller, render only `getPublishedWorks(data)`, and wire category mode, artist mode, selected filter, and search query into `filterWorks`.
- [ ] Update public copy so incomplete data is described honestly and remove placeholder-framework language.
- [ ] Add responsive toolbar and image styles that preserve the white background and bright green accents without horizontal overflow.
- [ ] Run the page tests and browser-check desktop and mobile search/filter interactions.
- [ ] Commit the public catalog changes.

### Task 4: Administration Domain And Import/Export

**Files:**
- Create: `admin/artwork-admin-tools.mjs`
- Create: `tests/artwork-admin-tools.test.mjs`

**Interfaces:**
- Produces: `createArtwork(data)`, `updateArtwork(data, id, patch)`, `removeArtwork(data, id)`, `importArtworkData(text)`, `exportArtworkData(data)`, `escapeHtml(value)`, `validateImage(file)`.
- Consumes: Task 1 validation rules.

- [ ] Write tests for deterministic next inventory number, immutable updates, delete behavior, invalid JSON, duplicate identifiers, script-tag escaping, supported JPEG/PNG/WebP files, and the 10 MB image limit.
- [ ] Run `node --test tests/artwork-admin-tools.test.mjs`; expect failure because the module is absent.
- [ ] Implement the pure administration functions and user-facing Chinese validation errors.
- [ ] Run the tests; expect all to pass.
- [ ] Commit the administration domain module and tests.

### Task 5: GitHub Repository Save Client

**Files:**
- Create: `admin/github-client.mjs`
- Create: `tests/github-client.test.mjs`

**Interfaces:**
- Produces: `createGitHubClient({owner, repo, branch, token, fetchImpl})` with `verify()`, `readFile(path)`, and `commitFiles(files, message, expectedHeadSha)`.
- Consumes: UTF-8 JSON content and optional base64 image content.

- [ ] Write tests against an injected fake `fetchImpl` for authorization headers, repository verification, latest-head conflict detection, Git blob/tree/commit/ref calls, and Chinese mappings for 401, 403, 409, 422, and network failures.
- [ ] Run `node --test tests/github-client.test.mjs`; expect failure because the client is absent.
- [ ] Implement the Git Data API flow: read ref, reject changed expected SHA, create blobs, create tree from current commit tree, create commit, then update `refs/heads/main` without force.
- [ ] Ensure token values never appear in thrown messages or request diagnostics.
- [ ] Run the GitHub client tests; expect all to pass.
- [ ] Commit the client and tests.

### Task 6: Chinese Administration Page

**Files:**
- Create: `admin/works.html`
- Create: `admin/works-admin.js`
- Create: `admin/admin.css`
- Create: `tests/admin-page.test.mjs`

**Interfaces:**
- Consumes: Task 4 administration functions, Task 5 GitHub client, and `data/works-for-sale.json`.
- Produces: session authentication, searchable work list, editing form, image preview/replacement, publish/recommend controls, import/export, delete confirmation, and GitHub save status.

- [ ] Write structural tests for Chinese labels, token password field, no public navigation link, all schema inputs, `sessionStorage` use, import/export buttons, delete dialog, and accessible status regions.
- [ ] Run `node --test tests/admin-page.test.mjs`; expect failure because the page is absent.
- [ ] Build the dense two-column administration interface with a single-column mobile layout, familiar form controls, clear dirty/saving/saved/error states, and the existing brand assets.
- [ ] Implement load, selection, add, edit, draft/published toggle, recommended toggle, image base64 preparation, import, export, delete confirmation, conflict refresh guidance, and multi-file GitHub commit.
- [ ] Keep the token only in `sessionStorage`; clear it on explicit logout and never add it to exported JSON.
- [ ] Run structural tests and browser-check create/edit/export workflows without a real GitHub write.
- [ ] Commit the administration page.

### Task 7: Full Verification And Publication

**Files:**
- Modify only files required by defects found in verification.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a verified `main` and `gh-pages` release.

- [ ] Run `node --test tests/*.test.mjs`; expect all tests to pass.
- [ ] Run syntax checks for every `.js` and `.mjs`, `git diff --check`, duplicate-image hash checks, missing-image checks, and a scan proving no token-like value was committed.
- [ ] Serve locally and browser-check `works.html` plus `admin/works.html` at desktop and mobile sizes; verify no console errors, broken images, clipping, or horizontal overflow.
- [ ] Confirm draft PPT candidates are visible in administration but absent from the public catalog.
- [ ] Commit any verification fixes, push `main`, synchronize `gh-pages`, wait for GitHub Pages success, and verify the live public and administration URLs return HTTP 200.
