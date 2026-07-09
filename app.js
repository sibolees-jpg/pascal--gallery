const filters = document.querySelector("#filters");
const year = document.querySelector("#year");
const serviceGrid = document.querySelector("#service-grid");
const projectGrid = document.querySelector("#project-grid");

year.textContent = new Date().getFullYear();

async function loadArchive() {
  try {
    const archiveResponse = await fetch("data/xu-services.json");

    if (!archiveResponse.ok) {
      throw new Error("归档数据请求失败");
    }

    const archiveData = await archiveResponse.json();
    renderArchive(archiveData.services, archiveData.projects);
  } catch (error) {
    projectGrid.innerHTML = `
      <p class="empty-state">归档数据暂时无法加载。请检查 data/xu-services.json 是否存在。</p>
    `;
    console.error(error);
  }
}

function renderArchive(services, projects) {
  const filterOptions = [{ id: "all", title: "全部项目" }, ...services];
  updateStats(services, projects);
  renderServices(services, projects);
  renderFilters(filterOptions, services, projects);
  renderProjects(projects, services);
}

function updateStats(services, projects) {
  document.querySelector("#stat-count").textContent = projects.length;
  document.querySelector("#stat-categories").textContent = services.length;
  document.querySelector("#stat-sources").textContent = 15;
}

function renderServices(services, projects) {
  serviceGrid.innerHTML = services
    .map((service) => {
      const count = projects.filter((project) => project.services.includes(service.id)).length;
      return `
        <article>
          <span class="service-count">${count} 个相关项目</span>
          <h3>${service.title}</h3>
          <p>${service.summary}</p>
          <ul>
            ${service.capabilities.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");
}

function renderFilters(options, services, projects) {
  filters.innerHTML = options
    .map((option, index) => {
      const pressed = index === 0 ? "true" : "false";
      return `<button class="filter-button" type="button" data-service="${option.id}" aria-pressed="${pressed}">${option.title}</button>`;
    })
    .join("");

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-service]");
    if (!button) return;

    const activeService = button.dataset.service;
    filters.querySelectorAll("button").forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });

    const visibleProjects = activeService === "all"
      ? projects
      : projects.filter((project) => project.services.includes(activeService));

    renderProjects(visibleProjects, services);
  });
}

function renderProjects(projects, services) {
  projectGrid.innerHTML = projects.map((project) => createProject(project, services)).join("");
}

function createProject(project, services) {
  const serviceLabels = project.services
    .map((serviceId) => services.find((service) => service.id === serviceId)?.title)
    .filter(Boolean);
  const gallery = (project.images || [])
    .map((image) => `<img src="${image}" alt="${project.title}项目图片">`)
    .join("");
  const image = project.cover
    ? `<img src="${project.cover}" alt="${project.title}">`
    : `<span aria-hidden="true">${project.title.slice(0, 1)}</span>`;

  return `
    <article class="project-card">
      <div class="project-cover">${image}</div>
      <div class="project-content">
        <span class="category-label">${serviceLabels.join(" / ")}</span>
        <h3>${project.title}</h3>
        <p>${project.overview}</p>
        <div class="archive-card-meta">
          <span>${project.year}</span>
          <span>${project.source}</span>
        </div>
        <h4>主要工作</h4>
        <ul>${project.details.map((item) => `<li>${item}</li>`).join("")}</ul>
        <h4>可交付成果</h4>
        <div class="deliverables">
          ${project.deliverables.map((item) => `<span>${item}</span>`).join("")}
        </div>
        ${gallery ? `<div class="mini-gallery">${gallery}</div>` : ""}
      </div>
    </article>
  `;
}

loadArchive();
