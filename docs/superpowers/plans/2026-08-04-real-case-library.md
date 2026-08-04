# 帕斯卡画廊真实案例库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页和服务页的通用案例类型入口改造成“服务分类 → 真实项目列表 → 项目详情”的公开案例库。

**Architecture:** 新建独立的公开案例数据文件和无 DOM 依赖的数据查询模块，`cases.html` 与 `case.html` 共享该数据。首页和服务页只生成指向统一案例路由的链接，项目内容及图片均从用户提供的源资料中提取，并按公开边界筛选。

**Tech Stack:** GitHub Pages、静态 HTML、CSS、原生 JavaScript ES modules、JSON、Node.js 内置测试运行器。

## Global Constraints

- 全站公开页面使用中文。
- 保持白色背景与鲜绿色点缀。
- GitHub Pages 不包含融资金额、估值、股权、成本、报价、财务预测和投资条款。
- `/Users/sli001/Desktop/xu/` 与 `/Volumes/Elements/项目/` 只读，不修改源文件。
- 所有公开项目事实和图片必须能够追溯到用户提供资料；无法确认的字段从公开页面省略。
- 桌面端和手机端不得出现横向滚动、文字截断或导航重叠。
- 所有生产代码遵循测试先行：先看到测试因缺少行为而失败，再实现最小改动。

---

### Task 1: 建立可追溯的真实案例数据

**Files:**
- Create: `data/cases.json`
- Create: `docs/case-source-audit.md`
- Create: `tests/case-data.test.mjs`
- Create: `assets/cases/<case-id>/...`

**Interfaces:**
- Produces: `data/cases.json`，顶层包含 `cases: Case[]`。
- Produces: `Case` 字段为 `id`, `title`, `year`, `location`, `services`, `type`, `summary`, `background`, `challenge`, `responsibilities`, `process`, `outcomes`, `deliverables`, `images`, `publicStatus`。
- Produces: `Image` 字段为 `src`, `alt`, `caption`。

- [ ] **Step 1: 读取源资料并建立资料审计表**

逐项读取 `/Users/sli001/Desktop/xu/` 中的 PPT/PPTX/PDF/DOCX，记录真实项目名、时间、地点、工作内容、成果、可用图片和来源文件。若 `/Volumes/Elements/项目/` 可用则一并只读检查；不可用时在审计表中记录挂载状态。

- [ ] **Step 2: 写数据契约失败测试**

```js
test("公开案例均为真实项目并具备详情页字段", async () => {
  const { cases } = JSON.parse(await readFile(new URL("../data/cases.json", import.meta.url), "utf8"));
  assert.ok(cases.length >= 8);
  for (const item of cases) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.ok(item.title && item.summary && item.background && item.challenge);
    assert.ok(item.services.length >= 1);
    assert.ok(item.responsibilities.length >= 1);
    assert.ok(item.outcomes.length >= 1);
    assert.equal(item.publicStatus, "public");
  }
});
```

- [ ] **Step 3: 运行测试并确认失败**

Run: `node --test tests/case-data.test.mjs`

Expected: FAIL，因为 `data/cases.json` 尚不存在。

- [ ] **Step 4: 创建案例数据并复制获准公开的图片**

数据只写源资料能够确认的内容。图片统一放入 `assets/cases/<case-id>/`，文件名使用小写 ASCII；没有可靠图片时使用空数组，不放入无关占位图。

- [ ] **Step 5: 运行数据测试并提交**

Run: `node --test tests/case-data.test.mjs`

Expected: PASS。

Commit: `Add sourced public case records`

---

### Task 2: 建立案例查询模块

**Files:**
- Create: `case-tools.mjs`
- Create: `tests/case-tools.test.mjs`

**Interfaces:**
- Consumes: `Case[]` from `data/cases.json`。
- Produces: `getCaseById(cases, id): Case | null`。
- Produces: `filterCasesByService(cases, serviceId): Case[]`。
- Produces: `getRelatedCases(cases, currentCase, limit = 3): Case[]`。
- Produces: `isKnownService(services, serviceId): boolean`。

- [ ] **Step 1: 写查询行为失败测试**

```js
test("按服务筛选并查找相关真实案例", () => {
  assert.equal(getCaseById(cases, "mian-san-sculpture")?.title, "棉三雕塑");
  assert.ok(filterCasesByService(cases, "landscape_art").some(item => item.id === "mian-san-sculpture"));
  assert.ok(getRelatedCases(cases, cases[0], 3).every(item => item.id !== cases[0].id));
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/case-tools.test.mjs`

Expected: FAIL，因为 `case-tools.mjs` 尚不存在。

- [ ] **Step 3: 实现纯数据查询函数**

函数不读取 DOM、不修改输入数组；无效编号返回 `null`，无效服务筛选返回全部公开案例。

- [ ] **Step 4: 运行测试并提交**

Run: `node --test tests/case-tools.test.mjs`

Expected: PASS。

Commit: `Add case library query helpers`

---

### Task 3: 制作案例目录与详情页

**Files:**
- Create: `cases.html`
- Create: `cases.js`
- Create: `case.html`
- Create: `case-page.js`
- Create: `tests/case-pages.test.mjs`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `data/cases.json`, `data/xu-services.json`, `case-tools.mjs`。
- Route: `cases.html?service=<service-id>`。
- Route: `case.html?id=<case-id>`。

- [ ] **Step 1: 写页面结构失败测试**

```js
test("案例目录与详情模板使用统一数据和中文状态", async () => {
  assert.match(casesHtml, /id="case-grid"/);
  assert.match(casesHtml, /案例目录/);
  assert.match(caseHtml, /id="case-detail"/);
  assert.match(casePageJs, /未找到这个案例/);
  assert.match(casePageJs, /返回案例目录/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/case-pages.test.mjs`

Expected: FAIL，因为页面文件尚不存在。

- [ ] **Step 3: 实现案例目录**

渲染五项服务筛选、项目卡片、封面、年份、地点、类型、摘要和“查看案例”链接。URL 中存在有效 `service` 时自动选中筛选；无结果时显示“该分类的公开案例正在整理”。

- [ ] **Step 4: 实现案例详情**

渲染概览、背景、核心问题、职责、过程、成果、交付物、图片、关联服务和相关案例。无效 `id` 显示“未找到这个案例”和返回链接；没有图片时显示“项目影像资料正在整理”。

- [ ] **Step 5: 完成响应式样式并运行测试**

Run: `node --test tests/case-pages.test.mjs && node --check cases.js && node --check case-page.js`

Expected: PASS，脚本语法检查退出码为 0。

- [ ] **Step 6: 提交**

Commit: `Add browsable real case pages`

---

### Task 4: 将现有入口连接到真实案例库

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `service-page.js`
- Modify: `services/art-sales.html`
- Modify: `services/art-space-rental.html`
- Modify: `services/cultural-tourism.html`
- Modify: `services/design.html`
- Modify: `services/landscape-art.html`
- Modify: `tests/site-structure.test.mjs`
- Modify: `tests/service-content.test.mjs`

**Interfaces:**
- Consumes: `cases.html?service=<service-id>` 与 `case.html?id=<case-id>`。
- Existing service descriptions remain in `data/xu-services.json` as methods, not concrete case records.

- [ ] **Step 1: 写链接行为失败测试**

```js
test("首页分类和服务页相关项目均进入真实案例库", async () => {
  assert.match(indexHtml, /cases\.html\?service=design/);
  assert.doesNotMatch(appJs, /href="#case-/);
  assert.match(appJs, /case\.html\?id=/);
  assert.match(servicePageJs, /case\.html\?id=/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/site-structure.test.mjs tests/service-content.test.mjs`

Expected: FAIL，因为现有链接仍指向首页锚点。

- [ ] **Step 3: 修改首页和导航入口**

场景与案例分类使用有效服务参数进入 `cases.html`；首页代表项目从 `data/cases.json` 读取并直接链接详情页；主导航“案例”统一指向案例目录。

- [ ] **Step 4: 修改五个服务页相关案例**

服务页加载真实案例数据，按服务编号筛选，并将每张相关案例卡链接到统一详情页。

- [ ] **Step 5: 运行测试并提交**

Run: `node --test tests/site-structure.test.mjs tests/service-content.test.mjs tests/case-data.test.mjs tests/case-tools.test.mjs tests/case-pages.test.mjs`

Expected: PASS。

Commit: `Connect site navigation to real cases`

---

### Task 5: 全站验证与 GitHub Pages 发布

**Files:**
- Modify: only files required by verified defects

**Interfaces:**
- Verifies all public routes and responsive layouts.

- [ ] **Step 1: 运行完整自动化检查**

Run: `node --test tests/*.test.mjs`

Run: `node --check app.js && node --check works.js && node --check service-page.js && node --check service-tools.mjs && node --check cases.js && node --check case-page.js && node --check case-tools.mjs`

Run: `git diff --check`

Expected: 所有命令退出码为 0。

- [ ] **Step 2: 浏览器桌面验证**

检查首页、一个服务页、案例目录、至少两个案例详情和在售作品页；确认分类筛选、详情链接、返回入口、图片和中文错误状态有效，控制台无错误。

- [ ] **Step 3: 浏览器手机验证**

使用 390×844 视口检查同一组页面，确认 `document.documentElement.scrollWidth <= window.innerWidth`，并检查导航、卡片、图片和长文本不重叠。

- [ ] **Step 4: 发布并核对线上状态**

将确认后的提交同步到 `main` 和 `gh-pages`，等待 `Deploy GitHub Pages` 成功，然后打开 `https://sibolees-jpg.github.io/pascal--gallery/` 验证新版案例入口和详情页。

