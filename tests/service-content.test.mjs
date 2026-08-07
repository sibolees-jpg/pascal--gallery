import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getRelatedProjects, getServiceById } from "../service-tools.mjs";

const data = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8")
);
const servicePageJs = await readFile(
  new URL("../service-page.js", import.meta.url),
  "utf8",
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

test("商业宣传资料中的业务场景已归入五项服务", () => {
  const textFor = (id) => JSON.stringify(getServiceById(data, id));
  assert.match(textFor("art_sales"), /艺术衍生品/);
  assert.match(textFor("art_and_space_rental"), /艺术会客厅/);
  assert.match(textFor("art_and_space_rental"), /银行|酒店/);
  assert.match(textFor("cultural_tourism"), /城市更新/);
  assert.match(textFor("cultural_tourism"), /在地/);
  assert.match(textFor("design"), /艺术 × 商业 × 消费 × 服务/);
  assert.match(textFor("design"), /品牌空间/);
  assert.match(textFor("landscape_art"), /公共艺术/);
});

test("服务页相关项目使用真实案例数据、详情链接和中文空状态", () => {
  assert.match(servicePageJs, /data\/cases\.json/);
  assert.match(servicePageJs, /case\.html\?id=/);
  assert.match(servicePageJs, /href="\.\.\/case\.html\?id=/);
  assert.match(servicePageJs, /相关案例正在整理/);
});
