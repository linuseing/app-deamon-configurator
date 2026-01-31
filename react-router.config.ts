import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    // Disable route module splitting - load all routes upfront
    // This avoids the dynamic import path issues with ingress
    v8_splitRouteModules: false,
  },
} satisfies Config;
