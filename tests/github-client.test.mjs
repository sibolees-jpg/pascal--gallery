import test from "node:test";
import assert from "node:assert/strict";
import { createGitHubClient, decodeGitHubContent } from "../admin/github-client.mjs";

test("验证仓库时使用会话令牌且返回分支 SHA", async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ object: { sha: "head-1" } }) };
  };
  const client = createGitHubClient({ owner: "o", repo: "r", branch: "main", token: "secret", fetchImpl });
  assert.equal((await client.verify()).headSha, "head-1");
  assert.equal(calls[0].options.headers.Authorization, "Bearer secret");
});

test("提交前发现远端变化时停止覆盖", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ object: { sha: "new-head" } }) });
  const client = createGitHubClient({ owner: "o", repo: "r", branch: "main", token: "secret", fetchImpl });
  await assert.rejects(() => client.commitFiles([], "保存", "old-head"), /远端内容已更新/);
});

test("鉴权错误转换为中文提示且不泄露令牌", async () => {
  const fetchImpl = async () => ({ ok: false, status: 401, json: async () => ({}) });
  const client = createGitHubClient({ owner: "o", repo: "r", branch: "main", token: "top-secret", fetchImpl });
  await assert.rejects(() => client.verify(), (error) => /授权无效/.test(error.message) && !error.message.includes("top-secret"));
});

test("解码 GitHub 返回的 UTF-8 JSON 内容", () => {
  const content = btoa(unescape(encodeURIComponent('{"名称":"作品"}')));
  assert.equal(decodeGitHubContent({ content }), '{"名称":"作品"}');
});

test("成功提交依次创建 blob、tree、commit 并更新分支", async () => {
  const calls = [];
  const replies = [
    { object:{ sha:"head-1" } }, { tree:{ sha:"tree-1" } }, { sha:"blob-1" },
    { sha:"tree-2" }, { sha:"commit-2" }, {},
  ];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method:options.method ?? "GET", body:options.body });
    return { ok:true, status:200, json:async()=>replies.shift() };
  };
  const client = createGitHubClient({ owner:"o", repo:"r", token:"secret", fetchImpl });
  assert.deepEqual(await client.commitFiles([{ path:"data/a.json", content:'{"a":1}' }], "保存", "head-1"), { headSha:"commit-2" });
  assert.deepEqual(calls.map((call) => call.method), ["GET","GET","POST","POST","POST","PATCH"]);
  assert.match(calls[2].url, /\/git\/blobs$/);
  assert.match(calls[5].url, /\/git\/refs\/heads\/main$/);
});
