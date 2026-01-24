interface ApiSuccess<Data> {
  success: true;
  message?: string;
  data: Data;
}

interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

interface PaginatedResponse<Docs> {
  docs: Docs[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface PaginationQuery {
  page?: number;
  limit?: number;
  q?: string;
}

export type { ApiSuccess, ApiError, PaginatedResponse, PaginationQuery };
