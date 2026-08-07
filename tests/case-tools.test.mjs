import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  filterCasesByService,
  getCaseById,
  getRelatedCases,
  isKnownService,
} from "../case-tools.mjs";

const { cases } = JSON.parse(
  await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
);
const { services } = JSON.parse(
  await readFile(new URL("../data/xu-services.json", import.meta.url), "utf8"),
);

test("按编号读取公开案例，不存在时返回 null", () => {
  assert.equal(getCaseById(cases, "mian-san-sculpture")?.title, "棉三雕塑");
  assert.equal(getCaseById(cases, "missing-case"), null);
});

test("按服务筛选案例，已知但零案例的服务返回空数组", () => {
  const filtered = filterCasesByService(cases, "landscape_art");
  assert.ok(filtered.some((item) => item.id === "mian-san-sculpture"));
  assert.ok(filtered.every((item) => item.publicStatus === "public"));

  const casesWithoutRental = cases.filter(
    (item) => !item.services.includes("art_and_space_rental"),
  );
  assert.deepEqual(filterCasesByService(casesWithoutRental, "art_and_space_rental"), []);
});

test("未知服务返回全部公开案例", () => {
  const allPublic = cases.filter((item) => item.publicStatus === "public");
  assert.deepEqual(filterCasesByService(cases, "unknown-service"), allPublic);
});

test("按共享服务返回相关公开案例，排除当前案例并遵守数量上限", () => {
  const currentCase = cases[0];
  const originalCases = [...cases];
  const related = getRelatedCases(cases, currentCase, 3);

  assert.ok(related.length <= 3);
  assert.ok(related.every((item) => item.id !== currentCase.id));
  assert.ok(related.every((item) => item.publicStatus === "public"));
  assert.ok(related.every((item) =>
    item.services.some((serviceId) => currentCase.services.includes(serviceId)),
  ));
  assert.deepEqual(cases, originalCases);
});

test("按服务编号判断服务是否已知", () => {
  assert.equal(isKnownService(services, "design"), true);
  assert.equal(isKnownService(services, "unknown-service"), false);
});
