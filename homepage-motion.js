const LINEWORK_STATES = [
  "linework-state-0",
  "linework-state-1",
  "linework-state-2",
];

export function getLineworkState(sectionIndex) {
  const normalizedIndex = Number.isFinite(sectionIndex) && sectionIndex >= 0
    ? sectionIndex
    : 0;
  return LINEWORK_STATES[normalizedIndex % LINEWORK_STATES.length];
}

function setupLineworkMotion() {
  const linework = document.querySelector(".architectural-linework");
  const sections = document.querySelectorAll("[data-linework-stage]");

  if (!linework || !sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!activeEntry) return;

      const stage = Number(activeEntry.target.dataset.lineworkStage);
      linework.classList.remove(...LINEWORK_STATES);
      linework.classList.add(getLineworkState(stage));
    },
    { rootMargin: "-18% 0px -48%", threshold: [0.2, 0.45, 0.7] },
  );

  sections.forEach((section) => observer.observe(section));
}

if (typeof document !== "undefined") {
  setupLineworkMotion();
}
