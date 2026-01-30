import type { Route } from "./+types/api.notify-services";
import { HomeAssistantClient } from "~/lib/homeassistant.server";
import { getAppSettings, getHASettings } from "~/lib/settings.server";

export async function loader({ request }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const appSettings = await getAppSettings(cookieHeader);

    if (!appSettings) {
        return Response.json({ error: "No settings found" }, { status: 401 });
    }

    const haSettings = getHASettings(appSettings);
    if (!haSettings) {
        return Response.json({ error: "No Home Assistant settings configured" }, { status: 401 });
    }

    try {
        const client = new HomeAssistantClient(haSettings);
        const servicesData = await client.getNotificationServices();

        // Extract notification services and format them
        // The API returns an array: [{ domain: "notify", services: { mobile_app_phone: {...} } }, ...]
        const services: Array<{ value: string; label: string }> = [];
        
        // Find the notify domain in the array
        const notifyDomain = Array.isArray(servicesData) 
            ? servicesData.find((item: { domain: string }) => item.domain === "notify")
            : null;
        
        if (notifyDomain && notifyDomain.services) {
            for (const [serviceName, serviceData] of Object.entries(notifyDomain.services)) {
                const serviceId = `notify.${serviceName}`;
                // Use the service name, description, or create a friendly label from the service name
                // e.g., "mobile_app_phone" -> "Mobile App Phone"
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

        return Response.json({ services });
    } catch (error) {
        console.error("Failed to fetch notification services:", error);
        return Response.json(
            { error: "Failed to fetch notification services from Home Assistant" },
            { status: 500 }
        );
    }
}
