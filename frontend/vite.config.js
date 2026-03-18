import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": "http://localhost:3003",
      "/logout": "http://localhost:3003",
      "/contact": "http://localhost:3003",
      "/admin/": "http://localhost:3003",
      "/api/": "http://localhost:3003",
    },
  },
});
