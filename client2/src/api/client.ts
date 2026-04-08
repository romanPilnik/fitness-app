import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from 'axios';
import { getApiV1BaseUrl } from './config';
import { getAuthToken } from './authToken';
import { ApiError, tryParseApiErrorBody } from './errors';
import { notifyUnauthorized } from './unauthorized';
import type { ApiSuccessBody } from './types';

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register');
}

function unwrapEnvelope<T>(data: unknown): T {
  if (!data || typeof data !== 'object' || !('success' in data)) {
    throw new ApiError('Invalid response from server', 'INVALID_RESPONSE');
  }
  const body = data as Partial<ApiSuccessBody<T>> & { success: boolean };
  if (body.success === true && 'data' in body) {
    return body.data as T;
  }
  const err = tryParseApiErrorBody(data);
  if (err) throw err;
  throw new ApiError('Invalid response from server', 'INVALID_RESPONSE');
}

export const api: AxiosInstance = axios.create({
  baseURL: getApiV1BaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError(error) || error.response == null) {
      return Promise.reject(error);
    }
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401 && !isPublicAuthPath(error.config?.url)) {
      notifyUnauthorized();
    }

    const apiErr = tryParseApiErrorBody(data, status);
    if (apiErr) return Promise.reject(apiErr);

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = String((data as { message: unknown }).message);
      return Promise.reject(new ApiError(msg || 'Request failed', 'HTTP_ERROR', { status }));
    }

    return Promise.reject(
      new ApiError(error.message || 'Request failed', 'HTTP_ERROR', { status, cause: error }),
    );
  },
);

export async function getEnvelope<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res: AxiosResponse<unknown> = await api.get(url, config);
  return unwrapEnvelope<T>(res.data);
}

export async function postEnvelope<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<unknown> = await api.post(url, body, config);
  return unwrapEnvelope<T>(res.data);
}

export async function patchEnvelope<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<unknown> = await api.patch(url, body, config);
  return unwrapEnvelope<T>(res.data);
}

export async function putEnvelope<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<unknown> = await api.put(url, body, config);
  return unwrapEnvelope<T>(res.data);
}

export async function deleteEnvelope<T = void>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<unknown> = await api.delete(url, config);
  if (res.status === 204 || res.data == null || res.data === '') {
    return undefined as T;
  }
  return unwrapEnvelope<T>(res.data);
}
