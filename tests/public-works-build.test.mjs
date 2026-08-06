import test from "node:test";
import assert from "node:assert/strict";
import { createPublicArtworkData } from "../public-works-build.mjs";

test("公开构建只保留已上架作品并删除内部字段", () => {
  const data = { updatedAt:"2026-08-06", categories:[], recommended:[], works:[
    { id:"draft", inventoryNo:"D", publishStatus:"draft", notes:"内部", source:{ deck:"x" }, image:"assets/works/draft.jpg" },
    { id:"live", inventoryNo:"L", publishStatus:"published", notes:"内部", source:{ deck:"x" }, privateMemo:"不能公开", image:"assets/works/live.jpg", recommended:true },
  ] };
  const result = createPublicArtworkData(data);
  assert.deepEqual(result.works.map((work) => work.id), ["live"]);
  assert.equal("notes" in result.works[0], false);
  assert.equal("source" in result.works[0], false);
  assert.equal("privateMemo" in result.works[0], false);
  assert.deepEqual(result.recommended, ["live"]);
});
