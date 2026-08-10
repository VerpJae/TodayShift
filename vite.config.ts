import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "prompt",
    strategies: "injectManifest",
    srcDir: "src",
    filename: "service-worker.ts",
    injectManifest: {
      injectionPoint: undefined,
    },

    manifest: {
      name: "오늘은몇턴?",
      short_name: "오늘은몇턴?",
      description: "오늘 내 근무 턴 확인 앱",
      theme_color: "#ffffff",
      display: "standalone",
      icons: [],
    },
  }), cloudflare()],
});
