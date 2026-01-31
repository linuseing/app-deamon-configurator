import express from "express";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { blueprintsRouter } from "./routes/blueprints.js";
import { instancesRouter } from "./routes/instances.js";
import { entitiesRouter } from "./routes/entities.js";
import { servicesRouter } from "./routes/services.js";
import { settingsRouter } from "./routes/settings.js";
import { uploadRouter } from "./routes/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware
app.use(compression());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(express.json());

// For file uploads (raw body for zip files)
app.use("/api/upload-blueprints", express.raw({ type: "application/zip", limit: "50mb" }));

// Debug: Log ingress path header
app.use((req, res, next) => {
  const ingressPath = req.headers["x-ingress-path"];
  if (ingressPath) {
    console.log(`[Ingress] X-Ingress-Path: ${ingressPath}`);
  }
  next();
});

// API routes
app.use("/api/blueprints", blueprintsRouter);
app.use("/api/instances", instancesRouter);
app.use("/api/entities", entitiesRouter);
app.use("/api/notify-services", servicesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload-blueprints", uploadRouter);

// Serve static frontend files (in production)
const publicDir = process.env.NODE_ENV === "production" 
  ? path.join(__dirname, "..", "public")
  : path.join(__dirname, "..", "..", "frontend", "dist");

app.use(express.static(publicDir, {
  maxAge: "1h",
}));

// Fallback to index.html for SPA routing (Express 5 uses /* pattern with named param)
app.get("/*splat", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  if (process.env.ADDON_MODE === "true") {
    console.log("Running in Home Assistant add-on mode");
  }
});
