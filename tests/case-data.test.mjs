import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const requiredStringFields = [
  "id",
  "title",
  "year",
  "location",
  "type",
  "summary",
  "background",
  "challenge",
  "publicStatus",
];

const requiredStringArrays = ["responsibilities", "process", "outcomes", "deliverables"];
const knownServiceIds = new Set([
  "art_sales",
  "art_and_space_rental",
  "cultural_tourism",
  "design",
  "landscape_art",
]);

test("公开案例均为真实项目并具备详情页字段", async () => {
  const { cases } = JSON.parse(
    await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  );

  assert.ok(Array.isArray(cases));
  assert.ok(cases.length >= 8);
  for (const item of cases) {
    assert.equal(typeof item, "object");
    assert.match(item.id, /^[a-z0-9-]+$/);
    for (const field of requiredStringFields) {
      assert.equal(typeof item[field], "string", `${item.id} 的 ${field} 必须是字符串`);
      assert.ok(item[field].trim(), `${item.id} 的 ${field} 不能为空`);
    }
    assert.ok(Array.isArray(item.services));
    assert.ok(item.services.length >= 1);
    assert.ok(item.services.every((service) => knownServiceIds.has(service)));
    for (const field of requiredStringArrays) {
      assert.ok(Array.isArray(item[field]), `${item.id} 的 ${field} 必须是数组`);
      assert.ok(item[field].length >= 1, `${item.id} 的 ${field} 不能为空`);
      assert.ok(item[field].every((value) => typeof value === "string" && value.trim()));
    }
    assert.ok(Array.isArray(item.images));
    for (const image of item.images) {
      assert.equal(typeof image, "object");
      for (const field of ["src", "alt", "caption"]) {
        assert.equal(typeof image[field], "string", `${item.id} 图片的 ${field} 必须是字符串`);
        assert.ok(image[field].trim(), `${item.id} 图片的 ${field} 不能为空`);
      }
    }
    assert.ok(!("sourceFiles" in item), `${item.id} 不得在公开数据中暴露内部来源`);
    assert.equal(item.publicStatus, "public");
  }
});

test("罗浮宫艺术、展览与活动策划归入文旅项目策划并保留设计服务", async () => {
  const { cases } = JSON.parse(
    await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  );
  const louvreCase = cases.find((item) => item.id === "louvre-art-programming");

  assert.ok(louvreCase);
  assert.ok(louvreCase.services.includes("cultural_tourism"));
  assert.ok(louvreCase.services.includes("design"));
});
