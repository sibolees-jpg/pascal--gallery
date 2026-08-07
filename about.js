const elements = {
  positioning: document.querySelector("#profile-positioning"),
  overview: document.querySelector("#profile-overview"),
  association: document.querySelector("#profile-association"),
  stats: document.querySelector("#profile-stats"),
  roles: document.querySelector("#founder-roles"),
  founder: document.querySelector("#founder-summary"),
  selection: document.querySelector("#selection-process"),
  method: document.querySelector("#profile-method"),
  network: document.querySelector("#profile-network"),
  timeline: document.querySelector("#profile-timeline"),
  year: document.querySelector("#year"),
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
})[character]);

async function loadProfile() {
  const response = await fetch("data/gallery-profile.json", { cache: "no-store" });
  if (!response.ok) throw new Error("机构资料暂时无法加载");
  renderProfile(await response.json());
}

function renderProfile(profile) {
  elements.positioning.textContent = profile.identity.positioning;
  elements.overview.textContent = profile.identity.overview;
  elements.association.textContent = profile.identity.association;
  elements.roles.textContent = profile.founder.roles.join(" · ");
  elements.founder.textContent = profile.founder.summary;
  elements.stats.innerHTML = [
    [profile.identity.founded, "画廊创办"],
    [profile.stats.exhibitions, "累计展览"],
    [profile.stats.artists, "合作艺术家"],
    [profile.stats.academicEvents, "学术交流与公益讲座"],
  ].map(([value, label]) => `<div><dt>${escapeHtml(value)}</dt><dd>${escapeHtml(label)}</dd></div>`).join("");
  elements.selection.innerHTML = profile.selection.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`).join("");
  elements.method.innerHTML = profile.method.map((item, index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></article>`).join("");
  elements.network.innerHTML = profile.network.map((item, index) => `<span><i>${String(index + 1).padStart(2, "0")}</i>${escapeHtml(item)}</span>`).join("");
  elements.timeline.innerHTML = profile.timeline.map((item) => `<article><h3>${item.year}</h3><ul>${item.exhibitions.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul></article>`).join("");
}

elements.year.textContent = new Date().getFullYear();
loadProfile().catch((error) => {
  elements.timeline.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
});
