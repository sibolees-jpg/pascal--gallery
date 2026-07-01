# Pascal Gallery Online Archive

Pascal Gallery is a lightweight online archive and web exhibition framework. It is designed for GitHub Pages and uses plain HTML, CSS, and JavaScript, so the site can be published without a build step.

The repository is also the long-term working archive. User uploads, edited web assets, generated drafts, structured data, and documentation each have their own folder so future material stays easy to find.

## Structure

- `index.html`, `styles.css`, and `app.js` are the public website.
- `data/` stores structured website data.
- `assets/` stores web-ready images and media referenced by the site.
- `content/uploads/` stores original files uploaded by the user.
- `content/archive/` stores categorized source material before it becomes website data.
- `content/notes/` stores working notes, captions, metadata drafts, and curatorial notes.
- `generated/` stores AI-assisted drafts, exports, previews, and temporary production outputs.
- `docs/` stores repository rules, taxonomy, and publishing notes.

## Add Archive Items

Edit `data/artworks.json` and add records with this shape:

```json
{
  "id": "work-001",
  "title": "Untitled Archive Entry",
  "artist": "Artist Name",
  "year": "2026",
  "medium": "Mixed media",
  "series": "Open Archive",
  "status": "Coming soon",
  "image": "",
  "description": "Short curatorial note."
}
```

If `image` is empty, the page shows a clean placeholder. Keep original uploads in `content/uploads/`, place optimized web images in `assets/`, and reference web images with paths like `assets/work-001.jpg`.

## Filing Rules

1. Put untouched uploaded files in `content/uploads/`.
2. Sort source material into `content/archive/works`, `content/archive/exhibitions`, `content/archive/artists`, `content/archive/texts`, or `content/archive/media`.
3. Put edited or compressed website assets in `assets/`.
4. Put AI-generated drafts and previews in `generated/`.
5. Promote only finalized public metadata into `data/`.

## Publish

In GitHub, open **Settings > Pages**, choose the `main` branch and root folder, then save. The static site will publish directly from this repository.
