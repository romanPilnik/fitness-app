export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '');
  }
  return 'http://localhost:5001';
}

export function getApiV1BaseUrl(): string {
  return `${getApiOrigin()}/api/v1`;
}
