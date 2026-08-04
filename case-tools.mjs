const KNOWN_SERVICE_IDS = new Set([
  "art_sales",
  "art_and_space_rental",
  "cultural_tourism",
  "design",
  "landscape_art",
]);

export function getCaseById(cases, id) {
  return cases.find((item) => item.id === id && item.publicStatus === "public") ?? null;
}

export function filterCasesByService(cases, serviceId) {
  const publicCases = cases.filter((item) => item.publicStatus === "public");

  if (!KNOWN_SERVICE_IDS.has(serviceId)) {
    return publicCases;
  }

  return publicCases.filter((item) => item.services.includes(serviceId));
}

export function getRelatedCases(cases, currentCase, limit = 3) {
  const maxResults = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const services = new Set(currentCase?.services ?? []);

  return cases
    .filter((item) => item.publicStatus === "public")
    .filter((item) => item.id !== currentCase?.id)
    .filter((item) => item.services.some((serviceId) => services.has(serviceId)))
    .slice(0, maxResults);
}

export function isKnownService(services, serviceId) {
  return services.some((service) => service.id === serviceId);
}
