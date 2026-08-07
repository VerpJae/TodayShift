import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "TodayShift",
        short_name: "TodayShift",
        description: "오늘 내 근무 턴 확인 앱",
        theme_color: "#ffffff",
        icons: [],
      },
    }),
  ],
});