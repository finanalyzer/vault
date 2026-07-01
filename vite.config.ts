import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "node:fs";
import path from "node:path";

const env = loadEnv("", process.cwd(), "");

function getApiHostnames(): string[] {
  const hosts: string[] = [];
  const apiUrl = env.VITE_API_BASE_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      hosts.push(url.hostname);
    } catch { /* ignore invalid URL */ }
  }
  if (env.VITE_APP_HOST) {
    hosts.push(...env.VITE_APP_HOST.split(",").map(h => h.trim()).filter(Boolean));
  }
  return hosts;
}

function existsSync(relativePath: string): boolean {
  return fs.existsSync(path.resolve(process.cwd(), relativePath));
}

const staticCopyTargets: { src: string; dest: string }[] = [];

if (existsSync("node_modules/@openbb/ui/dist/assets")) {
  staticCopyTargets.push({
    src: "node_modules/@openbb/ui/dist/assets/*",
    dest: "",
  });
}

export default defineConfig({
  base: env.VITE_APP_BASE || "/vault/",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    ...(staticCopyTargets.length > 0
      ? [
          viteStaticCopy({
            targets: staticCopyTargets,
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
    open: false,
    allowedHosts: getApiHostnames(),
    proxy: {
      "/api": {
        target: env.VITE_API_BASE_URL || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)/,
              priority: 30,
            },
            {
              name: "router",
              test: /node_modules[\\/](@tanstack|react-router)/,
              priority: 25,
            },
            {
              name: "ui-vendor",
              test: /node_modules[\\/](antd|@openbb|lucide|@radix-ui)/,
              priority: 15,
            },
            {
              name: "i18n",
              test: /node_modules[\\/](i18next|react-i18next)/,
              priority: 12,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
              minSize: 20000,
              maxSize: 250000,
            },
            {
              name: "common",
              minShareCount: 2,
              minSize: 10000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
});