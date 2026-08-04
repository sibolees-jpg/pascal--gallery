import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const casesHtml = await readFile(
  new URL("../cases.html", import.meta.url),
  "utf8",
);
const caseHtml = await readFile(
  new URL("../case.html", import.meta.url),
  "utf8",
);
const casesJs = await readFile(
  new URL("../cases.js", import.meta.url),
  "utf8",
);
const casePageJs = await readFile(
  new URL("../case-page.js", import.meta.url),
  "utf8",
);

test("案例目录与详情模板使用统一数据和中文状态", () => {
  assert.match(casesHtml, /id="case-grid"/);
  assert.match(casesHtml, /案例目录/);
  assert.match(caseHtml, /id="case-detail"/);
  assert.match(casePageJs, /未找到这个案例/);
  assert.match(casePageJs, /返回案例目录/);
});

test("页面脚本覆盖筛选、无图片和无效参数状态", () => {
  assert.match(casesJs, /isKnownService/);
  assert.match(casesJs, /该分类的公开案例正在整理/);
  assert.match(casePageJs, /项目影像资料正在整理/);
  assert.match(casePageJs, /getCaseById/);
});
