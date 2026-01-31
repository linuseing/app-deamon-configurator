import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Use relative paths for assets so they resolve correctly through HA ingress
  // When browser is at /api/hassio_ingress/.../
  // ./assets/... resolves to /api/hassio_ingress/.../assets/...
  // Nginx then proxies /assets/... to Node.js
  base: "./",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
