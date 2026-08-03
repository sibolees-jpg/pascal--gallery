import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getRelatedProjects, getServiceById } from "../service-tools.mjs";

const data = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8")
);
const expectedIds = [
  "art_sales",
  "art_and_space_rental",
  "cultural_tourism",
  "design",
  "landscape_art"
];

test("五项服务均具备二级页完整字段", () => {
  assert.deepEqual(data.services.map(({ id }) => id), expectedIds);
  for (const service of data.services) {
    assert.match(service.slug, /^[a-z-]+$/);
    assert.ok(service.pageLead.length >= 20);
    for (const field of ["audiences", "problems", "capabilities", "process", "deliverables"]) {
      assert.ok(service[field].length >= 3, `${service.id} 缺少 ${field}`);
      assert.ok(service[field].every((item) => item.trim().length > 0));
    }
  }
});

test("按编号读取服务并关联案例", () => {
  assert.equal(getServiceById(data, "design").title, "设计");
  assert.ok(getRelatedProjects(data, "design").length >= 1);
  assert.equal(getServiceById(data, "missing"), null);
});
