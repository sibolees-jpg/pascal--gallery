const year = document.querySelector("#year");
const serviceIndex = document.querySelector("#service-index");
const editorialGrid = document.querySelector("#editorial-grid");

year.textContent = new Date().getFullYear();

async function loadArchive() {
  try {
    const [servicesResponse, casesResponse] = await Promise.all([
      fetch("data/xu-services.json"),
      fetch("data/cases.json"),
    ]);

    if (!servicesResponse.ok || !casesResponse.ok) {
      throw new Error("归档数据请求失败");
    }

    const [{ services }, { cases }] = await Promise.all([
      servicesResponse.json(),
      casesResponse.json(),
    ]);
    renderArchive(services, cases);
  } catch (error) {
    editorialGrid.innerHTML = '<p class="empty-state">最新内容暂时无法加载，请稍后再试。</p>';
    serviceIndex.innerHTML = '<p class="empty-state">服务资料暂时无法加载，请稍后再试。</p>';
    console.error(error);
  }
}

function renderArchive(services, cases) {
  const publicCases = cases.filter((item) => item.publicStatus === "public");

  updateStats(services, publicCases);
  renderServices(services, publicCases);
  renderEditorial(publicCases, services);
}

function updateStats(services, cases) {
  setOptionalText("#stat-count", cases.length);
  setOptionalText("#stat-categories", services.length);
  setOptionalText("#stat-sources", "0");
}

function setOptionalText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function renderServices(services, cases) {
  serviceIndex.innerHTML = services
    .map((service, index) => {
      const count = cases.filter((item) => item.services.includes(service.id)).length;
      const detailUrl = `services/${service.slug}.html`;
      return `
        <a class="service-index-row" href="${detailUrl}">
          <span class="service-number">${String(index + 1).padStart(2, "0")}</span>
          <h3>${service.title}</h3>
          <p>${service.summary}</p>
          <span class="service-count">${count} 个案例</span>
        </a>
      `;
    })
    .join("");
}

function renderEditorial(cases, services) {
  editorialGrid.innerHTML = cases.slice(0, 6)
    .map((item, index) => createEditorialItem(item, services, index))
    .join("");
}

function createEditorialItem(item, services, index) {
  const serviceLabels = item.services
    .map((serviceId) => services.find((service) => service.id === serviceId)?.title)
    .filter(Boolean);
  const cover = item.images[0];
  const media = cover
    ? `<img src="${cover.src}" alt="${cover.alt}">`
    : `<span class="editorial-placeholder">${item.title.slice(0, 2)}</span>`;

  return `
    <a class="editorial-item editorial-item-${(index % 4) + 1}" href="case.html?id=${item.id}">
      <figure>${media}</figure>
      <div class="editorial-caption">
        <span>${serviceLabels.join(" / ")}</span>
        <h3>${item.title}</h3>
        <p>${item.year} · ${item.location}</p>
      </div>
    </a>
  `;
}

loadArchive();
