# Gallery Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将帕斯卡画廊公开前台改造成图片主导、档案清晰的当代画廊网站，同时保持现有作品后台和 GitHub Pages 数据契约不变。

**Architecture:** 保持无框架静态 HTML/CSS/JavaScript。首页继续消费 `data/cases.json` 与 `data/xu-services.json`，案例页由现有视图模型生成；改版通过精简 HTML 模块、调整渲染模板和增加独立前台样式实现，不触碰 `admin/` 与 GitHub 提交客户端。

**Tech Stack:** HTML5、CSS3、原生 ES Modules、Node.js `node:test`、GitHub Pages。

## Global Constraints

- 全站中文，品牌、艺术家和展览原名可保留。
- 白色背景、黑色文字、鲜绿点缀。
- 真实项目与作品图片必须保持原比例完整显示。
- 不改变作品、案例和服务 JSON 的既有字段契约。
- 不修改 `admin/`、GitHub 令牌或作品提交逻辑。
- 桌面 1440px 与手机 390px 均不得横向溢出。

---

### Task 1: 首页编辑式结构

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: `data/cases.json` 中公开案例、`data/xu-services.json` 中五项服务。
- Produces: `#editorial-grid` 最新内容网格、`#service-index` 服务文字目录。

- [ ] **Step 1: 写失败测试**

在 `tests/site-structure.test.mjs` 断言首页包含 `#editorial-grid`、`#service-index`、展览与动态入口，并不再包含 `case-matrix` 与 `scenario-grid`。

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/site-structure.test.mjs`
Expected: FAIL，提示缺少新的编辑式结构。

- [ ] **Step 3: 实现首页结构与渲染**

将首页压缩为：真实展览首屏、最新内容网格、方法横条、服务目录、机构网络、合作入口。`app.js` 使用公开案例前 6 条生成不同跨度的内容项，并继续显示服务相关案例数量。

- [ ] **Step 4: 添加编辑式样式**

在 `styles.css` 增加 `.editorial-grid`、`.editorial-item`、`.service-index`，移除首页对重复企业卡片布局的依赖。图片使用 `object-fit: contain`。

- [ ] **Step 5: 验证并提交**

Run: `node --test tests/site-structure.test.mjs`
Expected: PASS。

Commit: `Redesign homepage as gallery editorial`

### Task 2: 案例档案目录与搜索

**Files:**
- Modify: `cases.html`
- Modify: `cases.js`
- Modify: `case-page-view-model.mjs`
- Modify: `styles.css`
- Test: `tests/case-pages.test.mjs`

**Interfaces:**
- Consumes: `getCaseListViewModel(cases, services, requestedService, searchTerm?)`。
- Produces: 服务筛选、关键词搜索、图片主导的 `.case-archive-grid`。

- [ ] **Step 1: 写失败测试**

新增搜索测试：标题、地点、项目类型和摘要均可匹配；HTML 必须含 `#case-search`，脚本必须输出 `case-archive-grid`。

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/case-pages.test.mjs`
Expected: FAIL，当前视图模型没有搜索参数。

- [ ] **Step 3: 实现搜索视图模型和页面控件**

扩展 `getCaseListViewModel` 的可选搜索参数；在 `cases.js` 监听输入并渲染过滤后的公开案例。

- [ ] **Step 4: 改为编辑式案例网格**

案例卡只显示完整图片、项目名、年份、地点和类型；横竖图允许不同网格跨度，空结果保留中文提示。

- [ ] **Step 5: 验证并提交**

Run: `node --test tests/case-pages.test.mjs tests/case-tools.test.mjs`
Expected: PASS。

Commit: `Build searchable case archive`

### Task 3: 案例详情编辑式排版

**Files:**
- Modify: `case-page.js`
- Modify: `styles.css`
- Test: `tests/case-pages.test.mjs`

**Interfaces:**
- Consumes: 现有案例详情字段与图片数组。
- Produces: `.case-editorial-hero`、`.case-story`、`.case-image-sequence`。

- [ ] **Step 1: 写失败测试**

断言详情脚本包含新的英雄区、叙事正文与图片序列类名，且仍渲染背景、问题、职责、过程、成果和交付物。

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/case-pages.test.mjs`
Expected: FAIL，当前仍是报告式成组区块。

- [ ] **Step 3: 重组详情模板**

首图与项目事实构成第一屏；正文限制阅读宽度；图片按原比例顺序展示并保留图注；相关服务与案例放到页面尾部。

- [ ] **Step 4: 验证并提交**

Run: `node --test tests/case-pages.test.mjs tests/case-data.test.mjs`
Expected: PASS。

Commit: `Redesign case detail storytelling`

### Task 4: 作品页与关于页视觉统一

**Files:**
- Modify: `works.html`
- Modify: `about.html`
- Modify: `styles.css`
- Test: `tests/works-page.test.mjs`
- Test: `tests/gallery-profile.test.mjs`

**Interfaces:**
- Consumes: 现有作品筛选与机构数据。
- Produces: 开放式作品墙、紧凑目录、档案式机构时间线。

- [ ] **Step 1: 写失败测试**

断言作品页具有 `works-editorial` 标识、关于页具有 `profile-archive` 标识，同时继续保留双分类、搜索和完整图片规则。

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/works-page.test.mjs tests/gallery-profile.test.mjs`
Expected: FAIL，缺少新视觉标识。

- [ ] **Step 3: 调整页面类名与样式**

推荐作品去除卡片阴影与大面积底色；目录提高扫描密度；关于页用年份和事件并列排版，大图保持完整宽度。

- [ ] **Step 4: 验证并提交**

Run: `node --test tests/works-page.test.mjs tests/gallery-profile.test.mjs`
Expected: PASS。

Commit: `Unify artwork and profile archive styling`

### Task 5: 全站验证与发布

**Files:**
- Modify only if verification exposes defects.

**Interfaces:**
- Consumes: 完成后的静态站点。
- Produces: 已发布 GitHub Pages 版本。

- [ ] **Step 1: 运行完整测试**

Run: `node --test tests/*.test.mjs`
Expected: 0 failures。

- [ ] **Step 2: 浏览器视觉检查**

在 1440×1000 和 390×844 检查首页、案例目录、案例详情、作品页和关于页；验证无横向溢出、图片均加载、所有内容图使用 `contain`。

- [ ] **Step 3: 同步远端作品数据**

Run: `git fetch origin`，合并最新 `origin/main`，确保后台新提交作品未被覆盖。

- [ ] **Step 4: 再次测试并推送**

Run: `node --test tests/*.test.mjs && git push origin main`
Expected: 测试通过，GitHub Pages 部署成功。

- [ ] **Step 5: 线上回查**

检查首页新结构、案例搜索和至少一个案例图片 URL 返回 200。
