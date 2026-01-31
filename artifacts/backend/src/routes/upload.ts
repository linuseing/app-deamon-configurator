import { Router } from "express";
import AdmZip from "adm-zip";
import fs from "node:fs/promises";
import { getAppSettings } from "../lib/settings.js";

export const uploadRouter = Router();

// Fallback blueprints directory
const FALLBACK_BLUEPRINTS_DIR = process.cwd() + "/blueprints";

// POST /api/upload-blueprints - Upload blueprint zip file
uploadRouter.post("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});
    const appdaemonPath = settings?.appdaemonPath || FALLBACK_BLUEPRINTS_DIR;

    // Ensure directory exists
    try {
      await fs.mkdir(appdaemonPath, { recursive: true });
    } catch (err) {
      console.error("Failed to create appdaemon path:", err);
      return res.status(500).json({ error: "Failed to access AppDaemon apps directory" });
    }

    // Check if we have file data in body (raw buffer)
    if (!req.body || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: "No file provided or invalid file format" });
    }

    try {
      const zip = new AdmZip(req.body);
      const zipEntries = zip.getEntries();

      if (zipEntries.length === 0) {
        return res.status(400).json({ error: "Empty zip file" });
      }

      // Extract all to the appdaemon apps path
      zip.extractAllTo(appdaemonPath, true);

      console.log(`Extracted blueprints to ${appdaemonPath}`);

      res.json({ success: true, message: "Blueprints uploaded successfully" });
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ 
        error: "Failed to extract zip file: " + (error instanceof Error ? error.message : String(error)) 
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process upload" });
  }
});
