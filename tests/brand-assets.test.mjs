import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildBrandAssets } from "../scripts/build-brand-assets.mjs";

test("生成的标志保留全部路径且 favicon 使用白色方形画布", async () => {
  const source = "/Users/sli001/Downloads/Image 1_SVG(4).svg";
  const output = await mkdtemp(join(tmpdir(), "pascal-brand-"));
  await buildBrandAssets(source, output);

  const original = await readFile(source, "utf8");
  const logo = await readFile(join(output, "pascal-gallery-logo.svg"), "utf8");
  const favicon = await readFile(join(output, "favicon.svg"), "utf8");
  const pathCount = (value) => value.match(/<path\b/g)?.length ?? 0;

  assert.equal(logo, original);
  assert.equal(pathCount(favicon), pathCount(original));
  assert.match(favicon, /viewBox="[^"]+ 1654 1654"/);
  assert.match(favicon, /<rect[^>]+fill="#ffffff"/);
});
