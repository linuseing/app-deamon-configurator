import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
    // @ts-ignore
    if (window.BASENAME && window.__reactRouterContext) {
        // @ts-ignore
        window.__reactRouterContext.basename = window.BASENAME;
    }

    hydrateRoot(
        document,
        <StrictMode>
            <HydratedRouter />
        </StrictMode>
    );
});
