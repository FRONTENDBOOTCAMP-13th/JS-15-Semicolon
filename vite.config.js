import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { sign } from "crypto";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        card: "src/components/card.html",
        detail: "src/components/detail.html",
        login: "src/components/login.html",
        signup: "src/components/signup.html",
      },
    },
  },
  plugins: [tailwindcss()],
  appType: "mpa",
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    proxy: {
      "/api": {
        target: "https://apis.data.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // 기상청 중기예보 api 프록시
      "/weather-api": {
        target: "https://apis.data.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/weather-api/, ""),
      },
    },
  },
});
