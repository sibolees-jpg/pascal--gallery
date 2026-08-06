const INTERNAL_FIELDS = new Set(["notes", "source"]);

export function createPublicArtworkData(data) {
  const works = data.works
    .filter((work) => work.publishStatus === "published")
    .map((work) => Object.fromEntries(Object.entries(work).filter(([key]) => !INTERNAL_FIELDS.has(key))));
  return {
    updatedAt: data.updatedAt,
    categories: data.categories,
    recommended: works.filter((work) => work.recommended).map((work) => work.id),
    works,
  };
}
