const SEARCH_FIELDS = [
  "inventoryNo", "artist", "title", "year", "medium", "dimensions",
  "categoryLabel", "price", "status", "notes",
];

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase("zh-CN");
}

export function validateArtworkData(data) {
  if (!data || !Array.isArray(data.works)) throw new Error("作品数据格式无效");
  const ids = new Set();
  const inventoryNumbers = new Set();
  for (const work of data.works) {
    if (!work.id) throw new Error("作品编号不能为空");
    if (!work.inventoryNo) throw new Error("库存编号不能为空");
    if (ids.has(work.id)) throw new Error(`作品编号重复：${work.id}`);
    if (inventoryNumbers.has(work.inventoryNo)) throw new Error(`库存编号重复：${work.inventoryNo}`);
    ids.add(work.id);
    inventoryNumbers.add(work.inventoryNo);
  }
  return data;
}

export function getPublishedWorks(data) {
  return validateArtworkData(data).works.filter((work) => work.publishStatus === "published");
}

export function getRecommendedWorks(data) {
  return getPublishedWorks(data).filter((work) => work.recommended === true);
}

export function filterWorks(works, mode = "category", selectedId = "all", query = "") {
  const needle = normalize(query);
  return works.filter((work) => {
    const matchesSelection = selectedId === "all" || (mode === "artist"
      ? work.artist === selectedId
      : work.category === selectedId);
    const matchesQuery = !needle || SEARCH_FIELDS.some((field) => normalize(work[field]).includes(needle));
    return matchesSelection && matchesQuery;
  });
}

export function createFilterOptions(works, mode = "category") {
  const counts = new Map();
  for (const work of works) {
    const id = mode === "artist" ? work.artist : work.category;
    const label = mode === "artist" ? work.artist : work.categoryLabel;
    if (!id) continue;
    const current = counts.get(id) ?? { id, label, count: 0 };
    current.count += 1;
    counts.set(id, current);
  }
  return [{ id: "all", label: "全部", count: works.length }, ...counts.values()];
}
