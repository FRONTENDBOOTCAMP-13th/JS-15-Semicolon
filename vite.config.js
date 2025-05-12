import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: "index.html", // 기본 index.html
      },
    },
  },
  appType: "mpa", // fallback 사용안함
});
