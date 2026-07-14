export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl) {
    // Absolute URL (e.g. http://localhost:5182) — append /api so that
    // service paths like /user/login resolve to /api/user/login.
    if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
      return configuredUrl.replace(/\/+$/, "") + "/api";
    }
    return configuredUrl;
  }
  if (isDemoMode()) {
    return "/api/mock";
  }
  return "/api";
}

export function getAppBase(): string {
  return import.meta.env.VITE_APP_BASE || '/vault/';
}