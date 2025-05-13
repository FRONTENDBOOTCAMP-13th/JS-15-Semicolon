import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: "index.html", // 기본 index.html
      },
    },
  },
  appType: "mpa", // fallback 사용안함
  plugins: [tailwindcss()],
});
