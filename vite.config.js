import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {}, // ✅ Define global object to avoid the error
  },
  base: "/",
  server: {
    historyApiFallback: true,
    host: "0.0.0.0", // Allow access from other devices
    port: 5173, // Your frontend port
    https: false, // Disable HTTPS
  },
});
