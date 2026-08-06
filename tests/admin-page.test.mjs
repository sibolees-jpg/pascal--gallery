import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../admin/works.html", import.meta.url), "utf8");
const script = await readFile(new URL("../admin/works-admin.js", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

test("管理页包含授权、检索、编辑、导入导出和状态区域", () => {
  assert.match(html, /type="password"/);
  assert.match(html, /搜索作品/);
  assert.match(html, /新增作品/);
  assert.match(html, /上架公开/);
  assert.match(html, /导入 JSON/);
  assert.match(html, /导出 JSON/);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /主要导航/);
});

test("管理脚本会话保存令牌并通过 GitHub 客户端提交", () => {
  assert.match(script, /sessionStorage/);
  assert.match(script, /createGitHubClient/);
  assert.match(script, /commitFiles/);
  assert.match(workflow, /- main/);
});
