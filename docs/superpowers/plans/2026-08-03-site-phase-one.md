# 帕斯卡画廊网站第一阶段实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用正式完整标志重构网站首页，并建立五个内容完整、可分享的服务二级页面。

**Architecture:** 品牌资产由 `scripts/build-brand-assets.mjs` 从用户提供的原始 SVG 机械生成，网站只读取仓库内的品牌文件。首页与五个服务页共享 `data/xu-services.json`，二级页通过固定 `data-service-id` 和统一 ES Module 渲染，避免重复维护服务内容。

**Tech Stack:** HTML5、CSS3、原生 JavaScript ES Modules、Node.js 内置测试运行器、macOS Quick Look 与 sips、GitHub Pages。

## Global Constraints

- GitHub Pages 只展示公开内容，不包含融资金额、估值、股权、资金用途、财务预测或投资条款。
- 所有新增界面文字使用中文。
- 五项服务名称固定为：艺术品销售、艺术品与场地租赁、文旅项目策划、设计、景观艺术品制作施工。
- 页面和网页小图标均使用用户提供的完整正式标志，不拆字、不裁切、不改色。
- favicon 使用白色方形画布，完整标志等比居中并保留留白。
- 原始文件 `/Users/sli001/Downloads/Image 1_SVG(4).svg` 不修改。
- 未授权客户名称、项目图片、艺术家资料和第三方材料不公开。
- 延续白色背景与鲜绿色点缀。
- 不修改或提交未跟踪的 `outputs/`。

---

### Task 1: 正式标志与完整 favicon

**Files:**
- Create: `scripts/build-brand-assets.mjs`
- Create: `tests/brand-assets.test.mjs`
- Create: `assets/brand/pascal-gallery-logo.svg`
- Create: `assets/brand/favicon.svg`
- Create: `assets/brand/favicon-32.png`
- Create: `assets/brand/apple-touch-icon.png`

**Interfaces:**
- Consumes: 命令行第一个参数提供的原始 SVG 绝对路径。
- Produces: `buildBrandAssets(sourcePath, outputDirectory)`，复制完整标志并生成完整方形 favicon SVG；PNG 文件由同一 favicon SVG 渲染。

- [ ] **Step 1: 编写品牌资产失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildBrandAssets } from "../scripts/build-brand-assets.mjs";

test("生成的标志保留全部路径且 favicon 使用白色方形画布", async () => {
  const source = "/Users/sli001/Downloads/Image 1_SVG(4).svg";
  const output = await mkdtemp(join(tmpdir(), "pascal-brand-"));
  await buildBrandAssets(source, output);

  const original = await readFile(source, "utf8");
  const logo = await readFile(join(output, "pascal-gallery-logo.svg"), "utf8");
  const favicon = await readFile(join(output, "favicon.svg"), "utf8");
  const pathCount = (value) => value.match(/<path\b/g)?.length ?? 0;

  assert.equal(logo, original);
  assert.equal(pathCount(favicon), pathCount(original));
  assert.match(favicon, /viewBox="[^"]+ 1654 1654"/);
  assert.match(favicon, /<rect[^>]+fill="#ffffff"/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/brand-assets.test.mjs`  
Expected: FAIL，提示无法找到 `scripts/build-brand-assets.mjs`。

- [ ] **Step 3: 实现品牌资产生成器**

```js
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function buildBrandAssets(sourcePath, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const source = await readFile(sourcePath, "utf8");
  const openTag = source.match(/^<svg\b[^>]*>/)?.[0];
  const viewBox = openTag?.match(/viewBox="([^"]+)"/)?.[1]
    .split(/\s+/)
    .map(Number);

  if (!openTag || viewBox?.length !== 4 || viewBox.some(Number.isNaN)) {
    throw new Error("无法读取正式标志的 SVG 画布");
  }

  const [x, y, width, height] = viewBox;
  const squareY = y - (width - height) / 2;
  const body = source.slice(openTag.length, source.lastIndexOf("</svg>"));
  const favicon = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${x} ${squareY} ${width} ${width}">`,
    `<rect x="${x}" y="${squareY}" width="${width}" height="${width}" fill="#ffffff"/>`,
    body,
    "</svg>"
  ].join("");

  await copyFile(sourcePath, join(outputDirectory, "pascal-gallery-logo.svg"));
  await writeFile(join(outputDirectory, "favicon.svg"), favicon);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildBrandAssets(process.argv[2], process.argv[3] ?? "assets/brand");
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `node --test tests/brand-assets.test.mjs`  
Expected: 1 test PASS。

- [ ] **Step 5: 生成仓库内 SVG 品牌资产**

Run:

```bash
node scripts/build-brand-assets.mjs "/Users/sli001/Downloads/Image 1_SVG(4).svg" assets/brand
```

Expected: `pascal-gallery-logo.svg` 与 `favicon.svg` 存在，测试仍通过。

- [ ] **Step 6: 生成完整 PNG 图标**

Run:

```bash
qlmanage -t -s 512 -o /private/tmp assets/brand/favicon.svg
sips -z 32 32 "/private/tmp/favicon.svg.png" --out assets/brand/favicon-32.png
sips -z 180 180 "/private/tmp/favicon.svg.png" --out assets/brand/apple-touch-icon.png
```

Expected: 两个 PNG 均为方形，完整标志不被裁切。

- [ ] **Step 7: 提交品牌资产**

```bash
git add scripts/build-brand-assets.mjs tests/brand-assets.test.mjs assets/brand
git commit -m "Add official Pascal Gallery brand assets"
```

### Task 2: 服务二级页公开数据

**Files:**
- Modify: `data/xu-services.json`
- Create: `service-tools.mjs`
- Create: `tests/service-content.test.mjs`

**Interfaces:**
- Consumes: `data/xu-services.json` 的 `services` 与 `projects`。
- Produces: 每项服务新增 `slug`、`pageLead`、`audiences`、`problems`、`process`、`deliverables`；`getServiceById(data, id)` 与 `getRelatedProjects(data, id)`。

- [ ] **Step 1: 编写服务数据失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getRelatedProjects, getServiceById } from "../service-tools.mjs";

const data = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8")
);
const expectedIds = [
  "art_sales",
  "art_and_space_rental",
  "cultural_tourism",
  "design",
  "landscape_art"
];

test("五项服务均具备二级页完整字段", () => {
  assert.deepEqual(data.services.map(({ id }) => id), expectedIds);
  for (const service of data.services) {
    assert.match(service.slug, /^[a-z-]+$/);
    assert.ok(service.pageLead.length >= 20);
    for (const field of ["audiences", "problems", "capabilities", "process", "deliverables"]) {
      assert.ok(service[field].length >= 3, `${service.id} 缺少 ${field}`);
      assert.ok(service[field].every((item) => item.trim().length > 0));
    }
  }
});

test("按编号读取服务并关联案例", () => {
  assert.equal(getServiceById(data, "design").title, "设计");
  assert.ok(getRelatedProjects(data, "design").length >= 1);
  assert.equal(getServiceById(data, "missing"), null);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/service-content.test.mjs`  
Expected: FAIL，提示无法找到 `service-tools.mjs`。

- [ ] **Step 3: 实现服务读取函数**

```js
export function getServiceById(data, id) {
  return data.services.find((service) => service.id === id) ?? null;
}

export function getRelatedProjects(data, id) {
  return data.projects.filter((project) => project.services.includes(id));
}
```

- [ ] **Step 4: 扩充五项服务内容**

为每项服务写入以下固定 slug：

| id | slug |
| --- | --- |
| `art_sales` | `art-sales` |
| `art_and_space_rental` | `art-space-rental` |
| `cultural_tourism` | `cultural-tourism` |
| `design` | `design` |
| `landscape_art` | `landscape-art` |

页面长文案按以下内容矩阵写入，不出现“待补充”：

| 服务 | pageLead | audiences | problems | process | deliverables |
| --- | --- | --- | --- | --- | --- |
| 艺术品销售 | 以画廊长期积累的艺术家与作品资源，为个人收藏、企业配置及商业空间提供从选品到陈列的完整支持。 | 个人与企业收藏者；酒店、商业与会所；需要艺术品配置的设计及项目机构 | 不清楚如何选择匹配预算和空间的作品；作品、尺寸与陈列关系缺少系统判断；采购后仍需要运输、装裱和维护建议 | 明确预算与场景；建立作品方向；形成推荐清单；确认交易与交付；完成陈列建议 | 作品推荐清单；艺术家与作品资料；报价与交易文件；陈列配置建议；运输装裱建议 |
| 艺术品与场地租赁 | 通过艺术品短期陈列、展览落位和场地内容合作，为空间快速建立艺术氛围、活动主题与传播内容。 | 品牌活动与发布会；酒店、写字楼与商业空间；策展机构、艺术家及临时展览 | 短期项目不适合一次性采购；场地有空间但缺少内容；展览活动缺少作品、动线和现场执行 | 确认周期与场地；匹配作品或展览主题；制定空间与运输方案；完成布撤展；结项检查 | 艺术品租赁清单；场地使用方案；展陈动线；布撤展计划；现场执行清单 |
| 文旅项目策划 | 将地方文化、艺术内容、公共活动和消费场景组织成可体验、可传播、可持续运营的文旅产品。 | 文旅目的地与景区；城市街区和园区；政府、平台公司与运营机构 | 地方资源丰富但主题不清；活动之间缺少长期内容结构；项目有传播但缺少体验和消费转化 | 调研资源与客群；提炼文化主题；设计产品和活动体系；组织空间与传播节点；形成运营节奏 | 项目定位；内容与产品体系；活动策划案；游线和场景建议；传播及运营计划 |
| 设计 | 把艺术内容转化为空间、视觉和传播系统，覆盖展览、商业美陈、艺术空间改造及品牌文化场景。 | 商业、酒店与文化空间；展览和品牌活动；需要艺术视觉升级的机构 | 艺术概念难以转成具体空间；视觉与内容彼此割裂；方案缺少后续制作和现场条件 | 梳理目标与场地；建立设计概念；完成空间和视觉方案；深化材料与节点；协同制作落地 | 概念方案；空间布局与动线；视觉系统；材料与工艺建议；制作执行文件 |
| 景观艺术品制作施工 | 面向街区、园区、酒店和公共空间，完成雕塑、装置与景观艺术品从概念深化到制作安装的落地。 | 地产、园区与街区项目；酒店和文旅目的地；公共空间建设及设计机构 | 概念方案缺少结构与工艺支撑；艺术效果、预算和施工条件难以平衡；运输安装及现场协调复杂 | 场地与概念确认；尺度材料深化；结构工艺与预算协调；工厂制作与质量检查；运输安装和现场验收 | 艺术概念深化；尺寸材料方案；制作清单；施工与安装计划；现场呈现及验收资料 |

- [ ] **Step 5: 运行服务数据测试**

Run: `node --test tests/service-content.test.mjs`  
Expected: 2 tests PASS。

- [ ] **Step 6: 提交服务内容数据**

```bash
git add data/xu-services.json service-tools.mjs tests/service-content.test.mjs
git commit -m "Expand public service page content"
```

### Task 3: 首页叙事、正式导航和需求分流

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `works.html`
- Create: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: Task 1 的品牌资产和 Task 2 的服务 slug。
- Produces: 首页四类需求入口、五项可点击服务卡、五阶段工作链、场景解决方案，以及全站正式标志和 favicon 链接。

- [ ] **Step 1: 编写首页结构失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const works = await readFile(new URL("../works.html", import.meta.url), "utf8");

test("首页使用正式完整标志和中文定位", () => {
  assert.ok(
    (index.match(/assets\/brand\/pascal-gallery-logo\.svg/g) ?? []).length >= 2
  );
  assert.match(index, /assets\/brand\/favicon\.svg/);
  assert.match(index, /综合艺术服务机构/);
  assert.match(index, /艺术家与作品资源/);
  assert.match(index, /公共艺术制作落地服务/);
});

test("首页包含四类需求入口和五阶段工作链", () => {
  for (const text of [
    "购买或租赁艺术品",
    "空间、商业或文旅项目",
    "艺术家或机构合作",
    "了解帕斯卡的发展与能力",
    "需求诊断",
    "艺术资源组织",
    "策划与设计",
    "制作与施工",
    "展示与运营"
  ]) {
    assert.match(index, new RegExp(text));
  }
});

test("现有在售作品页也使用正式标志和完整 favicon", () => {
  assert.ok(
    (works.match(/assets\/brand\/pascal-gallery-logo\.svg/g) ?? []).length >= 2
  );
  assert.match(works, /assets\/brand\/favicon\.svg/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/site-structure.test.mjs`  
Expected: 3 tests FAIL，现有页面尚未包含正式标志与新首页结构。

- [ ] **Step 3: 替换全站品牌头部与 favicon**

在 `index.html` 和 `works.html` 的 `<head>` 中加入：

```html
<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
```

将现有 `.brand-mark` 和重复品牌文字替换为：

```html
<img
  class="brand-logo"
  src="assets/brand/pascal-gallery-logo.svg"
  alt="帕斯卡画廊"
>
```

首页与在售作品页的页脚各增加同一完整标志图像，使用 `class="footer-logo"`，并保留现有版权年份和返回顶部链接。

- [ ] **Step 4: 按确认顺序重写首页**

首页模块顺序固定为：

1. 首屏：`帕斯卡画廊 / 综合艺术服务机构`
2. 数据证明：2016、80+、200+、50+
3. 四类需求入口
4. 五项服务能力
5. 五阶段工作链
6. 场景解决方案
7. 代表案例
8. 机构实力与公开发展潜力
9. 合作入口

首屏正文使用：

> 帕斯卡画廊以艺术家与作品资源为基础，为个人、企业、商业空间和城市项目提供艺术品交易、内容策划、空间设计及公共艺术制作落地服务。

四类入口分别链接到 `works.html`、`#services`、`#contact`、`#development`。场景解决方案使用设计说明中的五个固定场景名称。移除 `Service System`、`Why Pascal`、`Selected Projects`、`Cooperation` 等英文眉题，全部换为中文。

- [ ] **Step 5: 让服务卡链接二级页面**

在 `app.js` 的 `renderServices` 中将卡片根节点改为：

```js
const detailUrl = `services/${service.slug}.html`;
return `
  <a class="service-card" href="${detailUrl}">
    <span class="service-count">${count} 个相关项目</span>
    <h3>${service.title}</h3>
    <p>${service.summary}</p>
    <span class="text-link">查看服务详情</span>
  </a>
`;
```

保留案例数据渲染，但首页只展示代表案例摘要，完整案例目录留给第二阶段。

- [ ] **Step 6: 运行首页结构与现有数据测试**

Run: `node --test tests/site-structure.test.mjs tests/service-content.test.mjs`  
Expected: 5 tests PASS。

- [ ] **Step 7: 提交首页和品牌接入**

```bash
git add index.html app.js works.html tests/site-structure.test.mjs
git commit -m "Restructure gallery homepage and navigation"
```

### Task 4: 五个服务二级页面

**Files:**
- Create: `service-page.js`
- Create: `services/art-sales.html`
- Create: `services/art-space-rental.html`
- Create: `services/cultural-tourism.html`
- Create: `services/design.html`
- Create: `services/landscape-art.html`
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: Task 2 的 `getServiceById(data, id)`、`getRelatedProjects(data, id)` 和完整服务字段。
- Produces: `renderServicePage(data, serviceId)`，填充服务定义、适用对象、问题、工作范围、流程、交付成果和相关案例。

- [ ] **Step 1: 编写二级页路径失败测试**

```js
const servicePages = [
  ["services/art-sales.html", "art_sales"],
  ["services/art-space-rental.html", "art_and_space_rental"],
  ["services/cultural-tourism.html", "cultural_tourism"],
  ["services/design.html", "design"],
  ["services/landscape-art.html", "landscape_art"]
];

test("五个服务二级页具有固定服务编号和完整品牌标志", async () => {
  for (const [path, id] of servicePages) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`data-service-id="${id}"`));
    assert.ok(
      (html.match(/\.\.\/assets\/brand\/pascal-gallery-logo\.svg/g) ?? []).length >= 2
    );
    assert.match(html, /\.\.\/assets\/brand\/favicon\.svg/);
    assert.match(html, /\.\.\/service-page\.js/);
  }
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test tests/site-structure.test.mjs`  
Expected: FAIL，提示找不到第一个服务页面。

- [ ] **Step 3: 建立五个共享结构的 HTML 页面**

每个页面使用对应 `data-service-id`，并包含以下固定容器：

```html
<body data-service-id="art_sales">
  <header class="site-header service-header">...</header>
  <main>
    <section class="service-hero">
      <p class="eyebrow">服务详情</p>
      <h1 id="service-title">读取中</h1>
      <p id="service-lead"></p>
    </section>
    <section id="service-audiences"></section>
    <section id="service-problems"></section>
    <section id="service-capabilities"></section>
    <section id="service-process"></section>
    <section id="service-deliverables"></section>
    <section id="service-projects"></section>
    <section class="contact-section">...</section>
  </main>
  <script type="module" src="../service-page.js"></script>
</body>
```

五页分别设置准确的中文 `<title>` 与 description，并使用 `../assets/brand/...`、`../styles.css`、`../index.html` 相对路径。

- [ ] **Step 4: 实现共享服务页渲染**

```js
import { getRelatedProjects, getServiceById } from "./service-tools.mjs";

const serviceId = document.body.dataset.serviceId;

async function loadServicePage() {
  try {
    const response = await fetch("../data/xu-services.json");
    if (!response.ok) throw new Error("服务数据请求失败");
    renderServicePage(await response.json(), serviceId);
  } catch (error) {
    document.querySelector("main").innerHTML = `
      <section class="section empty-state">
        <h1>服务内容暂时无法加载</h1>
        <p>请返回首页重新选择服务。</p>
        <a class="button" href="../index.html">返回首页</a>
      </section>
    `;
    console.error(error);
  }
}

export function renderServicePage(data, id) {
  const service = getServiceById(data, id);
  if (!service) throw new Error("未找到对应服务");
  const projects = getRelatedProjects(data, id);
  document.querySelector("#service-title").textContent = service.title;
  document.querySelector("#service-lead").textContent = service.pageLead;
  renderList("#service-audiences", "适合哪些客户和场景", service.audiences);
  renderList("#service-problems", "可以解决哪些问题", service.problems);
  renderList("#service-capabilities", "帕斯卡具体负责什么", service.capabilities);
  renderSteps("#service-process", service.process);
  renderTags("#service-deliverables", "可以交付什么", service.deliverables);
  renderRelatedProjects("#service-projects", projects);
}
```

辅助渲染函数使用以下实现：

```js
function renderList(selector, title, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>${title}</h2></div>
    <ul class="service-detail-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderSteps(selector, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>标准工作流程</h2></div>
    <ol class="service-process">
      ${items.map((item, index) => `
        <li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>
      `).join("")}
    </ol>
  `;
}

function renderTags(selector, title, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>${title}</h2></div>
    <div class="deliverables">
      ${items.map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;
}

function renderRelatedProjects(selector, projects) {
  const content = projects.length
    ? projects.map((project) => `
        <article>
          <span class="category-label">${project.type}</span>
          <h3>${project.title}</h3>
          <p>${project.overview}</p>
        </article>
      `).join("")
    : '<p class="empty-state">相关案例正在整理。</p>';

  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>相关代表案例</h2></div>
    <div class="related-projects">${content}</div>
  `;
}
```

五个服务页的页脚均使用 `../assets/brand/pascal-gallery-logo.svg` 完整标志。

- [ ] **Step 5: 运行全部结构和内容测试**

Run: `node --test tests/brand-assets.test.mjs tests/service-content.test.mjs tests/site-structure.test.mjs && node --check service-page.js && node --check service-tools.mjs`  
Expected: 7 tests PASS，语法检查退出码为 0。

- [ ] **Step 6: 提交服务二级页面**

```bash
git add service-page.js services tests/site-structure.test.mjs
git commit -m "Add five public service detail pages"
```

### Task 5: 页面样式、浏览器验收与发布

**Files:**
- Modify: `styles.css`
- Test: `tests/brand-assets.test.mjs`
- Test: `tests/service-content.test.mjs`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: Tasks 1、3、4 的品牌标志、首页模块与服务页容器。
- Produces: 统一的白底鲜绿视觉、响应式正式标志、首页分流区和服务详情布局。

- [ ] **Step 1: 添加品牌与首页模块样式**

定义：

```css
:root {
  --fresh-green: #8cff32;
}

.brand-logo {
  display: block;
  width: clamp(112px, 12vw, 170px);
  height: 52px;
  object-fit: contain;
  object-position: left center;
}

.footer-logo {
  display: block;
  width: 112px;
  height: 48px;
  object-fit: contain;
}

.audience-grid,
.scenario-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
}

.service-chain {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
```

为可点击服务卡增加清楚的 `:hover`、`:focus-visible` 和鲜绿色边线状态；保持卡片圆角不超过 8px，不增加装饰性渐变。

- [ ] **Step 2: 添加服务详情页样式**

服务页使用全宽首段、两列问题/能力区、五阶段流程和标签式交付成果。相关案例复用现有案例视觉，不嵌套卡片。长段落最大行宽控制在 70 个中文字符附近。

- [ ] **Step 3: 添加移动端规则**

在 `max-width: 720px` 下：

- 正式标志宽度控制在 104–124px，导航允许换行。
- 四类需求入口和场景入口变为单列。
- 五阶段流程变为单列连续步骤。
- 服务详情的双列区域变为单列。
- 所有页面宽度不超过视口，无横向滚动。

- [ ] **Step 4: 运行自动化验证**

Run:

```bash
node --test tests/brand-assets.test.mjs tests/service-content.test.mjs tests/site-structure.test.mjs
node --check app.js
node --check service-page.js
node --check service-tools.mjs
git diff --check
```

Expected: 7 tests PASS，所有语法检查退出码为 0，`git diff --check` 无输出。

- [ ] **Step 5: 启动本地服务器并检查桌面端**

Run: `python3 -m http.server 4174`

依次打开：

- `http://127.0.0.1:4174/index.html`
- `http://127.0.0.1:4174/works.html`
- 五个 `http://127.0.0.1:4174/services/*.html`

确认正式完整标志显示清楚、favicon 为完整标志、首页模块顺序正确、五个服务卡均可打开对应页面、服务字段和相关案例渲染正确。

- [ ] **Step 6: 检查 390×844 手机端**

确认全站无横向滚动，标志不压缩变形，导航与标题不重叠，需求入口和工作链转为单列，服务页所有中文内容完整可读。

- [ ] **Step 7: 提交样式**

```bash
git add styles.css
git commit -m "Style homepage and service detail pages"
```

- [ ] **Step 8: 最终工作树检查**

Run: `git status --short`  
Expected: 仅保留无关的 `?? outputs/`。

- [ ] **Step 9: 推送并发布**

```bash
git push origin main
git push origin main:gh-pages
```

- [ ] **Step 10: 在线验收**

验证以下 URL 返回 HTTP 200，并复查正式标志、首页入口和服务页链接：

- `https://sibolees-jpg.github.io/pascal--gallery/`
- `https://sibolees-jpg.github.io/pascal--gallery/services/art-sales.html`
- `https://sibolees-jpg.github.io/pascal--gallery/services/art-space-rental.html`
- `https://sibolees-jpg.github.io/pascal--gallery/services/cultural-tourism.html`
- `https://sibolees-jpg.github.io/pascal--gallery/services/design.html`
- `https://sibolees-jpg.github.io/pascal--gallery/services/landscape-art.html`
