import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Detect the ingress base path from the current URL
// HA Ingress URLs look like: /api/hassio_ingress/<token>/
function detectBasename(): string {
  const path = window.location.pathname;
  
  // Check if we're running through HA ingress
  const ingressMatch = path.match(/^(\/api\/hassio_ingress\/[^/]+)/);
  if (ingressMatch) {
    return ingressMatch[1];
  }
  
  // Check for other common HA addon panel paths
  const addonMatch = path.match(/^(\/[^/]+_[^/]+\/ingress)/);
  if (addonMatch) {
    return addonMatch[1];
  }
  
  // No ingress path detected, use root
  return "";
}

startTransition(() => {
  const basename = detectBasename();
  
  // Set the basename on the React Router context before hydration
  const ctx = (window as any).__reactRouterContext;
  if (ctx) {
    ctx.basename = basename;
  }
  
  // Also store for any components that might need it
  (window as any).__BASENAME__ = basename;

  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
