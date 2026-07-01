# 仓库结构

本仓库把公开网页、原始上传、分类档案素材和生成草稿分开放置。

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

## 文件放置规则

| 文件夹 | 用途 |
| --- | --- |
| `/` | GitHub 静态网页服务使用的公开页面 |
| `data/` | 网页读取的结构化公开数据 |
| `assets/` | 优化后的公开图片和媒体素材 |
| `content/uploads/` | 未改动的用户原始上传 |
| `content/archive/` | 按归档类别整理后的素材 |
| `content/notes/` | 工作笔记和编辑草稿 |
| `generated/` | 生成草稿、预览和导出文件 |
| `docs/` | 仓库规则、分类说明和发布说明 |

## 内容进入网页的流程

1. 原始文件先放入 `content/uploads/`。
2. 分类后的素材放入 `content/archive/<category>/`。
3. 适合网页展示的编辑版素材放入 `assets/`。
4. 公开展示的记录写入 `data/artworks.json`。
5. 过程说明和工作笔记放入 `content/notes/` 或 `docs/`。
