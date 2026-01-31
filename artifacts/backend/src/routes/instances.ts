import { Router } from "express";
import {
  getAppInstances,
  getAppInstance,
  createAppInstance,
  updateAppInstance,
  deleteAppInstance,
  generateInstanceId,
} from "../lib/apps.js";
import { getBlueprint, toPascalCase } from "../lib/blueprint.js";
import { getAppSettings, stripQuotes } from "../lib/settings.js";
import { flattenInputs } from "../types/index.js";

export const instancesRouter = Router();

// GET /api/instances - List all instances
instancesRouter.get("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});
    
    if (!settings?.appdaemonPath) {
      return res.json({ instances: [], needsSettings: true, categories: [] });
    }

    const instances = await getAppInstances(settings.appdaemonPath);
    const categories = settings.categories ?? [];
    
    res.json({ instances, needsSettings: false, categories });
  } catch (error) {
    console.error("Failed to get instances:", error);
    res.status(500).json({ error: "Failed to get instances" });
  }
});

// GET /api/instances/:id - Get a specific instance
instancesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getAppSettings(req.cookies || {});
    
    if (!settings?.appdaemonPath) {
      return res.status(400).json({ error: "AppDaemon path not configured" });
    }

    const instance = await getAppInstance(settings.appdaemonPath, id);
    
    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

    // If the instance has a blueprint, load it
    let blueprint = null;
    if (instance._blueprint) {
      blueprint = await getBlueprint(instance._blueprint, settings.appdaemonPath);
    }

    const categories = settings.categories ?? [];
    
    res.json({ instance, blueprint, categories });
  } catch (error) {
    console.error("Failed to get instance:", error);
    res.status(500).json({ error: "Failed to get instance" });
  }
});

// POST /api/instances - Create a new instance
instancesRouter.post("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});
    
    if (!settings?.appdaemonPath) {
      return res.status(400).json({ error: "AppDaemon path not configured. Please configure it in Settings." });
    }

    const { blueprintId, config, instanceName, category, tags } = req.body as {
      blueprintId: string;
      config: Record<string, unknown>;
      instanceName?: string;
      category?: string;
      tags?: string[];
    };

    if (!blueprintId) {
      return res.status(400).json({ error: "Blueprint ID is required" });
    }

    // Get blueprint for type conversion
    const blueprint = await getBlueprint(blueprintId, settings.appdaemonPath);
    if (!blueprint) {
      return res.status(404).json({ error: "Blueprint not found" });
    }

    // Convert values based on blueprint input definitions
    const flatInputs = flattenInputs(blueprint.input);
    const typedValues: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(config || {})) {
      const inputDef = flatInputs[key];
      const strValue = typeof value === "string" ? stripQuotes(value) : value;

      if (!inputDef?.selector) {
        typedValues[key] = strValue;
        continue;
      }

      const selector = inputDef.selector;

      if ("number" in selector) {
        typedValues[key] = Number(strValue);
      } else if ("boolean" in selector) {
        typedValues[key] = strValue === "true" || strValue === true;
      } else {
        typedValues[key] = strValue;
      }
    }

    // Get existing instances to generate unique ID if needed
    const existingInstances = await getAppInstances(settings.appdaemonPath);
    const existingIds = existingInstances.map((i) => i.id);

    // Use provided instance name or generate one
    const instanceId = instanceName || generateInstanceId(blueprintId, existingIds);

    // Check if instance already exists
    if (existingIds.includes(instanceId)) {
      return res.status(400).json({ error: `Instance "${instanceId}" already exists. Please choose a different name.` });
    }

    // Derive module and class from blueprint ID
    const moduleName = blueprintId.replace(/-/g, "_");
    const className = toPascalCase(moduleName);

    // Create the instance
    const instance = await createAppInstance(
      settings.appdaemonPath,
      instanceId,
      moduleName,
      className,
      typedValues,
      blueprintId,
      category,
      tags
    );

    res.json({
      success: true,
      instance,
      message: `Instance "${instanceId}" created successfully`,
    });
  } catch (error) {
    console.error("Failed to create instance:", error);
    res.status(500).json({ error: `Failed to create instance: ${(error as Error).message}` });
  }
});

// PUT /api/instances/:id - Update an existing instance
instancesRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getAppSettings(req.cookies || {});
    
    if (!settings?.appdaemonPath) {
      return res.status(400).json({ error: "AppDaemon path not configured" });
    }

    const instance = await getAppInstance(settings.appdaemonPath, id);
    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

    const { config, newInstanceId, category, tags } = req.body as {
      config: Record<string, unknown>;
      newInstanceId?: string;
      category?: string;
      tags?: string[];
    };

    // Get blueprint for type conversion
    let blueprint = null;
    if (instance._blueprint) {
      blueprint = await getBlueprint(instance._blueprint, settings.appdaemonPath);
    }

    // Convert values based on blueprint input definitions
    const typedValues: Record<string, unknown> = {};

    if (blueprint) {
      const flatInputs = flattenInputs(blueprint.input);

      for (const [key, value] of Object.entries(config || {})) {
        const inputDef = flatInputs[key];
        const strValue = typeof value === "string" ? stripQuotes(value) : value;

        if (!inputDef?.selector) {
          typedValues[key] = strValue;
          continue;
        }

        const selector = inputDef.selector;

        if ("number" in selector) {
          typedValues[key] = Number(strValue);
        } else if ("boolean" in selector) {
          typedValues[key] = strValue === "true" || strValue === true;
        } else {
          typedValues[key] = strValue;
        }
      }
    } else {
      // No blueprint, just pass values through
      for (const [key, value] of Object.entries(config || {})) {
        typedValues[key] = typeof value === "string" ? stripQuotes(value) : value;
      }
    }

    const updated = await updateAppInstance(
      settings.appdaemonPath,
      id,
      typedValues,
      newInstanceId,
      category,
      tags
    );

    res.json({ success: true, instance: updated });
  } catch (error) {
    console.error("Failed to update instance:", error);
    res.status(500).json({ error: `Failed to update instance: ${(error as Error).message}` });
  }
});

// DELETE /api/instances/:id - Delete an instance
instancesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getAppSettings(req.cookies || {});
    
    if (!settings?.appdaemonPath) {
      return res.status(400).json({ error: "AppDaemon path not configured" });
    }

    await deleteAppInstance(settings.appdaemonPath, id);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete instance:", error);
    res.status(500).json({ error: `Failed to delete instance: ${(error as Error).message}` });
  }
});
