import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../admin/works.html", import.meta.url), "utf8");
const script = await readFile(new URL("../admin/works-admin.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../admin/admin.css", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

test("管理页包含授权、检索、编辑、导入导出和状态区域", () => {
  assert.match(html, /type="password"/);
  assert.match(html, /href="admin\.css\?v=20260807-full-images"/);
  assert.match(html, /搜索作品/);
  assert.match(html, /新增作品/);
  assert.match(html, /上架公开/);
  assert.match(html, /导入 JSON/);
  assert.match(html, /导出 JSON/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="save-button"[^>]*disabled/);
  assert.match(html, /id="publish-button"[^>]*disabled[^>]*>提交当前作品上线</);
  assert.match(styles, /@media\(max-width:1100px\).*?\.editor-title-row\{display:grid\}/s);
  assert.match(styles, /\.work-list-item img\s*\{[^}]*object-fit:contain/);
  assert.match(styles, /\.image-preview img\s*\{[^}]*max-width:100%[^}]*height:auto/);
  assert.doesNotMatch(styles, /\.image-preview\s*\{[^}]*aspect-ratio:4\/3/);
  assert.doesNotMatch(html, /主要导航/);
});

test("管理脚本会话保存令牌并通过 GitHub 客户端提交", () => {
  assert.match(script, /sessionStorage/);
  assert.match(script, /createGitHubClient/);
  assert.match(script, /commitFiles/);
  assert.match(script, /publishCurrentWork/);
  assert.match(script, /publishStatus:\s*"published"/);
  assert.match(script, /previousPublishStatus/);
  assert.match(script, /publishStatus:\s*previousPublishStatus/);
  assert.match(script, /上线失败/);
  assert.match(workflow, /- main/);
  assert.match(workflow, /scripts\/build-public-site\.mjs/);
});
