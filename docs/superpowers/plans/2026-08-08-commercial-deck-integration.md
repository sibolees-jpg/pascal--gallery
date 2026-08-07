# 商业宣传内容网站整合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将商业宣传 PPT 的机构逻辑、服务方法、发展资料和商业案例完整融入现有中文网站。

**Architecture:** 使用 `data/gallery-profile.json` 承载机构资料，首页与关于页分别承担概览和详细叙事；服务继续使用 `data/xu-services.json`；真实商业项目继续进入 `data/cases.json` 并复用现有案例详情页。PPT 原始媒体提取到独立资产目录。

**Tech Stack:** 静态 HTML、CSS、原生 JavaScript、JSON、Node.js 内置测试、GitHub Pages。

## Global Constraints

- 全中文、白底与鲜绿色点缀。
- 保持现有五项服务分类，不新增第六项服务。
- GitHub Pages 只展示公开内容，不放融资内容。
- 只使用 PPT 可验证的事实与真实项目图片。
- 作品与项目图片完整等比显示，不裁切主体。

---

### Task 1: 机构资料数据与关于页

**Files:**
- Create: `data/gallery-profile.json`
- Create: `about.html`
- Create: `about.js`
- Modify: `styles.css`
- Test: `tests/gallery-profile.test.mjs`

**Interfaces:**
- Consumes: PPT 提取出的机构概述、团队、展览和方法论内容。
- Produces: `gallery-profile.json` 中的 `identity`、`founder`、`network`、`timeline`、`method` 字段。

- [ ] 编写失败测试，验证机构统计、创办年份、方法论和 2017—2024 时间线。
- [ ] 运行 `node --test tests/gallery-profile.test.mjs` 并确认失败。
- [ ] 创建机构数据、关于页和渲染脚本。
- [ ] 增加关于页响应式样式和真实图片区域。
- [ ] 运行测试并确认通过。

### Task 2: 首页定位与业务逻辑

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: Task 1 的机构定位与方法论。
- Produces: 首页“城市文化基础设施”“艺术 × 商业 × 消费 × 服务”“资源网络”三个概览区。

- [ ] 编写失败测试，验证首页包含新定位、方法论和关于页入口。
- [ ] 运行定向测试并确认失败。
- [ ] 更新首页信息层级、导航和内容区。
- [ ] 运行定向测试并确认通过。

### Task 3: 五项服务内容增强

**Files:**
- Modify: `data/xu-services.json`
- Modify: `tests/service-content.test.mjs`

**Interfaces:**
- Consumes: 城市更新、在地性、艺术租赁、艺术会客厅、商业设计和衍生品内容。
- Produces: 每项服务的 `principles`、扩展 `capabilities` 与具体 `scenarios`。

- [ ] 编写失败测试，验证 PPT 逻辑被映射到五项服务且无新增服务分类。
- [ ] 运行定向测试并确认失败。
- [ ] 扩展服务 JSON 内容。
- [ ] 运行定向测试并确认通过。

### Task 4: 商业合作案例与真实图片

**Files:**
- Modify: `data/cases.json`
- Create: `assets/cases/lv-book-pop-up/cover.jpg`
- Create: `assets/cases/lv-shanghai-pop-up/cover.jpg`
- Create: `assets/cases/lv-trunk-home/cover.jpg`
- Create: `assets/cases/under-clouds-restaurant/cover.jpg`
- Create: `assets/cases/sunset-sphere/cover.jpg`
- Modify: `tests/case-data.test.mjs`

**Interfaces:**
- Consumes: PPT 第 40—44 页的项目名称与原始媒体。
- Produces: 五个 `publicStatus: "public"` 案例，复用 `case.html?id=<case-id>`。

- [ ] 编写失败测试，验证五个项目、服务映射、来源页码和封面文件。
- [ ] 运行定向测试并确认失败。
- [ ] 从 PPT 原始媒体提取并检查五张封面。
- [ ] 添加五个案例数据，不补写未经支持的项目成效。
- [ ] 运行定向测试并确认通过。

### Task 5: 全站验证与发布

**Files:**
- Modify as required: `README.md`

**Interfaces:**
- Consumes: Tasks 1—4 的完整网站。
- Produces: 可公开访问的 GitHub Pages 版本。

- [ ] 运行 `node --test tests/*.test.mjs`。
- [ ] 运行 `node scripts/build-public-site.mjs`。
- [ ] 在桌面与手机视口检查首页、关于页、服务页和案例页。
- [ ] 检查图片非空、完整显示且页面无水平溢出。
- [ ] 提交并推送 `main`，等待 GitHub Pages 成功部署。
