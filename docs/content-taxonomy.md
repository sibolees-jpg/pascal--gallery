# Pascal Gallery Content Taxonomy

This repository organizes archive material into five top-level categories.

## Categories

| Category ID | Label | Use for |
| --- | --- | --- |
| `works` | 作品 | Artwork records, images, object metadata, project notes |
| `exhibitions` | 展览 | Exhibition pages, installation views, dates, venues, press text |
| `artists` | 艺术家 | Artist profiles, biographies, portraits, related works |
| `texts` | 文献 | Curatorial essays, interviews, research notes, manuscripts |
| `media` | 媒体资料 | Posters, event photos, press kits, videos, downloadable assets |

## Data Rules

- Every record in `data/artworks.json` must include `id`, `title`, `artist`, `year`, `medium`, `category`, `series`, `status`, `image`, and `description`.
- `category` must match one of the IDs in `data/categories.json`.
- Store uploaded images in `assets/` and reference them with relative paths such as `assets/work-001.jpg`.
- Keep placeholder records until real archive material is ready, then replace them one by one.
