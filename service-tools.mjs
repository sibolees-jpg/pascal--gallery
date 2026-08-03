export function getServiceById(data, id) {
  return data.services.find((service) => service.id === id) ?? null;
}

export function getRelatedProjects(data, id) {
  return data.projects.filter((project) => project.services.includes(id));
}
