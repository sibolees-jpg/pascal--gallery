import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import {
  createFilterOptions,
  filterWorks,
  getPublishedWorks,
  getRecommendedWorks,
  validateArtworkData,
} from "../artwork-tools.mjs";

const works = [
  { id: "one", inventoryNo: "PG-001", artist: "甲", title: "绿色", category: "painting", categoryLabel: "绘画", medium: "布面", publishStatus: "published", recommended: true },
  { id: "two", inventoryNo: "PG-002", artist: "乙", title: "蓝色", category: "sculpture", categoryLabel: "雕塑", medium: "铜", publishStatus: "draft", recommended: true },
  { id: "three", inventoryNo: "PG-003", artist: "甲", title: "白色", category: "painting", categoryLabel: "绘画", medium: "纸本", publishStatus: "published", recommended: false },
];

test("校验拒绝重复作品编号和库存编号", () => {
  assert.throws(() => validateArtworkData({ works: [works[0], { ...works[0] }] }), /作品编号重复/);
  assert.throws(() => validateArtworkData({ works: [works[0], { ...works[1], inventoryNo: "PG-001" }] }), /库存编号重复/);
});

test("公开目录和推荐目录都排除草稿", () => {
  assert.deepEqual(getPublishedWorks({ works }).map((work) => work.id), ["one", "three"]);
  assert.deepEqual(getRecommendedWorks({ works }).map((work) => work.id), ["one"]);
});

test("分类、艺术家和搜索条件可以组合", () => {
  assert.deepEqual(filterWorks(works, "category", "painting", "白色").map((work) => work.id), ["three"]);
  assert.deepEqual(filterWorks(works, "artist", "甲", "PG-001").map((work) => work.id), ["one"]);
  assert.deepEqual(createFilterOptions(works, "artist"), [
    { id: "all", label: "全部", count: 3 },
    { id: "甲", label: "甲", count: 2 },
    { id: "乙", label: "乙", count: 1 },
  ]);
});

test("PPT 作品图片均以草稿录入并保留来源页码", async () => {
  const data = JSON.parse(await readFile(new URL("../data/works-for-sale.json", import.meta.url), "utf8"));
  assert.equal(data.works.length, 40);
  for (const work of data.works) {
    assert.equal(work.publishStatus, "draft");
    assert.equal(work.recommended, false);
    assert.ok(work.source.deck.endsWith(".pptx"));
    assert.ok(Number.isInteger(work.source.slide));
    await access(new URL(`../${work.image}`, import.meta.url));
  }
});
