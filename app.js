const year = document.querySelector("#year");
const serviceGrid = document.querySelector("#service-grid");
const caseMatrix = document.querySelector("#case-matrix");
const projectGrid = document.querySelector("#project-grid");

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
    caseMatrix.innerHTML = '<p class="empty-state">案例资料暂时无法加载，请稍后再试。</p>';
    projectGrid.innerHTML = `
      <p class="empty-state">代表案例暂时无法加载，请稍后再试。</p>
    `;
    console.error(error);
  }
}

function renderArchive(services, cases) {
  const publicCases = cases.filter((item) => item.publicStatus === "public");

  updateStats(services, publicCases);
  renderServices(services, publicCases);
  renderCaseMatrix(services, publicCases);
  renderProjects(publicCases, services);
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
  serviceGrid.innerHTML = services
    .map((service) => {
      const count = cases.filter((item) => item.services.includes(service.id)).length;
      const detailUrl = `services/${service.slug}.html`;
      return `
        <a class="service-card" href="${detailUrl}">
          <span class="service-count">${count} 个相关项目</span>
          <h3>${service.title}</h3>
          <p>${service.summary}</p>
          <span class="text-link">查看服务详情</span>
        </a>
      `;
    })
    .join("");
}

function renderCaseMatrix(services, cases) {
  caseMatrix.innerHTML = services
    .map((service) => {
      const relatedCases = cases.filter((item) => item.services.includes(service.id));
      return `
        <article class="case-group">
          <header>
            <span>${relatedCases.length} 个公开案例</span>
            <h3>${service.title}</h3>
          </header>
          <div class="case-list">
            <a href="cases.html?service=${service.id}">
              <strong>浏览相关案例</strong>
              <small>查看${service.title}的真实项目</small>
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjects(cases, services) {
  projectGrid.innerHTML = cases.map((item) => createProject(item, services)).join("");
}

function createProject(item, services) {
  const serviceLabels = item.services
    .map((serviceId) => services.find((service) => service.id === serviceId)?.title)
    .filter(Boolean);
  const initials = item.title.slice(0, 2);

  return `
    <article class="project-card case-card">
      <div class="project-cover">
        <span aria-hidden="true">${initials}</span>
      </div>
      <div class="project-content">
        <span class="category-label">${serviceLabels.join(" / ")}</span>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <div class="archive-card-meta">
          <span>${item.year}</span>
          <span>${item.location}</span>
          <span>${item.type}</span>
        </div>
        <a class="button case-card-link" href="case.html?id=${item.id}">查看案例</a>
      </div>
    </article>
  `;
}

loadArchive();
