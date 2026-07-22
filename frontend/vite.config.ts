import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/identity-api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) =>
            path.replace(/^\/identity-api/, "/api"),
      },

      "/task-api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) =>
            path.replace(/^\/task-api/, "/api"),
      },
    },
  },
});