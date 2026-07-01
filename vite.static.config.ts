import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "node:fs";
import path from "node:path";

const env = loadEnv("", process.cwd(), "VITE");

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
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "dist-static",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") &&
              !id.includes("react-router") &&
              !id.includes("react-query")
            ) {
              return "vendor";
            }
            if (id.includes("react-router")) return "router";
            if (id.includes("i18n")) return "i18n";
            return "vendor";
          }
        },
      },
    },
  },
});