import { DesignSystemProvider, Icon } from "@openbb/ui";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/history";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import "./index.css";
import i18n from "./i18n";
import { routeTree } from "./routeTree.gen";
import { getApiBaseUrl, isDemoMode } from "./utils/environment";

const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.toggle("dark", savedTheme === "dark");

console.log("=== passxyz-web MAIN.TSX FILE LOADED ===");
console.log(`=== passxyz-web: API Base URL: ${getApiBaseUrl()} ===`);
console.log(`=== passxyz-web: Demo Mode: ${isDemoMode()} ===`);
console.log(`=== passxyz-web: VITE_APP_BASE: ${import.meta.env.VITE_APP_BASE || 'not set'} ===`);
console.log(`=== passxyz-web: BASE_URL: ${import.meta.env.BASE_URL || 'not set'} ===`);

const token = localStorage.getItem('passxyz-token');
const user = localStorage.getItem('passxyz-user');
console.log(`=== passxyz-web: passxyz-token present: ${!!token} ===`);
console.log(`=== passxyz-web: passxyz-user present: ${!!user} ===`);

Icon.defaultUrl = `${import.meta.env.BASE_URL}/spritemap.svg`;

const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <DesignSystemProvider value={{ tailwind: {} }}>
            <RouterProvider router={router} />
          </DesignSystemProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}