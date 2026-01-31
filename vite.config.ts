import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Use relative paths for assets
  base: "./",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
