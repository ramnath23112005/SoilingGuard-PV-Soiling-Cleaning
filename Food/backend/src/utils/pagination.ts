export interface PageQuery {
  page?: number;
  limit?: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function parsePagination(query: PageQuery | undefined, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, Number(query?.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(query?.limit) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta(page: number, limit: number, total: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
