import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

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

test("具备演示文稿来源的案例均使用项目原始封面", async () => {
  const { cases } = JSON.parse(
    await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  );
  const casesWithDecks = cases.filter((item) => item.id !== "heguang-museum");

  for (const item of casesWithDecks) {
    assert.equal(item.images.length >= 1, true, `${item.title} 缺少项目封面`);
    const cover = item.images[0];
    assert.match(cover.src, new RegExp(`^assets/cases/${item.id}/`));
    assert.ok(cover.alt && cover.caption);
    await access(new URL(`../${cover.src}`, import.meta.url));
  }
});

test("商业宣传资料中的五个合作项目已建立完整公开案例", async () => {
  const { cases } = JSON.parse(
    await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  );
  const expected = new Map([
    ["lv-book-pop-up", "路易威登书籍限时店项目"],
    ["lv-shanghai-pop-up", "路易威登《侬好·上海》限时空间项目"],
    ["lv-trunk-home", "路易威登硬箱家居展项目"],
    ["under-clouds-restaurant", "云下餐厅项目"],
    ["sunset-sphere", "Sunset Sphere 品牌标识项目"],
  ]);

  for (const [id, title] of expected) {
    const item = cases.find((candidate) => candidate.id === id);
    assert.ok(item, `${title} 未录入`);
    assert.equal(item.title, title);
    assert.ok(item.images.length >= 3, `${title} 的项目影像不足`);
    for (const image of item.images) {
      await access(new URL(`../${image.src}`, import.meta.url));
    }
  }
});
