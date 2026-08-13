import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const moduleUrl = new URL("../homepage-motion.js", import.meta.url);
const source = await readFile(moduleUrl, "utf8").catch(() => "");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");

test("线稿滚动状态按区段循环映射", async () => {
  assert.match(source, /export function getLineworkState/);
  const { getLineworkState } = await import(moduleUrl);

  assert.equal(getLineworkState(0), "linework-state-0");
  assert.equal(getLineworkState(1), "linework-state-1");
  assert.equal(getLineworkState(2), "linework-state-2");
  assert.equal(getLineworkState(5), "linework-state-2");
});

test("首页加载观察器并标记滚动区段", () => {
  assert.match(source, /IntersectionObserver/);
  assert.match(html, /data-linework-stage="0"/);
  assert.match(html, /data-linework-stage="1"/);
  assert.match(html, /data-linework-stage="2"/);
  assert.match(html, /type="module" src="homepage-motion\.js"/);
});

test("线稿动画支持减少动态效果", () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.architectural-linework[\s\S]*transition:/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*transition: none/);
});
