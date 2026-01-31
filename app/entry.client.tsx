import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Detect the ingress base path from the current URL
function detectBasename(): string {
  const path = window.location.pathname;
  
  // Check if we're running through HA ingress
  // Pattern: /api/hassio_ingress/<token>
  const ingressMatch = path.match(/^(\/api\/hassio_ingress\/[^/]+)/);
  if (ingressMatch) {
    console.log("[entry.client] Detected ingress basename:", ingressMatch[1]);
    return ingressMatch[1];
  }
  
  // No ingress path detected
  console.log("[entry.client] No ingress path detected, using /");
  return "";
}

// Get the context and fix the basename if needed
const ctx = (window as any).__reactRouterContext;
const detectedBasename = detectBasename();

console.log("[entry.client] Browser location:", window.location.pathname);
console.log("[entry.client] Server basename:", ctx?.basename);
console.log("[entry.client] Detected basename:", detectedBasename);

// Override the basename if the server got it wrong
if (ctx && detectedBasename && ctx.basename !== detectedBasename) {
  console.log("[entry.client] Overriding basename from", ctx.basename, "to", detectedBasename);
  ctx.basename = detectedBasename;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
