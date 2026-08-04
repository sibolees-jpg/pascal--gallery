import { getCaseById, getRelatedCases } from "./case-tools.mjs";

const year = document.querySelector("#year");
const caseDetail = document.querySelector("#case-detail");

year.textContent = new Date().getFullYear();

async function loadCase() {
  try {
    const [casesResponse, servicesResponse] = await Promise.all([
      fetch("data/cases.json"),
      fetch("data/xu-services.json"),
    ]);

    if (!casesResponse.ok || !servicesResponse.ok) {
      throw new Error("案例详情数据请求失败");
    }

    const [{ cases }, { services }] = await Promise.all([
      casesResponse.json(),
      servicesResponse.json(),
    ]);
    const caseId = new URLSearchParams(window.location.search).get("id");
    const currentCase = getCaseById(cases, caseId);

    if (!currentCase) {
      renderMissingCase();
      return;
    }

    renderCaseDetail(cases, services, currentCase);
  } catch (error) {
    caseDetail.innerHTML = `
      <section class="section case-error-state">
        <p class="empty-state">案例资料暂时无法加载，请稍后再试。</p>
        <a class="button" href="cases.html">返回案例目录</a>
      </section>
    `;
    console.error(error);
  }
}

function renderMissingCase() {
  caseDetail.innerHTML = `
    <section class="section case-error-state" aria-labelledby="missing-case-title">
      <p class="eyebrow">案例目录</p>
      <h1 id="missing-case-title">未找到这个案例</h1>
      <p class="hero-lede">该案例编号无效，或项目暂未公开。</p>
      <a class="button primary" href="cases.html">返回案例目录</a>
    </section>
  `;
}

function renderCaseDetail(cases, services, currentCase) {
  const relatedCases = getRelatedCases(cases, currentCase, 3);
  const relatedServices = currentCase.services
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean);

  caseDetail.innerHTML = `
    <section class="case-detail-hero" aria-labelledby="case-title">
      <a class="breadcrumb" href="cases.html">案例目录</a>
      <p class="eyebrow">真实项目</p>
      <h1 id="case-title">${currentCase.title}</h1>
      <p class="hero-lede">${currentCase.summary}</p>
      <dl class="case-facts case-detail-facts">
        ${createFact("年份", currentCase.year)}
        ${createFact("地点", currentCase.location)}
        ${createFact("项目类型", currentCase.type)}
      </dl>
    </section>

    <section class="section case-overview" aria-labelledby="overview-title">
      <div class="section-heading compact">
        <p class="eyebrow">项目概览</p>
        <h2 id="overview-title">从问题到可公开的项目成果</h2>
      </div>
      <p class="case-lede">${currentCase.summary}</p>
    </section>

    <div class="case-detail-pair">
      <section class="section" aria-labelledby="background-title">
        <div class="section-heading compact">
          <p class="eyebrow">项目背景</p>
          <h2 id="background-title">项目背景</h2>
        </div>
        <p>${currentCase.background}</p>
      </section>
      <section class="section" aria-labelledby="challenge-title">
        <div class="section-heading compact">
          <p class="eyebrow">核心问题</p>
          <h2 id="challenge-title">核心问题</h2>
        </div>
        <p>${currentCase.challenge}</p>
      </section>
    </div>

    <section class="section" aria-labelledby="responsibilities-title">
      <div class="section-heading compact">
        <p class="eyebrow">帕斯卡负责的工作</p>
        <h2 id="responsibilities-title">职责</h2>
      </div>
      ${createContentList(currentCase.responsibilities, "case-content-list")}
    </section>

    <section class="section" aria-labelledby="process-title">
      <div class="section-heading compact">
        <p class="eyebrow">工作方法</p>
        <h2 id="process-title">过程</h2>
      </div>
      ${createContentList(currentCase.process, "case-process-list", true)}
    </section>

    <div class="case-detail-pair">
      <section class="section" aria-labelledby="outcomes-title">
        <div class="section-heading compact">
          <p class="eyebrow">项目成果</p>
          <h2 id="outcomes-title">成果</h2>
        </div>
        ${createContentList(currentCase.outcomes, "case-content-list")}
      </section>
      <section class="section" aria-labelledby="deliverables-title">
        <div class="section-heading compact">
          <p class="eyebrow">公开交付物</p>
          <h2 id="deliverables-title">交付物</h2>
        </div>
        <div class="deliverables">
          ${currentCase.deliverables.map((item) => `<span>${item}</span>`).join("")}
        </div>
      </section>
    </div>

    <section class="section" aria-labelledby="images-title">
      <div class="section-heading compact">
        <p class="eyebrow">项目图片</p>
        <h2 id="images-title">项目影像</h2>
      </div>
      ${createImageGallery(currentCase.images)}
    </section>

    <section class="section" aria-labelledby="services-title">
      <div class="section-heading compact">
        <p class="eyebrow">服务关联</p>
        <h2 id="services-title">关联服务</h2>
      </div>
      <div class="case-service-links">
        ${relatedServices.map((service) => `
          <a class="service-tag" href="cases.html?service=${service.id}">${service.title}</a>
        `).join("")}
      </div>
    </section>

    <section class="section" aria-labelledby="related-cases-title">
      <div class="section-heading compact">
        <p class="eyebrow">继续浏览</p>
        <h2 id="related-cases-title">相关案例</h2>
      </div>
      ${createRelatedCases(relatedCases)}
    </section>
  `;
}

function createFact(label, value) {
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function createContentList(items, className, ordered = false) {
  const tagName = ordered ? "ol" : "ul";
  return `
    <${tagName} class="${className}">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </${tagName}>
  `;
}

function createImageGallery(images) {
  if (!images.length) {
    return `<p class="empty-state">项目影像资料正在整理。</p>`;
  }

  return `
    <div class="case-gallery">
      ${images.map((image) => `
        <figure>
          <img src="${image.src}" alt="${image.alt}">
          <figcaption>${image.caption}</figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function createRelatedCases(relatedCases) {
  if (!relatedCases.length) {
    return `<p class="empty-state">更多相关案例正在整理。</p>`;
  }

  return `
    <div class="related-case-grid">
      ${relatedCases.map((item) => `
        <article class="related-case-card">
          <span>${item.type}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a class="button" href="case.html?id=${item.id}">查看案例</a>
        </article>
      `).join("")}
    </div>
  `;
}

loadCase();
