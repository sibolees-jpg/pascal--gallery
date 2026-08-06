import test from "node:test";
import assert from "node:assert/strict";
import {
  createArtwork,
  escapeHtml,
  exportArtworkData,
  importArtworkData,
  removeArtwork,
  updateArtwork,
  validateImage,
} from "../admin/artwork-admin-tools.mjs";

const data = { updatedAt: "2026-08-06", categories: [], works: [{ id: "ppt-artwork-040", inventoryNo: "PG-ART-040", title: "原作" }] };

test("新增作品生成连续编号且不修改原数据", () => {
  const next = createArtwork(data);
  assert.equal(next.works.at(-1).inventoryNo, "PG-ART-041");
  assert.equal(data.works.length, 1);
});

test("编辑、删除和导入导出保持合法数据", () => {
  assert.equal(updateArtwork(data, "ppt-artwork-040", { title: "新标题" }).works[0].title, "新标题");
  assert.equal(removeArtwork(data, "ppt-artwork-040").works.length, 0);
  assert.deepEqual(importArtworkData(exportArtworkData(data)), data);
  assert.throws(() => importArtworkData("not-json"), /JSON/);
});

test("转义脚本字符并限制图片格式和大小", () => {
  assert.equal(escapeHtml('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
  assert.doesNotThrow(() => validateImage({ type: "image/jpeg", size: 1024 }));
  assert.throws(() => validateImage({ type: "image/svg+xml", size: 1024 }), /JPG、PNG 或 WebP/);
  assert.throws(() => validateImage({ type: "image/png", size: 11 * 1024 * 1024 }), /10MB/);
});
