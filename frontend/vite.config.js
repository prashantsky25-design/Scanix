import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(), // enables HTTPS so mobile Chrome allows camera (getUserMedia requires secure context)
  ],
  server: {
    host: true,   // expose on LAN so phones can reach it
    port: 5173,
    https: true,  // required for camera permission on non-localhost devices
    proxy: { "/api": "http://localhost:5000" },
  },
});
