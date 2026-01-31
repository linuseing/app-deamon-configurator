import type { HASettings, HAEntity } from "../types/index.js";

export class HomeAssistantClient {
    private baseUrl: string;
    private token: string;

    constructor(settings: HASettings) {
        // Remove trailing slash and any surrounding quotes that might have been saved
        this.baseUrl = settings.url.replace(/\/$/, "").replace(/^["']|["']$/g, "");
        this.token = settings.token.replace(/^["']|["']$/g, "").trim();
    }

    private async fetch<T>(path: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${path}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Home Assistant API error: ${response.statusText}`);
        }

        return response.json();
    }

    async getStates(): Promise<HAEntity[]> {
        return this.fetch<HAEntity[]>("states");
    }

    async getEntities(domain?: string | string[]): Promise<HAEntity[]> {
        const states = await this.getStates();

        if (!domain) {
            return states;
        }

        const domains = Array.isArray(domain) ? domain : [domain];

        return states.filter((entity) => {
            const entityDomain = entity.entity_id.split(".")[0];
            return domains.includes(entityDomain);
        });
    }

    async getNotificationServices(): Promise<Array<{ domain: string; services: Record<string, { name?: string; description?: string; target?: Record<string, unknown> }> }>> {
        return this.fetch<Array<{ domain: string; services: Record<string, { name?: string; description?: string; target?: Record<string, unknown> }> }>>("services");
    }
}
