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

interface PaginationQuery {
  page?: number;
  limit?: number;
  q?: string;
}

export type { ApiSuccess, ApiError, PaginationQuery };
