export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl) {
    return configuredUrl;
  }
  if (isDemoMode()) {
    return '/api/mock';
  }
  return '/api';
}

export function getAppBase(): string {
  return import.meta.env.VITE_APP_BASE || '/vault/';
}