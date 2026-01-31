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

// Serve static assets from client build
// Vite puts assets in build/client/assets, served at /assets
app.use(express.static("build/client", {
    maxAge: "1h",
}));

// Import the server build
const build = await import("./build/server/index.js");

// Handle all other requests with React Router
app.use(createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
