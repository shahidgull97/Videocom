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
    host: true, // Allows access from other devices
    strictPort: true, // Ensures the specified port is used
    port: 5173, // Change to your frontend port (default Vite port)
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "5ab1-2409-40d5-107f-a313-298c-f086-6bd1-de13.ngrok-free.app", // Add your current ngrok URL
    ],
  },
});
