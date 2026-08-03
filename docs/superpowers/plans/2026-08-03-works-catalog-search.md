# 在售作品目录搜索与双分类实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为“在售作品”详细目录增加右侧搜索框，并支持“艺术品种类 / 艺术家”两种分类方式。

**Architecture:** 将分类生成、文本匹配和组合筛选提取到独立的纯函数模块 `catalog-tools.mjs`，由 `works.js` 维护当前分类模式、分类值和搜索词，并统一渲染分类按钮及目录。页面结构与样式继续沿用现有静态 GitHub Pages，不引入后端或第三方依赖。

**Tech Stack:** HTML5、CSS3、原生 JavaScript ES Modules、Node.js 内置测试运行器、GitHub Pages。

## Global Constraints

- GitHub Pages 只包含公开展示内容，不添加融资内容。
- 所有新增界面文字必须为中文。
- 初始模式为“艺术品种类”，初始分类为“全部”，搜索词为空。
- 切换分类模式时重置分类为“全部”，但保留搜索词。
- 分类数量显示分类总作品数，不随搜索词变化。
- 桌面端搜索框位于工具栏右侧；窄屏下换行并占满可用宽度。
- 不改变 `data/works-for-sale.json` 的字段结构。
- 不修改或提交未跟踪的 `outputs/`。

---

### Task 1: 可测试的分类与搜索规则

**Files:**
- Create: `catalog-tools.mjs`
- Create: `tests/catalog-tools.test.mjs`

**Interfaces:**
- Consumes: 作品对象中的 `inventoryNo`、`artist`、`title`、`year`、`medium`、`category`、`categoryLabel`、`price`、`status` 和 `notes` 字段。
- Produces: `buildCategoryOptions(mode, configuredCategories, works)` 返回 `Array<{ id: string, label: string, count: number }>`；`filterWorks(works, mode, selectedId, query)` 返回匹配作品数组。

- [ ] **Step 1: 编写分类生成失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildCategoryOptions } from "../catalog-tools.mjs";

const works = [
  { id: "1", category: "painting", categoryLabel: "绘画", artist: "张三" },
  { id: "2", category: "painting", categoryLabel: "绘画", artist: "李四" },
  { id: "3", category: "sculpture", categoryLabel: "雕塑", artist: "张三" }
];
const categories = [
  { id: "all", label: "全部" },
  { id: "painting", label: "绘画" },
  { id: "sculpture", label: "雕塑" }
];

test("按作品种类生成分类及固定数量", () => {
  assert.deepEqual(buildCategoryOptions("category", categories, works), [
    { id: "all", label: "全部", count: 3 },
    { id: "painting", label: "绘画", count: 2 },
    { id: "sculpture", label: "雕塑", count: 1 }
  ]);
});

test("按艺术家去重并生成数量", () => {
  assert.deepEqual(buildCategoryOptions("artist", categories, works), [
    { id: "all", label: "全部", count: 3 },
    { id: "张三", label: "张三", count: 2 },
    { id: "李四", label: "李四", count: 1 }
  ]);
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test tests/catalog-tools.test.mjs`  
Expected: FAIL，提示无法找到 `catalog-tools.mjs`。

- [ ] **Step 3: 实现最小分类生成函数**

```js
export function buildCategoryOptions(mode, configuredCategories, works) {
  if (mode === "artist") {
    const artists = [...new Set(works.map((work) => work.artist))];
    return [
      { id: "all", label: "全部", count: works.length },
      ...artists.map((artist) => ({
        id: artist,
        label: artist,
        count: works.filter((work) => work.artist === artist).length
      }))
    ];
  }

  return configuredCategories.map((category) => ({
    ...category,
    count: category.id === "all"
      ? works.length
      : works.filter((work) => work.category === category.id).length
  }));
}
```

- [ ] **Step 4: 运行测试并确认分类测试通过**

Run: `node --test tests/catalog-tools.test.mjs`  
Expected: 2 tests PASS。

- [ ] **Step 5: 编写组合筛选失败测试**

```js
import { buildCategoryOptions, filterWorks } from "../catalog-tools.mjs";

const searchableWorks = [
  {
    inventoryNo: "PG-001", artist: "张三", title: "春风", year: "2025",
    medium: "布面油画", category: "painting", categoryLabel: "绘画",
    price: "询价", status: "在售", notes: "绿色作品"
  },
  {
    inventoryNo: "PG-002", artist: "李四", title: "城市", year: "2024",
    medium: "不锈钢", category: "sculpture", categoryLabel: "雕塑",
    price: "20万元", status: "可洽谈", notes: "室外安装"
  }
];

test("搜索忽略大小写和首尾空格并匹配多个字段", () => {
  assert.deepEqual(
    filterWorks(searchableWorks, "category", "all", "  pg-002 "),
    [searchableWorks[1]]
  );
  assert.deepEqual(
    filterWorks(searchableWorks, "category", "all", "布面"),
    [searchableWorks[0]]
  );
});

test("分类和搜索条件同时生效", () => {
  assert.deepEqual(
    filterWorks(searchableWorks, "artist", "张三", "2025"),
    [searchableWorks[0]]
  );
  assert.deepEqual(
    filterWorks(searchableWorks, "category", "sculpture", "绿色"),
    []
  );
});
```

- [ ] **Step 6: 运行测试并确认因 `filterWorks` 未导出而失败**

Run: `node --test tests/catalog-tools.test.mjs`  
Expected: FAIL，提示模块没有导出 `filterWorks`。

- [ ] **Step 7: 实现最小组合筛选函数**

```js
const SEARCH_FIELDS = [
  "inventoryNo", "artist", "title", "year", "medium",
  "categoryLabel", "price", "status", "notes"
];

export function filterWorks(works, mode, selectedId, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  return works.filter((work) => {
    const matchesCategory = selectedId === "all"
      || (mode === "artist"
        ? work.artist === selectedId
        : work.category === selectedId);
    const searchableText = SEARCH_FIELDS
      .map((field) => String(work[field] ?? ""))
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return matchesCategory
      && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
}
```

- [ ] **Step 8: 运行全部逻辑测试**

Run: `node --test tests/catalog-tools.test.mjs`  
Expected: 4 tests PASS。

- [ ] **Step 9: 提交纯逻辑和测试**

```bash
git add catalog-tools.mjs tests/catalog-tools.test.mjs
git commit -m "Add catalog filtering logic"
```

### Task 2: 页面控件与状态联动

**Files:**
- Modify: `works.html`
- Modify: `works.js`
- Test: `tests/catalog-tools.test.mjs`

**Interfaces:**
- Consumes: Task 1 导出的 `buildCategoryOptions` 与 `filterWorks`。
- Produces: `#classification-modes` 模式按钮组、`#work-search` 搜索输入框、由 `renderCatalogControls()` 和 `applyCatalogFilters()` 驱动的目录状态。

- [ ] **Step 1: 在 HTML 中加入模式切换和搜索控件**

```html
<div class="catalog-toolbar">
  <div
    id="classification-modes"
    class="classification-modes"
    aria-label="分类方式"
  >
    <button type="button" data-mode="category" aria-pressed="true">艺术品种类</button>
    <button type="button" data-mode="artist" aria-pressed="false">艺术家</button>
  </div>
  <label class="work-search" for="work-search">
    <span>搜索作品</span>
    <input
      id="work-search"
      type="search"
      placeholder="搜索艺术家、作品名或编号"
      autocomplete="off"
    >
  </label>
</div>
<div id="work-filters" class="filters" aria-label="在售作品筛选"></div>
```

- [ ] **Step 2: 将 `works.js` 改为 ES Module 并接入统一页面状态**

```js
import { buildCategoryOptions, filterWorks } from "./catalog-tools.mjs";

const classificationModes = document.querySelector("#classification-modes");
const workSearch = document.querySelector("#work-search");

const catalogState = {
  mode: "category",
  selectedId: "all",
  query: "",
  categories: [],
  works: []
};

function renderCatalogControls() {
  const options = buildCategoryOptions(
    catalogState.mode,
    catalogState.categories,
    catalogState.works
  );
  renderFilters(options);
}

function applyCatalogFilters() {
  renderCatalog(filterWorks(
    catalogState.works,
    catalogState.mode,
    catalogState.selectedId,
    catalogState.query
  ));
}
```

在 `renderWorksPage(data)` 中保存 `data.categories` 与 `data.works`，再依次调用 `renderCatalogControls()` 和 `applyCatalogFilters()`。将原 `renderFilters(categories, works)` 改为只接收带 `count` 的 options，并让按钮点击只更新 `selectedId` 后调用 `applyCatalogFilters()`。

- [ ] **Step 3: 加入模式切换和实时搜索事件**

```js
classificationModes.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (!button || button.dataset.mode === catalogState.mode) return;

  catalogState.mode = button.dataset.mode;
  catalogState.selectedId = "all";
  classificationModes.querySelectorAll("button").forEach((modeButton) => {
    modeButton.setAttribute("aria-pressed", String(modeButton === button));
  });
  renderCatalogControls();
  applyCatalogFilters();
});

workSearch.addEventListener("input", () => {
  catalogState.query = workSearch.value;
  applyCatalogFilters();
});
```

- [ ] **Step 4: 更新无结果提示与模块脚本声明**

```js
workCatalog.innerHTML = `
  <p class="empty-state">没有找到符合条件的作品，请调整分类或搜索词。</p>
`;
```

将 `works.html` 底部脚本改为：

```html
<script type="module" src="works.js"></script>
```

- [ ] **Step 5: 运行逻辑测试和 JavaScript 语法检查**

Run: `node --test tests/catalog-tools.test.mjs && node --check works.js && node --check catalog-tools.mjs`  
Expected: 4 tests PASS，两个语法检查退出码均为 0。

- [ ] **Step 6: 提交页面功能**

```bash
git add works.html works.js
git commit -m "Add catalog search and classification controls"
```

### Task 3: 视觉样式与响应式验收

**Files:**
- Modify: `styles.css`
- Test: `tests/catalog-tools.test.mjs`

**Interfaces:**
- Consumes: Task 2 的 `.catalog-toolbar`、`.classification-modes` 和 `.work-search` DOM 结构。
- Produces: 桌面端右对齐搜索框、鲜绿色选中状态以及移动端单列布局。

- [ ] **Step 1: 添加桌面端工具栏与控件样式**

```css
:root {
  --fresh-green: #8cff32;
}

.catalog-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.classification-modes {
  display: inline-flex;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 6px;
}

.classification-modes button {
  border: 0;
  border-radius: 4px;
  padding: 10px 16px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}

.classification-modes button[aria-pressed="true"] {
  background: var(--fresh-green);
  color: var(--ink);
}

.work-search {
  display: grid;
  gap: 6px;
  width: min(360px, 100%);
}
```

搜索框标签保持小号中文文字，输入框使用现有边框色、白色背景、6px 以内圆角，并在聚焦时使用 `var(--fresh-green)` 显示轮廓。现有红色 `--accent` 保持不变，避免影响其他页面。

- [ ] **Step 2: 添加窄屏布局**

```css
@media (max-width: 720px) {
  .catalog-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .classification-modes {
    align-self: flex-start;
  }

  .work-search {
    width: 100%;
  }
}
```

- [ ] **Step 3: 运行自动化检查**

Run: `node --test tests/catalog-tools.test.mjs && git diff --check`  
Expected: 4 tests PASS，`git diff --check` 无输出。

- [ ] **Step 4: 启动本地静态服务器并检查桌面端**

Run: `python3 -m http.server 4174`  
Open: `http://127.0.0.1:4174/works.html`

确认：
- 默认显示“艺术品种类”和六个现有种类按钮。
- 搜索框位于工具栏右侧。
- 输入 `PG-SALE-003` 后只显示对应作品。
- 切换“艺术家”后按钮由作品的艺术家字段生成。
- 分类与搜索组合生效，清空搜索后恢复当前分类作品。
- 无结果时显示指定中文提示。

- [ ] **Step 5: 检查 390×844 手机端**

确认页面宽度与视口相同、无横向滚动；搜索框位于模式切换下方并占满宽度；目录行保持现有单列移动布局。

- [ ] **Step 6: 提交样式**

```bash
git add styles.css
git commit -m "Style catalog search controls"
```

### Task 4: 发布与在线验证

**Files:**
- Modify: none
- Test: GitHub Pages 在线资源

**Interfaces:**
- Consumes: Tasks 1-3 的已提交静态站点。
- Produces: `main` 与 `gh-pages` 上一致的功能版本。

- [ ] **Step 1: 运行最终验证**

Run: `node --test tests/catalog-tools.test.mjs && node --check works.js && node --check catalog-tools.mjs && git diff --check && git status --short`  
Expected: 所有测试通过；语法检查退出码为 0；仅保留无关的 `?? outputs/`。

- [ ] **Step 2: 推送发布分支**

```bash
git push origin main
git push origin main:gh-pages
```

- [ ] **Step 3: 验证 GitHub Pages**

Open: `https://sibolees-jpg.github.io/pascal--gallery/works.html`

确认页面返回 HTTP 200，在线资源包含“艺术品种类”“艺术家”和“搜索艺术家、作品名或编号”，并在浏览器中复查一次搜索和分类切换。
