import { getRelatedCases } from "./case-tools.mjs";
import { getCaseDetailViewModel } from "./case-page-view-model.mjs";

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
    const viewModel = getCaseDetailViewModel(cases, caseId);

    if (!viewModel.currentCase) {
      renderMissingCase(viewModel.notFoundMessage);
      return;
    }

    renderCaseDetail(cases, services, viewModel.currentCase, viewModel.imageMessage);
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

function renderMissingCase(message = "未找到这个案例") {
  caseDetail.innerHTML = `
    <section class="section case-error-state" aria-labelledby="missing-case-title">
      <p class="eyebrow">案例目录</p>
      <h1 id="missing-case-title">${message}</h1>
      <p class="hero-lede">该案例编号无效，或项目暂未公开。</p>
      <a class="button primary" href="cases.html">返回案例目录</a>
    </section>
  `;
}

function renderCaseDetail(cases, services, currentCase, imageMessage) {
  const relatedCases = getRelatedCases(cases, currentCase, 3);
  const heroImage = currentCase.images[0];
  const relatedServices = currentCase.services
    .map((id) => services.find((service) => service.id === id))
    .filter(Boolean);

  caseDetail.innerHTML = `
    <section class="case-editorial-hero" aria-labelledby="case-title">
      <div class="case-editorial-heading">
        <a class="breadcrumb" href="cases.html">案例目录</a>
        <p class="eyebrow">真实项目</p>
        <h1 id="case-title">${currentCase.title}</h1>
        <p class="hero-lede">${currentCase.summary}</p>
      </div>
      <div class="case-hero-media">
        ${heroImage
          ? `<img src="${heroImage.src}" alt="${heroImage.alt}">`
          : `<p class="empty-state">${imageMessage}</p>`}
      </div>
    </section>

    <section class="case-fact-band" aria-label="项目基础信息">
      <dl class="case-facts case-detail-facts">
        ${createFact("年份", currentCase.year)}
        ${createFact("地点", currentCase.location)}
        ${createFact("项目类型", currentCase.type)}
      </dl>
    </section>

    <article class="case-story">
      ${createStorySection("01", "项目背景", currentCase.background)}
      ${createStorySection("02", "核心问题", currentCase.challenge)}
      ${createStoryList("03", "帕斯卡负责的工作", currentCase.responsibilities)}
      ${createStoryList("04", "工作过程", currentCase.process, true)}
      ${createStoryList("05", "项目成果", currentCase.outcomes)}
      ${createStoryList("06", "公开交付物", currentCase.deliverables)}
    </article>

    <section class="section" aria-labelledby="images-title">
      <div class="section-heading compact">
        <p class="eyebrow">项目图片</p>
        <h2 id="images-title">项目影像</h2>
      </div>
      ${createImageGallery(currentCase.images, imageMessage)}
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

function createStorySection(number, title, content) {
  return `
    <section class="case-story-section">
      <span>${number}</span>
      <h2>${title}</h2>
      <p>${content}</p>
    </section>
  `;
}

function createStoryList(number, title, items, ordered = false) {
  return `
    <section class="case-story-section">
      <span>${number}</span>
      <h2>${title}</h2>
      ${createContentList(items, "case-story-list", ordered)}
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

function createImageGallery(images, emptyMessage) {
  if (!images.length) {
    return `<p class="empty-state">${emptyMessage}</p>`;
  }

  return `
    <div class="case-image-sequence">
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
