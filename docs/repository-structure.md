# 仓库结构

本仓库把公开网页、授权素材和工作说明分开放置。公开网站不提交未确认授权的图片、PPT、截图、客户资料或抽取缓存。

```text
/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── xu-services.json
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
| `assets/` | 已确认授权的公开图片和媒体素材；当前网站不依赖图片 |
| `content/uploads/` | 目录说明；不提交未授权原始上传 |
| `content/archive/` | 目录说明；不提交未授权分类素材 |
| `content/notes/` | 目录说明；不提交客户原文或敏感摘录 |
| `generated/` | 目录说明；不提交抽取缓存、截图、PPT 或临时素材 |
| `docs/` | 仓库规则、分类说明和发布说明 |

## 内容进入网页的流程

1. 先确认素材和文字的授权状态。
2. 未确认授权的内容不进入公开仓库。
3. 可公开展示的概括性服务内容写入 `data/xu-services.json`。
4. 已确认授权的图片才放入 `assets/`。
5. 发布前扫描图片路径、来源文件名和第三方项目原文，确认无残留。
