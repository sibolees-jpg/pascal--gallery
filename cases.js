import { getCaseListViewModel } from "./case-page-view-model.mjs";

const year = document.querySelector("#year");
const caseFilters = document.querySelector("#case-filters");
const caseGrid = document.querySelector("#case-grid");

year.textContent = new Date().getFullYear();

async function loadCases() {
  try {
    const [casesResponse, servicesResponse] = await Promise.all([
      fetch("data/cases.json"),
      fetch("data/xu-services.json"),
    ]);

    if (!casesResponse.ok || !servicesResponse.ok) {
      throw new Error("案例目录数据请求失败");
    }

    const [{ cases }, { services }] = await Promise.all([
      casesResponse.json(),
      servicesResponse.json(),
    ]);
    renderCasesPage(cases, services);
  } catch (error) {
    caseGrid.innerHTML = `
      <p class="empty-state">案例资料暂时无法加载，请稍后再试。</p>
    `;
    console.error(error);
  }
}

function renderCasesPage(cases, services) {
  let requestedService = new URLSearchParams(window.location.search).get("service");

  const render = () => {
    const viewModel = getCaseListViewModel(cases, services, requestedService);
    renderFilters(viewModel.filters);
    renderCaseGrid(viewModel.cases, viewModel.notice, viewModel.emptyMessage);
  };

  caseFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-service]");
    if (!button) return;

    requestedService = button.dataset.service || null;
    updateServiceUrl(requestedService);
    render();
  });

  render();
}

function renderFilters(filters) {
  caseFilters.innerHTML = filters.map((filter) => createFilterButton(filter)).join("");
}

function createFilterButton(filter) {
  return `
    <button
      class="filter-button"
      type="button"
      data-service="${filter.id ?? ""}"
      aria-pressed="${filter.isActive}"
    >
      ${filter.title} ${filter.count}
    </button>
  `;
}

function renderCaseGrid(cases, notice, emptyMessage) {
  const noticeMarkup = notice
    ? `<p class="empty-state case-filter-notice">${notice}</p>`
    : "";

  if (!cases.length) {
    caseGrid.innerHTML = `
      ${noticeMarkup}
      <p class="empty-state">${emptyMessage ?? "当前暂无公开案例。"}</p>
    `;
    return;
  }

  caseGrid.innerHTML = `${noticeMarkup}${cases.map((item) => createCaseCard(item)).join("")}`;
}

function createCaseCard(item) {
  const cover = item.images[0]
    ? `<img src="${item.images[0].src}" alt="${item.images[0].alt}">`
    : `<span class="case-cover-placeholder">项目封面正在整理</span>`;

  return `
    <article class="project-card case-card">
      <div class="project-cover case-cover">${cover}</div>
      <div class="project-content">
        <div class="archive-card-meta" aria-label="项目基础信息">
          <span>${item.year}</span>
          <span>${item.location}</span>
          <span>${item.type}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <a class="button case-card-link" href="case.html?id=${item.id}">查看案例</a>
      </div>
    </article>
  `;
}

function updateServiceUrl(serviceId) {
  const url = new URL(window.location.href);

  if (serviceId) {
    url.searchParams.set("service", serviceId);
  } else {
    url.searchParams.delete("service");
  }

  window.history.replaceState({}, "", url);
}

loadCases();
