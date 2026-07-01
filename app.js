const archiveGrid = document.querySelector("#archive-grid");
const filters = document.querySelector("#filters");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

async function loadArchive() {
  try {
    const [itemsResponse, categoriesResponse] = await Promise.all([
      fetch("data/artworks.json"),
      fetch("data/categories.json"),
    ]);

    if (!itemsResponse.ok || !categoriesResponse.ok) {
      throw new Error("Archive request failed");
    }

    const items = await itemsResponse.json();
    const categories = await categoriesResponse.json();
    renderArchive(items, categories);
  } catch (error) {
    archiveGrid.innerHTML = `
      <p class="empty-state">归档数据暂时无法加载。请检查 data/artworks.json 和 data/categories.json 是否存在。</p>
    `;
    console.error(error);
  }
}

function renderArchive(items, categories) {
  const filterOptions = [{ id: "all", label: "全部" }, ...categories];
  updateStats(items);
  renderCategoryIndex(categories);
  renderFilters(filterOptions, items, categories);
  renderCards(items, categories);
}

function updateStats(items) {
  document.querySelector("#stat-count").textContent = items.length;
  document.querySelector("#stat-categories").textContent = new Set(items.map((item) => item.category)).size;
  document.querySelector("#stat-years").textContent = new Set(items.map((item) => item.year)).size;
}

function renderCategoryIndex(categories) {
  categories.forEach((category) => {
    const card = document.querySelector(`[data-category-card="${category.id}"]`);
    if (!card) return;
    card.querySelector("h3").textContent = category.label;
    card.querySelector("p").textContent = category.description;
  });
}

function renderFilters(options, items, categories) {
  filters.innerHTML = options
    .map((option, index) => {
      const pressed = index === 0 ? "true" : "false";
      return `<button class="filter-button" type="button" data-category="${option.id}" aria-pressed="${pressed}">${option.label}</button>`;
    })
    .join("");

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;

    const activeCategory = button.dataset.category;
    filters.querySelectorAll("button").forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });

    const visibleItems = activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

    renderCards(visibleItems, categories);
  });
}

function renderCards(items, categories) {
  archiveGrid.innerHTML = items.map((item) => createCard(item, categories)).join("");
}

function createCard(item, categories) {
  const category = categories.find((entry) => entry.id === item.category);
  const image = item.image
    ? `<img src="${item.image}" alt="${item.title}">`
    : `<span aria-hidden="true">${item.title.slice(0, 1)}</span>`;

  return `
    <article class="archive-card">
      <div class="archive-card-image">${image}</div>
      <div class="archive-card-body">
        <span class="category-label">${category ? category.label : item.category}</span>
        <div class="archive-card-meta">
          <span>${item.artist}</span>
          <span>${item.year}</span>
          <span>${item.medium}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <span class="status-pill">${item.status}</span>
      </div>
    </article>
  `;
}

loadArchive();
