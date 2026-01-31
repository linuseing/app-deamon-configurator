import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Debug: Log what we see on the client
const ctx = (window as any).__reactRouterContext;
console.log("[entry.client] Location:", window.location.pathname);
console.log("[entry.client] __reactRouterContext:", ctx);
console.log("[entry.client] Context basename:", ctx?.basename);

startTransition(() => {
    hydrateRoot(
        document,
        <StrictMode>
            <HydratedRouter />
        </StrictMode>
    );
});
