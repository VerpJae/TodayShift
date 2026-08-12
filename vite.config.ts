import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    injectRegister: false,
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
      lang: "ko",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  }), cloudflare()],
});
