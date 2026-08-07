import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const profile = JSON.parse(await readFile(new URL("../data/gallery-profile.json", import.meta.url), "utf8"));
const html = await readFile(new URL("../about.html", import.meta.url), "utf8");
const script = await readFile(new URL("../about.js", import.meta.url), "utf8");

test("机构资料包含创办信息、专业网络和业务方法", () => {
  assert.equal(profile.identity.founded, 2016);
  assert.match(profile.identity.positioning, /城市.*文化/);
  assert.equal(profile.stats.exhibitions, "80+");
  assert.equal(profile.stats.artists, "近200位");
  assert.equal(profile.stats.academicEvents, "50+");
  assert.equal(profile.method.length, 4);
  assert.deepEqual(profile.method.map((item) => item.title), ["艺术", "商业", "消费", "服务"]);
  assert.ok(profile.network.length >= 6);
});

test("机构发展时间线完整覆盖2017至2024年", () => {
  assert.deepEqual(profile.timeline.map((item) => item.year), [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
  assert.ok(profile.timeline.every((item) => item.exhibitions.length >= 2));
});

test("关于页使用机构数据和真实展览图片", async () => {
  assert.match(html, /关于帕斯卡/);
  assert.match(html, /id="profile-timeline"/);
  assert.match(html, /id="profile-network"/);
  assert.match(script, /data\/gallery-profile\.json/);
  await access(new URL("../assets/about/gallery-exhibitions.png", import.meta.url));
  await access(new URL("../assets/about/academic-events.png", import.meta.url));
});
