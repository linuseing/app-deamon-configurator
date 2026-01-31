import { Router } from "express";
import { getAllBlueprints, getBlueprint } from "../lib/blueprint.js";
import { getAppSettings } from "../lib/settings.js";

export const blueprintsRouter = Router();

// GET /api/blueprints - List all blueprints
blueprintsRouter.get("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});
    const blueprints = await getAllBlueprints(settings?.appdaemonPath);
    
    res.json({ blueprints });
  } catch (error) {
    console.error("Failed to get blueprints:", error);
    res.status(500).json({ error: "Failed to get blueprints" });
  }
});

// GET /api/blueprints/:id - Get a specific blueprint
blueprintsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getAppSettings(req.cookies || {});
    const blueprint = await getBlueprint(id, settings?.appdaemonPath);
    
    if (!blueprint) {
      return res.status(404).json({ error: "Blueprint not found" });
    }
    
    res.json({ blueprint, blueprintId: id });
  } catch (error) {
    console.error("Failed to get blueprint:", error);
    res.status(500).json({ error: "Failed to get blueprint" });
  }
});
