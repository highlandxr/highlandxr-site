import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@data": fileURLToPath(new URL("./data", import.meta.url))
    }
  },
  build: {
    manifest: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("@react-three/fiber") ||
            id.includes("react-reconciler") ||
            id.includes("three")
          ) {
            return "scene-vendor";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("react-dom") || id.includes("/react/")) {
            return "react-vendor";
          }
        }
      }
    }
  }
});
