import { createArtwork, escapeHtml, exportArtworkData, importArtworkData, removeArtwork, updateArtwork, validateImage } from "./artwork-admin-tools.mjs";
import { createGitHubClient, decodeGitHubContent } from "./github-client.mjs";

const REPOSITORY = { owner: "sibolees-jpg", repo: "pascal--gallery", branch: "main" };
const CATEGORY_LABELS = { painting:"绘画", sculpture:"雕塑", "mixed-media":"综合材料", paper:"纸本", "photo-video":"摄影/影像", "art-derivative":"艺术衍生品" };
const elements = Object.fromEntries([...document.querySelectorAll("[id]")].map((element) => [element.id, element]));
const form = elements["work-form"];
let data = null;
let selectedId = null;
let headSha = null;
const pendingImages = new Map();
let dirty = false;

function setStatus(message, type = "info") {
  elements["save-status"].textContent = message;
  elements["save-status"].classList.toggle("error", type === "error");
}
function currentWork() { return data?.works.find((work) => work.id === selectedId) ?? null; }
function markDirty() { dirty = true; setStatus("有未保存修改"); }

function updatePublishButton(work = currentWork()) {
  const button = elements["publish-button"];
  button.disabled = !headSha || !work;
  button.textContent = work?.publishStatus === "published" ? "更新已上线作品" : "提交当前作品上线";
}

function renderList() {
  const query = elements["admin-search"].value.trim().toLowerCase();
  const status = elements["admin-status"].value;
  const works = data.works.filter((work) => (status === "all" || work.publishStatus === status) && [work.inventoryNo,work.artist,work.title].some((value) => String(value).toLowerCase().includes(query)));
  elements["work-count"].textContent = `显示 ${works.length} / 共 ${data.works.length} 条`;
  elements["admin-work-list"].innerHTML = works.map((work) => `<button type="button" class="work-list-item" data-id="${escapeHtml(work.id)}" aria-current="${work.id===selectedId}"><img src="../${escapeHtml(work.image)}" alt=""><span><strong>${escapeHtml(work.title)}</strong><small>${escapeHtml(work.inventoryNo)} · ${escapeHtml(work.artist)}</small></span><i class="status-dot ${work.publishStatus === "published" ? "published" : "draft"}"></i></button>`).join("") || '<p>没有符合条件的作品。</p>';
}

function fillForm(work) {
  updatePublishButton(work);
  if (!work) return;
  elements["editor-number"].textContent = work.inventoryNo;
  elements["editor-title"].textContent = work.title;
  for (const name of ["inventoryNo","title","artist","year","category","medium","dimensions","price","status","publishStatus","description","recommendedReason","notes"]) form.elements[name].value = work[name] ?? "";
  form.elements.recommended.checked = Boolean(work.recommended);
  form.elements.sourceDeck.value = work.source?.deck ?? "";
  form.elements.sourceSlide.value = work.source?.slide ?? 0;
  elements["image-preview"].hidden = !work.image;
  elements["image-empty"].hidden = Boolean(work.image);
  if (work.image) elements["image-preview"].src = pendingImages.get(work.image)?.dataUrl ?? (headSha ? `https://raw.githubusercontent.com/${REPOSITORY.owner}/${REPOSITORY.repo}/${headSha}/${work.image}` : `../${work.image}`);
}

function syncCurrentForm() {
  if (!currentWork()) return;
  data = updateArtwork(data, selectedId, collectPatch());
}

function selectWork(id) { syncCurrentForm(); selectedId = id; fillForm(currentWork()); renderList(); }

function collectPatch() {
  const values = Object.fromEntries(new FormData(form));
  return { ...values, categoryLabel:CATEGORY_LABELS[values.category], recommended:form.elements.recommended.checked, source:{ ...currentWork().source, deck:values.sourceDeck, slide:Number(values.sourceSlide)||0 } };
}

async function loadData() {
  const response = await fetch("../data/works-for-sale.json", { cache:"no-store" });
  if (!response.ok) throw new Error("无法读取作品数据");
  data = await response.json();
  selectedId = data.works[0]?.id ?? null;
  renderList(); fillForm(currentWork()); setStatus("请连接 GitHub 管理完整作品库");
}

function getClient() {
  const token = sessionStorage.getItem("pascalGithubToken");
  if (!token) throw new Error("请先连接 GitHub");
  return createGitHubClient({ ...REPOSITORY, token });
}

async function connect() {
  const token = elements["github-token"].value.trim() || sessionStorage.getItem("pascalGithubToken");
  if (!token) throw new Error("请输入 GitHub 令牌");
  sessionStorage.setItem("pascalGithubToken", token);
  const client = getClient();
  const result = await client.verify();
  const remoteFile = await client.readFile("data/works-for-sale.json", result.headSha);
  data = importArtworkData(decodeGitHubContent(remoteFile));
  pendingImages.clear(); dirty = false;
  headSha = result.headSha;
  selectedId = data.works[0]?.id ?? null;
  renderList(); fillForm(currentWork());
  elements["save-button"].disabled = false;
  updatePublishButton();
  elements["github-token"].value = ""; elements["connection-status"].textContent = "已连接，已读取 GitHub 最新数据";
}

async function save(message = `更新作品资料：${currentWork().inventoryNo}`) {
  if (!headSha) throw new Error("请先连接 GitHub 并读取最新作品数据");
  syncCurrentForm();
  data.updatedAt = new Date().toISOString().slice(0,10);
  const files = [{ path:"data/works-for-sale.json", content:`${exportArtworkData(data)}\n` }];
  for (const [path, image] of pendingImages) files.push({ path, content:image.content, encoding:"base64" });
  setStatus("正在保存到 GitHub…");
  const result = await getClient().commitFiles(files, message, headSha);
  headSha = result.headSha; pendingImages.clear(); dirty = false; setStatus("已保存，网站正在自动更新"); renderList(); updatePublishButton();
}

async function publishCurrentWork() {
  if (!currentWork()) throw new Error("请先选择作品");
  if (!headSha) throw new Error("请先连接 GitHub");
  const previousPublishStatus = currentWork().publishStatus;
  syncCurrentForm();
  data = updateArtwork(data, selectedId, { publishStatus: "published" });
  form.elements.publishStatus.value = "published";
  updatePublishButton();
  elements["publish-button"].disabled = true;
  setStatus(`正在提交「${currentWork().title}」上线…`);
  try {
    await save(`上线作品：${currentWork().inventoryNo} ${currentWork().title}`);
    setStatus(`「${currentWork().title}」已提交上线，网站正在自动更新`);
  } catch (error) {
    data = updateArtwork(data, selectedId, { publishStatus: previousPublishStatus });
    form.elements.publishStatus.value = previousPublishStatus;
    renderList();
    setStatus(`上线失败：${error.message}`, "error");
  } finally {
    updatePublishButton();
  }
}

form.addEventListener("input", markDirty);
elements["admin-work-list"].addEventListener("click", (event) => { const button=event.target.closest("[data-id]"); if(button) selectWork(button.dataset.id); });
elements["admin-search"].addEventListener("input", renderList); elements["admin-status"].addEventListener("change", renderList);
elements["add-button"].addEventListener("click", () => { data=createArtwork(data); selectWork(data.works.at(-1).id); markDirty(); });
elements["delete-button"].addEventListener("click", () => { const work=currentWork(); if(work && confirm(`确认删除 ${work.inventoryNo}「${work.title}」？`)){ data=removeArtwork(data,work.id); selectedId=data.works[0]?.id??null; fillForm(currentWork()); renderList(); markDirty(); } });
elements["image-file"].addEventListener("change", async () => { const file=validateImage(elements["image-file"].files[0]); const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}); const extension={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[file.type]; const path=`assets/works/${currentWork().inventoryNo.toLowerCase()}/primary.${extension}`; pendingImages.set(path,{content:dataUrl.split(",")[1],dataUrl}); data=updateArtwork(data,selectedId,{image:path}); elements["image-preview"].src=dataUrl; elements["image-preview"].hidden=false; elements["image-empty"].hidden=true; markDirty(); });
elements["connect-button"].addEventListener("click", () => connect().catch((error)=>elements["connection-status"].textContent=error.message));
elements["logout-button"].addEventListener("click", () => { sessionStorage.removeItem("pascalGithubToken"); headSha=null; elements["save-button"].disabled=true; updatePublishButton(); elements["connection-status"].textContent="未连接"; });
elements["save-button"].addEventListener("click", () => save().catch((error)=>setStatus(`保存失败：${error.message}`, "error")));
elements["publish-button"].addEventListener("click", () => publishCurrentWork().catch((error)=>setStatus(`上线失败：${error.message}`, "error")));
elements["export-button"].addEventListener("click", () => { syncCurrentForm(); const blob=new Blob([exportArtworkData(data)],{type:"application/json"}); const link=document.createElement("a"); link.href=URL.createObjectURL(blob); link.download=`帕斯卡画廊作品数据-${data.updatedAt}.json`; link.click(); URL.revokeObjectURL(link.href); });
elements["import-file"].addEventListener("change", async () => { try{ data=importArtworkData(await elements["import-file"].files[0].text()); pendingImages.clear(); selectedId=data.works[0]?.id??null; renderList(); fillForm(currentWork()); markDirty(); }catch(error){setStatus(error.message);} });

loadData().then(() => { if(sessionStorage.getItem("pascalGithubToken")) connect().catch((error)=>elements["connection-status"].textContent=error.message); }).catch((error)=>setStatus(error.message));
