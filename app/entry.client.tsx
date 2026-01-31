import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
    // If the server set a basename (for HA ingress), ensure the client router uses it
    // The basename is serialized into __reactRouterContext by the server
    // We also have window.BASENAME as a fallback, injected by root.tsx
    const globalContext = (window as any).__reactRouterContext;
    const injectedBasename = (window as any).BASENAME;
    
    if (globalContext && injectedBasename && !globalContext.basename) {
        globalContext.basename = injectedBasename;
    }

    hydrateRoot(
        document,
        <StrictMode>
            <HydratedRouter />
        </StrictMode>
    );
});
