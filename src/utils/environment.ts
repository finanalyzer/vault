export function isDemoMode(): boolean {
  return window.location.hostname === 'finanalyzer.github.io';
}

export function getApiBaseUrl(): string {
  if (isDemoMode()) {
    return '/api/mock';
  }
  return '/api';
}

export function getAppBase(): string {
  return import.meta.env.VITE_APP_BASE || '/vault/';
}