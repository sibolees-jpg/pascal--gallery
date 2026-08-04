import { filterCasesByService, getCaseById, isKnownService } from "./case-tools.mjs";

export const EMPTY_SERVICE_MESSAGE = "该分类的公开案例正在整理。";
export const UNKNOWN_SERVICE_MESSAGE = "未找到对应服务，已展示全部案例";
export const MISSING_CASE_MESSAGE = "未找到这个案例";
export const MISSING_IMAGE_MESSAGE = "项目影像资料正在整理。";

export function getCaseListViewModel(cases, services, requestedService) {
  const hasRequestedService = Boolean(requestedService);
  const isValidService = hasRequestedService && isKnownService(services, requestedService);
  const activeService = isValidService ? requestedService : null;
  const visibleCases = filterCasesByService(cases, activeService);
  const publicCases = filterCasesByService(cases, null);

  return {
    activeService,
    cases: visibleCases,
    emptyMessage: activeService && !visibleCases.length ? EMPTY_SERVICE_MESSAGE : null,
    filters: [
      {
        id: null,
        title: "全部案例",
        count: publicCases.length,
        isActive: activeService === null,
      },
      ...services.map((service) => ({
        id: service.id,
        title: service.title,
        count: filterCasesByService(cases, service.id).length,
        isActive: activeService === service.id,
      })),
    ],
    notice: hasRequestedService && !isValidService ? UNKNOWN_SERVICE_MESSAGE : null,
  };
}

export function getCaseDetailViewModel(cases, caseId) {
  const currentCase = getCaseById(cases, caseId);

  return {
    currentCase,
    imageMessage: currentCase && !currentCase.images.length ? MISSING_IMAGE_MESSAGE : null,
    notFoundMessage: currentCase ? null : MISSING_CASE_MESSAGE,
  };
}
