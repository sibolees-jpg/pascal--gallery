# 帕斯卡画廊内容分类

本仓库把归档材料分成五个一级类别。

## 分类

| 分类编号 | 中文名称 | 用途 |
| --- | --- | --- |
| `works` | 作品 | 作品记录、图像、对象元数据和项目说明 |
| `exhibitions` | 展览 | 展览页面、现场图、日期、地点和新闻稿 |
| `artists` | 艺术家 | 艺术家简介、履历、肖像和相关作品 |
| `texts` | 文献 | 策展文章、访谈、研究笔记和手稿 |
| `media` | 媒体资料 | 海报、活动照片、媒体包、视频和下载资料 |

## 数据规则

- `data/artworks.json` 中每条记录都必须包含 `id`、`title`、`artist`、`year`、`medium`、`category`、`series`、`status`、`image` 和 `description`。
- `category` 必须对应 `data/categories.json` 里的某个分类编号。
- 上传后用于网页展示的图片放在 `assets/`，路径可写成 `assets/work-001.jpg`。
- 真实归档材料准备好之前，可以保留占位记录，之后逐条替换。
