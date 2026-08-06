const PUBLIC_FIELDS = ["id", "inventoryNo", "artist", "title", "year", "medium", "dimensions", "category", "categoryLabel", "price", "status", "publishStatus", "recommended", "recommendedReason", "description", "image"];

export function createPublicArtworkData(data) {
  const works = data.works
    .filter((work) => work.publishStatus === "published")
    .map((work) => Object.fromEntries(PUBLIC_FIELDS.map((key) => [key, work[key]])));
  return {
    updatedAt: data.updatedAt,
    categories: data.categories,
    recommended: works.filter((work) => work.recommended).map((work) => work.id),
    works,
  };
}
