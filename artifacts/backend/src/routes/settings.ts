import { Router } from "express";
import { getAppSettings, encodeSettingsCookie, isAddonMode } from "../lib/settings.js";
import type { AppSettings } from "../types/index.js";

export const settingsRouter = Router();

// GET /api/settings - Get current settings
settingsRouter.get("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});
    const addonMode = isAddonMode();
    
    res.json({ settings, addonMode });
  } catch (error) {
    console.error("Failed to get settings:", error);
    res.status(500).json({ error: "Failed to get settings" });
  }
});

// POST /api/settings - Save settings
settingsRouter.post("/", async (req, res) => {
  try {
    const { haUrl, haToken, appdaemonPath, categories } = req.body as {
      haUrl?: string;
      haToken?: string;
      appdaemonPath?: string;
      categories?: string[];
    };

    const settings: AppSettings = {
      haUrl: haUrl || "",
      haToken: haToken || "",
      appdaemonPath: appdaemonPath || "",
      categories: categories || [],
    };

    const encodedSettings = encodeSettingsCookie(settings);

    // Set the cookie
    res.cookie("app_settings", encodedSettings, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 31536000000, // 1 year in milliseconds
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to save settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});
