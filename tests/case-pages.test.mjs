import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  getCaseDetailViewModel,
  getCaseListViewModel,
} from "../case-page-view-model.mjs";

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
const { cases } = JSON.parse(
  await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
);
const { services } = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8"),
);

test("案例目录与详情模板使用统一数据和中文状态", () => {
  assert.match(casesHtml, /id="case-grid"/);
  assert.match(casesHtml, /案例目录/);
  assert.match(caseHtml, /id="case-detail"/);
  assert.match(casePageJs, /未找到这个案例/);
  assert.match(casePageJs, /返回案例目录/);
});

test("有效但没有公开案例的服务保留筛选态并显示整理提示", () => {
  const casesWithoutRental = cases.filter(
    (item) => !item.services.includes("art_and_space_rental"),
  );
  const viewModel = getCaseListViewModel(
    casesWithoutRental,
    services,
    "art_and_space_rental",
  );

  assert.equal(viewModel.activeService, "art_and_space_rental");
  assert.deepEqual(viewModel.cases, []);
  assert.equal(viewModel.notice, null);
  assert.equal(viewModel.emptyMessage, "该分类的公开案例正在整理。");
  assert.equal(
    viewModel.filters.find((filter) => filter.id === "art_and_space_rental")?.isActive,
    true,
  );
});

test("未知服务显示提示、回退全部案例并选中全部筛选", () => {
  const viewModel = getCaseListViewModel(cases, services, "unknown-service");
  const publicCases = cases.filter((item) => item.publicStatus === "public");

  assert.equal(viewModel.activeService, null);
  assert.deepEqual(viewModel.cases, publicCases);
  assert.equal(viewModel.notice, "未找到对应服务，已展示全部案例");
  assert.equal(viewModel.emptyMessage, null);
  assert.equal(
    viewModel.filters.find((filter) => filter.id === null)?.isActive,
    true,
  );
});

test("无效案例编号与无图片案例生成明确中文状态", () => {
  const missingCase = getCaseDetailViewModel(cases, "missing-case");
  const noImageCase = getCaseDetailViewModel(cases, "heguang-museum");

  assert.equal(missingCase.currentCase, null);
  assert.equal(missingCase.notFoundMessage, "未找到这个案例");
  assert.equal(noImageCase.currentCase?.images.length, 0);
  assert.equal(noImageCase.imageMessage, "项目影像资料正在整理。");
});

test("页面脚本消费无 DOM 依赖的视图模型", () => {
  assert.match(casesJs, /getCaseListViewModel/);
  assert.match(casePageJs, /getCaseDetailViewModel/);
});
