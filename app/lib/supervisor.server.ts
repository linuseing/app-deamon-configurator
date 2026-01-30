import fs from "node:fs/promises";
import type { AppSettings } from "./types";

/**
 * Check if we're running in Home Assistant add-on mode
 */
export function isAddonMode(): boolean {
  return process.env.ADDON_MODE === "true" || !!process.env.SUPERVISOR_TOKEN;
}

/**
 * Get the Supervisor API token
 */
export function getSupervisorToken(): string | undefined {
  return process.env.SUPERVISOR_TOKEN;
}

/**
 * Read add-on options from /data/options.json
 */
export async function getAddonOptions(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile("/data/options.json", "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Get AppDaemon apps path from add-on options or environment
 */
export async function getAddonAppdaemonPath(): Promise<string | undefined> {
  // First check environment variable (set by run.sh)
  if (process.env.APPDAEMON_APPS_PATH) {
    return process.env.APPDAEMON_APPS_PATH;
  }

  // Fall back to reading options.json directly
  const options = await getAddonOptions();
  return options.appdaemon_apps_path as string | undefined;
}

/**
 * Fetch Home Assistant configuration from Supervisor API
 */
export async function fetchHAConfig(): Promise<{ url: string } | null> {
  const token = getSupervisorToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("http://supervisor/core/api/config", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch HA config from Supervisor:", response.status);
      return null;
    }

    const data = await response.json();
    return {
      url: data.internal_url || data.external_url || "http://supervisor/core",
    };
  } catch (error) {
    console.error("Error fetching HA config from Supervisor:", error);
    return null;
  }
}

/**
 * Get app settings from Supervisor API when running as add-on
 * This provides automatic HA connection without manual configuration
 */
export async function getAddonSettings(): Promise<AppSettings | null> {
  if (!isAddonMode()) {
    return null;
  }

  const token = getSupervisorToken();
  if (!token) {
    return null;
  }

  const appdaemonPath = await getAddonAppdaemonPath();

  // In add-on mode, we use the internal Supervisor URL and the Supervisor token
  // The Supervisor token can be used to authenticate with the HA API
  return {
    haUrl: "http://supervisor/core",
    haToken: token,
    appdaemonPath: appdaemonPath || "/share/appdaemon/apps",
  };
}

/**
 * Make an authenticated request to the Home Assistant API via Supervisor
 */
export async function supervisorFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getSupervisorToken();
  if (!token) {
    throw new Error("No Supervisor token available");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `http://supervisor/core${endpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
