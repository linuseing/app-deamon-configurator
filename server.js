import { createRequestHandler } from "@react-router/express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");

const app = express();

app.use(compression());
app.disable("x-powered-by");

// Logging
app.use(morgan("tiny"));

// Ingress Path Handling Middleware
app.use((req, res, next) => {
    const ingressPath = req.headers["x-ingress-path"];

    // If ingress path is present and URL starts with it, rewrite URL to strip it
    if (typeof ingressPath === "string" && ingressPath && req.url.startsWith(ingressPath)) {
        const originalUrl = req.url;
        req.url = req.url.slice(ingressPath.length) || "/";

        // Ensure it starts with /
        if (!req.url.startsWith("/")) {
            req.url = "/" + req.url;
        }

        console.log(`Rewrote Ingress URL: ${originalUrl} -> ${req.url}`);
    }
    next();
});

// Serve static assets from client build
// Vite puts assets in build/client/assets, served at /assets
app.use(express.static("build/client", {
    maxAge: "1h",
}));

// Import the server build
const build = await import("./build/server/index.js");

// Handle all other requests with React Router
// Handle all other requests with React Router
app.use(createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
