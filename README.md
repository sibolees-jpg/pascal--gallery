# 帕斯卡画廊线上档案

这是帕斯卡画廊的线上归档与网页展示仓库。网页使用纯静态网页文件，可直接通过 GitHub 的静态网页服务发布，不需要构建步骤。

这个仓库也是长期工作档案。用户上传的原始文件、网页素材、生成草稿、结构化数据和说明文档各自放在固定位置，后续材料不会混在一起。

## 仓库结构

- `index.html`、`styles.css`、`app.js` 是公开网页。
- `data/` 存放网页读取的结构化数据。
- `assets/` 存放网页使用的图片和媒体素材。
- `content/uploads/` 存放用户上传的原始文件。
- `content/archive/` 存放整理后的分类档案素材。
- `content/notes/` 存放说明、题注、元数据草稿和策展笔记。
- `generated/` 存放生成草稿、导出文件、预览图和临时成果。
- `docs/` 存放仓库规则、分类说明和发布说明。

## 添加归档条目

编辑 `data/artworks.json`，按下面格式添加条目：

```json
{
  "id": "work-001",
  "title": "未命名归档条目",
  "artist": "艺术家姓名",
  "year": "2026",
  "medium": "综合媒介",
  "category": "works",
  "series": "开放归档",
  "status": "待补充",
  "image": "",
  "description": "简短的策展说明。"
}
```

如果 `image` 为空，网页会显示简洁占位图。原始上传文件保存在 `content/uploads/`，网页用的优化图片放在 `assets/`，图片路径可写成 `assets/work-001.jpg`。

## 文件归档规则

1. 原始上传文件先放进 `content/uploads/`。
2. 分类整理后的素材放进 `content/archive/works`、`content/archive/exhibitions`、`content/archive/artists`、`content/archive/texts` 或 `content/archive/media`。
3. 编辑、压缩、适合网页展示的素材放进 `assets/`。
4. 生成草稿、预览图和临时输出放进 `generated/`。
5. 只有确定公开展示的元数据才写入 `data/`。

## 发布

当前网页已通过 `gh-pages` 分支发布。正式访问地址是 `https://sibolees-jpg.github.io/pascal--gallery/`。
