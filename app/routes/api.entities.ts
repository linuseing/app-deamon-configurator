import type { Route } from "./+types/api.entities";
import { HomeAssistantClient } from "~/lib/homeassistant.server";
import { getAppSettings, getHASettings } from "~/lib/settings.server";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const domain = url.searchParams.get("domain");
    const domains = domain ? domain.split(",") : undefined;

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
        const entities = await client.getEntities(domains);

        // Map to a simplified format for the UI
        const simplified = entities.map((e) => ({
            value: e.entity_id,
            label: e.attributes.friendly_name || e.entity_id,
            domain: e.entity_id.split(".")[0],
        }));

        return Response.json({ entities: simplified });
    } catch (error) {
        console.error("Failed to fetch entities:", error);
        return Response.json(
            { error: "Failed to fetch entities from Home Assistant" },
            { status: 500 }
        );
    }
}
