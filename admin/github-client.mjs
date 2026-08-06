const API = "https://api.github.com";

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function textToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}

export function decodeGitHubContent(file) {
  const binary = atob(String(file?.content ?? "").replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function createGitHubClient({ owner, repo, branch = "main", token, fetchImpl = fetch }) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetchImpl(`${API}/repos/${owner}/${repo}${path}`, {
        ...options,
        headers: { ...headers, ...(options.body ? { "Content-Type": "application/json" } : {}) },
      });
    } catch {
      throw new Error("无法连接 GitHub，请检查网络后重试");
    }
    if (!response.ok) {
      const messages = {
        401: "GitHub 授权无效，请重新输入令牌",
        403: "令牌没有仓库内容写入权限",
        409: "远端内容发生冲突，请刷新后重试",
        422: "提交内容未通过 GitHub 校验",
      };
      throw new Error(messages[response.status] ?? `GitHub 请求失败（${response.status}）`);
    }
    return response.status === 204 ? null : response.json();
  }

  async function getHead() {
    return request(`/git/ref/heads/${encodeURIComponent(branch)}`);
  }

  return {
    async verify() {
      const ref = await getHead();
      return { headSha: ref.object.sha };
    },

    async readFile(path, ref = branch) {
      return request(`/contents/${path}?ref=${encodeURIComponent(ref)}`);
    },

    async commitFiles(files, message, expectedHeadSha) {
      const ref = await getHead();
      const headSha = ref.object.sha;
      if (expectedHeadSha && headSha !== expectedHeadSha) {
        throw new Error("远端内容已更新，请刷新数据后再保存");
      }
      const currentCommit = await request(`/git/commits/${headSha}`);
      const tree = [];
      for (const file of files) {
        const content = file.encoding === "base64" ? file.content : textToBase64(file.content);
        const blob = await request("/git/blobs", {
          method: "POST",
          body: JSON.stringify({ content, encoding: "base64" }),
        });
        tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
      }
      const nextTree = await request("/git/trees", {
        method: "POST",
        body: JSON.stringify({ base_tree: currentCommit.tree.sha, tree }),
      });
      const commit = await request("/git/commits", {
        method: "POST",
        body: JSON.stringify({ message, tree: nextTree.sha, parents: [headSha] }),
      });
      await request(`/git/refs/heads/${encodeURIComponent(branch)}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return { headSha: commit.sha };
    },
  };
}
