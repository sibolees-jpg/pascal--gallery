import {
  createFilterOptions,
  filterWorks,
  getPublishedWorks,
  getRecommendedWorks,
} from "./artwork-tools.mjs";

const elements = {
  year: document.querySelector("#year"),
  updated: document.querySelector("#works-updated"),
  recommended: document.querySelector("#recommended-works"),
  modes: document.querySelector("#classification-modes"),
  filters: document.querySelector("#work-filters"),
  search: document.querySelector("#work-search"),
  catalog: document.querySelector("#work-catalog"),
};

const state = { mode: "category", selectedId: "all", query: "", works: [] };
elements.year.textContent = new Date().getFullYear();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  })[character]);
}

async function loadWorks() {
  try {
    const response = await fetch("data/works-for-sale.json");
    if (!response.ok) throw new Error("在售作品数据请求失败");
    const data = await response.json();
    state.works = getPublishedWorks(data);
    elements.updated.textContent = data.updatedAt;
    renderRecommended(getRecommendedWorks(data));
    renderControls();
  } catch (error) {
    elements.recommended.innerHTML = '<p class="empty-state">在售作品数据暂时无法加载。</p>';
    elements.catalog.innerHTML = '<p class="empty-state">请稍后重新访问。</p>';
    console.error(error);
  }
}

function renderRecommended(works) {
  elements.recommended.innerHTML = works.length
    ? works.map(createRecommendedCard).join("")
    : '<p class="empty-state">推荐作品正在整理。</p>';
}

function renderControls() {
  const options = createFilterOptions(state.works, state.mode);
  elements.filters.innerHTML = options.map((option) => `
    <button class="filter-button" type="button" data-filter="${escapeHtml(option.id)}" aria-pressed="${option.id === state.selectedId}">
      ${escapeHtml(option.label)} ${option.count}
    </button>
  `).join("");
  if (!state.works.length) {
    elements.catalog.innerHTML = '<p class="empty-state">当前暂无已上架作品。</p>';
    return;
  }
  const visible = filterWorks(state.works, state.mode, state.selectedId, state.query);
  renderCatalog(visible);
}

function renderCatalog(works) {
  if (!works.length) {
    elements.catalog.innerHTML = '<p class="empty-state">没有找到符合条件的作品，请调整分类或搜索词。</p>';
    return;
  }
  elements.catalog.innerHTML = `
    <div class="catalog-head" role="row"><span>编号</span><span>艺术家 / 作品</span><span>媒介与尺寸</span><span>价格与状态</span><span>说明</span></div>
    ${works.map(createCatalogRow).join("")}
  `;
}

function createRecommendedCard(work) {
  return `<article class="recommended-card">
    <div class="work-artwork ${escapeHtml(work.category)}">${work.image ? `<img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}">` : `<span>${escapeHtml(work.inventoryNo)}</span>`}</div>
    <div class="recommended-body"><span class="category-label">${escapeHtml(work.categoryLabel)} / ${escapeHtml(work.status)}</span>
      <h3>${escapeHtml(work.title)}</h3><p>${escapeHtml(work.description)}</p>
      <dl class="work-meta"><div><dt>艺术家</dt><dd>${escapeHtml(work.artist)}</dd></div><div><dt>年份</dt><dd>${escapeHtml(work.year)}</dd></div><div><dt>媒介</dt><dd>${escapeHtml(work.medium)}</dd></div><div><dt>尺寸</dt><dd>${escapeHtml(work.dimensions)}</dd></div></dl>
      <div class="work-price"><strong>${escapeHtml(work.price)}</strong><span>${escapeHtml(work.recommendedReason)}</span></div>
    </div></article>`;
}

function createCatalogRow(work) {
  return `<article class="catalog-row" id="${escapeHtml(work.id)}">
    <span class="inventory-no">${escapeHtml(work.inventoryNo)}</span>
    <div><strong>${escapeHtml(work.artist)}</strong><p>${escapeHtml(work.title)} · ${escapeHtml(work.year)}</p></div>
    <div><strong>${escapeHtml(work.categoryLabel)}</strong><p>${escapeHtml(work.medium)} · ${escapeHtml(work.dimensions)}</p></div>
    <div><strong>${escapeHtml(work.price)}</strong><p>${escapeHtml(work.status)}</p></div>
    <p>${escapeHtml(work.description)}</p></article>`;
}

elements.modes.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (!button) return;
  state.mode = button.dataset.mode;
  state.selectedId = "all";
  elements.modes.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  renderControls();
});

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  state.selectedId = button.dataset.filter;
  renderControls();
});

elements.search.addEventListener("input", () => {
  state.query = elements.search.value;
  renderControls();
});

loadWorks();
