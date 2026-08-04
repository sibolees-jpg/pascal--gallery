import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const works = await readFile(new URL("../works.html", import.meta.url), "utf8");
const appJs = await readFile(new URL("../app.js", import.meta.url), "utf8");

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

test("首页分类和主导航均进入真实案例库", async () => {
  for (const serviceId of [
    "art_sales",
    "art_and_space_rental",
    "cultural_tourism",
    "design",
    "landscape_art",
  ]) {
    assert.match(index, new RegExp(`cases\\.html\\?service=${serviceId}`));
  }
  assert.match(index, /href="cases\.html">案例<\/a>/);
  assert.match(works, /href="cases\.html">案例<\/a>/);
  assert.match(appJs, /data\/cases\.json/);
  assert.match(appJs, /case\.html\?id=/);
  assert.doesNotMatch(appJs, /href="#case-/);
});

test("服务页导航均进入案例目录", async () => {
  for (const [path] of servicePages) {
    const html = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(html, /href="\.\.\/cases\.html">案例<\/a>/);
  }
});
