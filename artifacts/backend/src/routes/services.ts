import { Router } from "express";
import { HomeAssistantClient } from "../lib/homeassistant.js";
import { getAppSettings, getHASettings } from "../lib/settings.js";

export const servicesRouter = Router();

// GET /api/notify-services - Fetch notification services from Home Assistant
servicesRouter.get("/", async (req, res) => {
  try {
    const settings = await getAppSettings(req.cookies || {});

    if (!settings) {
      return res.status(401).json({ error: "No settings found" });
    }

    const haSettings = getHASettings(settings);
    if (!haSettings) {
      return res.status(401).json({ error: "No Home Assistant settings configured" });
    }

    const client = new HomeAssistantClient(haSettings);
    const servicesData = await client.getNotificationServices();

    // Extract notification services and format them
    const services: Array<{ value: string; label: string }> = [];
    
    // Find the notify domain in the array
    const notifyDomain = Array.isArray(servicesData) 
      ? servicesData.find((item: { domain: string }) => item.domain === "notify")
      : null;
    
    if (notifyDomain && notifyDomain.services) {
      for (const [serviceName, serviceData] of Object.entries(notifyDomain.services)) {
        const serviceId = `notify.${serviceName}`;
        // Use the service name, description, or create a friendly label from the service name
        let label = (serviceData as { name?: string; description?: string }).name || 
                   (serviceData as { name?: string; description?: string }).description;
        if (!label) {
          label = serviceName
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
        
        services.push({
          value: serviceId,
          label: label,
        });
      }
    }

    // Sort by label for easier browsing
    services.sort((a, b) => a.label.localeCompare(b.label));

    res.json({ services });
  } catch (error) {
    console.error("Failed to fetch notification services:", error);
    res.status(500).json({ error: "Failed to fetch notification services from Home Assistant" });
  }
});
