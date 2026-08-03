import { getRelatedProjects, getServiceById } from "./service-tools.mjs";

const serviceId = document.body.dataset.serviceId;
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

async function loadServicePage() {
  try {
    const response = await fetch(new URL("./data/xu-services.json", import.meta.url));
    if (!response.ok) throw new Error("服务数据请求失败");
    renderServicePage(await response.json(), serviceId);
  } catch (error) {
    document.querySelector("main").innerHTML = `
      <section class="section empty-state">
        <h1>服务内容暂时无法加载</h1>
        <p>请返回首页重新选择服务。</p>
        <a class="button" href="../index.html">返回首页</a>
      </section>
    `;
    console.error(error);
  }
}

export function renderServicePage(data, id) {
  const service = getServiceById(data, id);
  if (!service) throw new Error("未找到对应服务");
  const projects = getRelatedProjects(data, id);

  document.querySelector("#service-title").textContent = service.title;
  document.querySelector("#service-lead").textContent = service.pageLead;
  renderList("#service-audiences", "适合哪些客户和场景", service.audiences);
  renderList("#service-problems", "可以解决哪些问题", service.problems);
  renderList("#service-capabilities", "帕斯卡具体负责什么", service.capabilities);
  renderSteps("#service-process", service.process);
  renderTags("#service-deliverables", "可以交付什么", service.deliverables);
  renderRelatedProjects("#service-projects", projects);
}

function renderList(selector, title, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>${title}</h2></div>
    <ul class="service-detail-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderSteps(selector, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>标准工作流程</h2></div>
    <ol class="service-process">
      ${items.map((item, index) => `
        <li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>
      `).join("")}
    </ol>
  `;
}

function renderTags(selector, title, items) {
  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>${title}</h2></div>
    <div class="deliverables">
      ${items.map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;
}

function renderRelatedProjects(selector, projects) {
  const content = projects.length
    ? projects.map((project) => `
        <article>
          <span class="category-label">${project.type}</span>
          <h3>${project.title}</h3>
          <p>${project.overview}</p>
        </article>
      `).join("")
    : '<p class="empty-state">相关案例正在整理。</p>';

  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>相关代表案例</h2></div>
    <div class="related-projects">${content}</div>
  `;
}

loadServicePage();
