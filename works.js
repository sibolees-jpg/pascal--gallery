const year = document.querySelector("#year");
const worksUpdated = document.querySelector("#works-updated");
const recommendedWorks = document.querySelector("#recommended-works");
const workFilters = document.querySelector("#work-filters");
const workCatalog = document.querySelector("#work-catalog");

year.textContent = new Date().getFullYear();

async function loadWorks() {
  try {
    const response = await fetch("data/works-for-sale.json");

    if (!response.ok) {
      throw new Error("在售作品数据请求失败");
    }

    const data = await response.json();
    renderWorksPage(data);
  } catch (error) {
    recommendedWorks.innerHTML = `
      <p class="empty-state">在售作品数据暂时无法加载。请检查 data/works-for-sale.json 是否存在。</p>
    `;
    console.error(error);
  }
}

function renderWorksPage(data) {
  worksUpdated.textContent = data.updatedAt;
  const recommended = data.recommended
    .map((id) => data.works.find((work) => work.id === id))
    .filter(Boolean);

  renderRecommended(recommended);
  renderFilters(data.categories, data.works);
  renderCatalog(data.works);
}

function renderRecommended(works) {
  recommendedWorks.innerHTML = works.map((work) => createRecommendedCard(work)).join("");
}

function renderFilters(categories, works) {
  workFilters.innerHTML = categories
    .map((category, index) => {
      const pressed = index === 0 ? "true" : "false";
      const count = category.id === "all"
        ? works.length
        : works.filter((work) => work.category === category.id).length;
      return `
        <button class="filter-button" type="button" data-category="${category.id}" aria-pressed="${pressed}">
          ${category.label} ${count}
        </button>
      `;
    })
    .join("");

  workFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;

    const activeCategory = button.dataset.category;
    workFilters.querySelectorAll("button").forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });

    const visibleWorks = activeCategory === "all"
      ? works
      : works.filter((work) => work.category === activeCategory);

    renderCatalog(visibleWorks);
  });
}

function renderCatalog(works) {
  if (!works.length) {
    workCatalog.innerHTML = `<p class="empty-state">当前分类暂无在售作品。</p>`;
    return;
  }

  workCatalog.innerHTML = `
    <div class="catalog-head" role="row">
      <span>编号</span>
      <span>艺术家 / 作品</span>
      <span>媒介与尺寸</span>
      <span>价格与状态</span>
      <span>备注</span>
    </div>
    ${works.map((work) => createCatalogRow(work)).join("")}
  `;
}

function createRecommendedCard(work) {
  return `
    <article class="recommended-card">
      <div class="work-artwork ${work.category}">
        ${work.image ? `<img src="${work.image}" alt="${work.title}">` : `<span>${work.inventoryNo}</span>`}
      </div>
      <div class="recommended-body">
        <span class="category-label">${work.categoryLabel} / ${work.status}</span>
        <h3>${work.title}</h3>
        <p>${work.description}</p>
        <dl class="work-meta">
          <div>
            <dt>艺术家</dt>
            <dd>${work.artist}</dd>
          </div>
          <div>
            <dt>年份</dt>
            <dd>${work.year}</dd>
          </div>
          <div>
            <dt>媒介</dt>
            <dd>${work.medium}</dd>
          </div>
          <div>
            <dt>尺寸</dt>
            <dd>${work.dimensions}</dd>
          </div>
        </dl>
        <div class="work-price">
          <strong>${work.price}</strong>
          <span>${work.recommendedReason}</span>
        </div>
      </div>
    </article>
  `;
}

function createCatalogRow(work) {
  return `
    <article class="catalog-row" id="${work.id}">
      <span class="inventory-no">${work.inventoryNo}</span>
      <div>
        <strong>${work.artist}</strong>
        <p>${work.title} · ${work.year}</p>
      </div>
      <div>
        <strong>${work.categoryLabel}</strong>
        <p>${work.medium} · ${work.dimensions}</p>
      </div>
      <div>
        <strong>${work.price}</strong>
        <p>${work.status}</p>
      </div>
      <p>${work.notes}</p>
    </article>
  `;
}

loadWorks();
