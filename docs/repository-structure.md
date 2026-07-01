# Repository Structure

This repository keeps public website files, original uploads, source archive material, and generated drafts separate.

```text
/
├── index.html
├── styles.css
├── app.js
├── data/
│   ├── artworks.json
│   └── categories.json
├── assets/
├── content/
│   ├── uploads/
│   ├── archive/
│   │   ├── works/
│   │   ├── exhibitions/
│   │   ├── artists/
│   │   ├── texts/
│   │   └── media/
│   └── notes/
├── generated/
└── docs/
```

## What Goes Where

| Folder | Purpose |
| --- | --- |
| `/` | Public static website for GitHub Pages |
| `data/` | Structured public data consumed by the website |
| `assets/` | Optimized public images and media |
| `content/uploads/` | Untouched user uploads |
| `content/archive/` | Sorted source material by archive category |
| `content/notes/` | Working notes and editorial drafts |
| `generated/` | AI-generated drafts, previews, and exports |
| `docs/` | Repository rules, taxonomy, and publishing notes |

## Promotion Flow

1. Upload originals to `content/uploads/`.
2. Sort source files into `content/archive/<category>/`.
3. Create edited web assets in `assets/`.
4. Add public records to `data/artworks.json`.
5. Keep process notes in `content/notes/` or `docs/`.
