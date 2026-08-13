import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const works = await readFile(new URL("../works.html", import.meta.url), "utf8");
const appJs = await readFile(new URL("../app.js", import.meta.url), "utf8");
const { cases } = JSON.parse(
  await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
);
const { services } = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8"),
);

test("首页使用正式完整标志和中文定位", () => {
  assert.ok(
    (index.match(/assets\/brand\/pascal-gallery-logo\.svg/g) ?? []).length >= 2
  );
  assert.match(index, /assets\/brand\/favicon\.svg/);
  assert.match(index, /综合艺术服务机构/);
  assert.match(index, /艺术家与作品资源/);
  assert.match(index, /公共艺术制作落地服务/);
});

test("首页首屏以完整 Logo 建立品牌层级", () => {
  assert.match(index, /class="hero-brand-mark"/);
  assert.match(
    index,
    /class="hero-brand-logo"[\s\S]*src="assets\/brand\/pascal-gallery-logo\.svg"/,
  );
  assert.doesNotMatch(index, /<h1 id="hero-title">帕斯卡画廊<\/h1>/);
});

test("首页采用最新内容和服务文字目录", () => {
  assert.match(index, /id="editorial-grid"/);
  assert.match(index, /id="service-index"/);
  assert.match(index, /展览与动态/);
  assert.doesNotMatch(index, /class="case-matrix"/);
  assert.doesNotMatch(index, /class="scenario-grid"/);
  assert.doesNotMatch(index, /class="audience-grid"/);
});

test("首页呈现画廊定位、四部分方法与专业网络", () => {
  assert.match(index, /画廊是城市不可或缺的文化风景/);
  assert.match(index, /城市文化基础设施/);
  assert.match(index, /艺术 × 商业 × 消费 × 服务/);
  for (const text of [
    "艺术家与作品",
    "品牌与空间",
    "收藏、体验与衍生品",
    "策划、设计与落地",
    "策展人",
    "批评家",
    "收藏家",
    "艺术院校",
  ]) {
    assert.match(index, new RegExp(text));
  }
  assert.match(index, /href="about\.html"/);
  assert.match(index, /assets\/about\/gallery-exhibitions\.png/);
});

test("现有在售作品页也使用正式标志和完整 favicon", () => {
  assert.ok(
    (works.match(/assets\/brand\/pascal-gallery-logo\.svg/g) ?? []).length >= 2
  );
  assert.match(works, /assets\/brand\/favicon\.svg/);
});

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

test("首页服务目录和主导航进入对应内容", async () => {
  assert.match(index, /href="cases\.html">案例<\/a>/);
  assert.match(works, /href="cases\.html">案例<\/a>/);
  assert.match(appJs, /data\/cases\.json/);
  assert.match(appJs, /case\.html\?id=/);
  assert.match(appJs, /services\/\$\{service\.slug\}\.html/);
  assert.doesNotMatch(appJs, /href="#case-/);
});

test("服务页导航均进入案例目录", async () => {
  for (const [path] of servicePages) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(html, /href="\.\.\/cases\.html">案例<\/a>/);
    assert.match(html, /href="\.\.\/about\.html">关于帕斯卡<\/a>/);
  }
});

test("案例与作品页均可进入机构介绍", async () => {
  for (const path of ["case.html", "cases.html", "works.html"]) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(html, /href="about\.html">关于帕斯卡<\/a>/);
  }
});

test("首页仅统计和渲染公开案例", async () => {
  const publicCase = {
    ...cases[0],
    title: "公开测试案例",
    services: ["design"],
  };
  const privateCase = {
    ...publicCase,
    id: "internal-case",
    title: "内部待审核案例",
    publicStatus: "review",
  };
  const designService = services.find((service) => service.id === "design");
  const elements = new Map(
    ["#year", "#service-index", "#editorial-grid", "#stat-count", "#stat-categories", "#stat-sources"]
      .map((selector) => [selector, { innerHTML: "", textContent: "" }]),
  );
  const responseFor = (data) => ({ ok: true, json: async () => data });

  vm.runInNewContext(appJs, {
    Date,
    console: { error() {} },
    document: { querySelector: (selector) => elements.get(selector) ?? null },
    fetch: async (url) => responseFor(
      url === "data/cases.json" ? { cases: [publicCase, privateCase] } : { services: [designService] },
    ),
  });
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(elements.get("#stat-count").textContent, 1);
  assert.match(elements.get("#service-index").innerHTML, /1 个案例/);
  assert.doesNotMatch(elements.get("#service-index").innerHTML, /2 个案例/);
  assert.match(elements.get("#editorial-grid").innerHTML, /公开测试案例/);
  assert.doesNotMatch(elements.get("#editorial-grid").innerHTML, /内部待审核案例/);
});
