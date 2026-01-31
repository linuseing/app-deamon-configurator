import { Router } from "express";
import { HomeAssistantClient } from "../lib/homeassistant.js";
import { getAppSettings, getHASettings } from "../lib/settings.js";

export const entitiesRouter = Router();

// GET /api/entities - Fetch entities from Home Assistant
entitiesRouter.get("/", async (req, res) => {
  try {
    const domain = req.query.domain as string | undefined;
    const domains = domain ? domain.split(",") : undefined;

    const settings = await getAppSettings(req.cookies || {});

    if (!settings) {
      return res.status(401).json({ error: "No settings found" });
    }

    const haSettings = getHASettings(settings);
    if (!haSettings) {
      return res.status(401).json({ error: "No Home Assistant settings configured" });
    }

    const client = new HomeAssistantClient(haSettings);
    const entities = await client.getEntities(domains);

    // Map to a simplified format for the UI
    const simplified = entities.map((e) => ({
      value: e.entity_id,
      label: e.attributes.friendly_name || e.entity_id,
      domain: e.entity_id.split(".")[0],
    }));

    res.json({ entities: simplified });
  } catch (error) {
    console.error("Failed to fetch entities:", error);
    res.status(500).json({ error: "Failed to fetch entities from Home Assistant" });
  }
});
