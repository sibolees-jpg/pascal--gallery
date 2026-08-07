import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../works.html", import.meta.url), "utf8");
const script = await readFile(new URL("../works.js", import.meta.url), "utf8");

test("公开作品页提供双分类和搜索", () => {
  assert.match(html, /艺术品种类/);
  assert.match(html, /艺术家/);
  assert.match(html, /id="work-search"/);
  assert.match(html, /type="module" src="works\.js\?v=20260807"/);
});

test("公开作品页只消费公开作品且不渲染内部字段", () => {
  assert.match(script, /getPublishedWorks/);
  assert.match(script, /getRecommendedWorks/);
  assert.doesNotMatch(script, /work\.source/);
  assert.doesNotMatch(script, /work\.notes/);
  assert.match(script, /当前暂无已上架作品/);
});

test("公开作品页每次都跳过旧作品数据缓存", () => {
  assert.match(script, /fetch\("data\/works-for-sale\.json",\s*\{\s*cache:\s*"no-store"\s*\}\)/);
});
