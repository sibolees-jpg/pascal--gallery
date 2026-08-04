import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("公开案例均为真实项目并具备详情页字段", async () => {
  const { cases } = JSON.parse(
    await readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  );

  assert.ok(cases.length >= 8);
  for (const item of cases) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    assert.ok(item.title && item.summary && item.background && item.challenge);
    assert.ok(item.services.length >= 1);
    assert.ok(item.responsibilities.length >= 1);
    assert.ok(item.outcomes.length >= 1);
    assert.equal(item.publicStatus, "public");
  }
});
