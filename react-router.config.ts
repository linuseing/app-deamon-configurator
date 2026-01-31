import type { Config } from "@react-router/dev/config";

export default {
  // Disable SSR - use SPA mode for simpler ingress handling
  // In SPA mode, we can set the basename cleanly at client startup
  // without needing server/client coordination
  ssr: false,
} satisfies Config;
