import { validateArtworkData } from "../artwork-tools.mjs";

function clone(value) {
  return structuredClone(value);
}

export function createArtwork(data) {
  const next = clone(data);
  const number = Math.max(0, ...next.works.map((work) => Number(work.inventoryNo?.match(/\d+$/)?.[0]) || 0)) + 1;
  const serial = String(number).padStart(3, "0");
  next.works.push({
    id: `ppt-artwork-${serial}`, inventoryNo: `PG-ART-${serial}`, artist: "待补充",
    title: "未命名作品", year: "待补充", medium: "待补充", dimensions: "待补充",
    category: "mixed-media", categoryLabel: "综合材料", price: "询价", status: "待整理",
    publishStatus: "draft", recommended: false, recommendedReason: "", description: "",
    image: "", notes: "", source: { deck: "后台新增", slide: 0, mediaFile: "" },
  });
  return next;
}

export function updateArtwork(data, id, patch) {
  const next = clone(data);
  const index = next.works.findIndex((work) => work.id === id);
  if (index < 0) throw new Error("未找到要编辑的作品");
  next.works[index] = { ...next.works[index], ...patch, id: next.works[index].id };
  return validateArtworkData(next);
}

export function removeArtwork(data, id) {
  const next = clone(data);
  next.works = next.works.filter((work) => work.id !== id);
  return validateArtworkData(next);
}

export function importArtworkData(text) {
  try {
    return validateArtworkData(JSON.parse(text));
  } catch (error) {
    throw new Error(`无法导入 JSON：${error.message}`);
  }
}

export function exportArtworkData(data) {
  return JSON.stringify(validateArtworkData(clone(data)), null, 2);
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  })[character]);
}

export function validateImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file?.type)) {
    throw new Error("图片必须是 JPG、PNG 或 WebP 格式");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("图片不能超过 10MB");
  return file;
}
