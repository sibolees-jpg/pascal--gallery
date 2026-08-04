import { filterCasesByService } from "./case-tools.mjs";
import { getServiceById } from "./service-tools.mjs";

const serviceId = document.body.dataset.serviceId;
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

async function loadServicePage() {
  try {
    const [servicesResponse, casesResponse] = await Promise.all([
      fetch(new URL("./data/xu-services.json", import.meta.url)),
      fetch(new URL("./data/cases.json", import.meta.url)),
    ]);
    if (!servicesResponse.ok || !casesResponse.ok) throw new Error("服务数据请求失败");
    const [serviceData, { cases }] = await Promise.all([
      servicesResponse.json(),
      casesResponse.json(),
    ]);
    renderServicePage(serviceData, cases, serviceId);
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

export function renderServicePage(data, cases, id) {
  const service = getServiceById(data, id);
  if (!service) throw new Error("未找到对应服务");
  const relatedCases = filterCasesByService(cases, id);

  document.querySelector("#service-title").textContent = service.title;
  document.querySelector("#service-lead").textContent = service.pageLead;
  renderList("#service-audiences", "适合哪些客户和场景", service.audiences);
  renderList("#service-problems", "可以解决哪些问题", service.problems);
  renderList("#service-capabilities", "帕斯卡具体负责什么", service.capabilities);
  renderSteps("#service-process", service.process);
  renderTags("#service-deliverables", "可以交付什么", service.deliverables);
  renderRelatedProjects("#service-projects", relatedCases);
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

function renderRelatedProjects(selector, cases) {
  const content = cases.length
    ? cases.map((item) => `
        <article>
          <span class="category-label">${item.type}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a class="button" href="../case.html?id=${item.id}">查看案例</a>
        </article>
      `).join("")
    : '<p class="empty-state">相关案例正在整理。</p>';

  document.querySelector(selector).innerHTML = `
    <div class="section-heading compact"><h2>相关代表案例</h2></div>
    <div class="related-projects">${content}</div>
  `;
}

loadServicePage();
