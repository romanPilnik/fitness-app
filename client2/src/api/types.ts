export type ApiSuccessBody<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
};
