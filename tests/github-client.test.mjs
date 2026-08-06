import test from "node:test";
import assert from "node:assert/strict";
import { createGitHubClient } from "../admin/github-client.mjs";

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
