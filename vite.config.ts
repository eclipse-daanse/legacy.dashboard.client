import { fileURLToPath, URL } from "node:url";
/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteRequire } from "vite-require";
import nightwatchPlugin from 'vite-plugin-nightwatch';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteRequire(),
    nightwatchPlugin({
      renderPage: "",
      componentType: 'vue'
    })

  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env": {},
  },
  test:{
    testTimeout:30000
  }
});
