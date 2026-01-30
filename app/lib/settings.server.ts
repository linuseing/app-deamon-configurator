import type { AppSettings, HASettings } from "./types";
import { isAddonMode, getAddonSettings } from "./supervisor.server";

/**
 * Strip surrounding quotes from form values
 * remix-hook-form JSON-encodes values which adds quotes around strings
 */
export function stripQuotes(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

/**
 * Parse app settings from cookie header
 * Supports both new format (app_settings) and legacy format (ha_settings)
 */
export function parseSettingsCookie(cookieHeader: string): AppSettings | undefined {
  // Try new format first
  const newMatch = cookieHeader.match(/app_settings=([^;]+)/);
  if (newMatch) {
    try {
      const decoded = Buffer.from(newMatch[1], "base64").toString("utf-8");
      return JSON.parse(decoded) as AppSettings;
    } catch {
      // Fall through to legacy format
    }
  }

  // Try legacy format for backwards compatibility
  const legacyMatch = cookieHeader.match(/ha_settings=([^;]+)/);
  if (legacyMatch) {
    try {
      const decoded = Buffer.from(legacyMatch[1], "base64").toString("utf-8");
      const legacy = JSON.parse(decoded) as { url: string; token: string };
      return {
        haUrl: legacy.url,
        haToken: legacy.token,
        appdaemonPath: "",
      };
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Get app settings with automatic Supervisor detection
 * In add-on mode, returns settings from Supervisor API
 * Otherwise, falls back to cookie-based settings
 */
export async function getAppSettings(cookieHeader: string): Promise<AppSettings | undefined> {
  // Check for add-on mode first
  if (isAddonMode()) {
    const addonSettings = await getAddonSettings();
    if (addonSettings) {
      return addonSettings;
    }
  }

  // Fall back to cookie-based settings
  return parseSettingsCookie(cookieHeader);
}

/**
 * Extract HA settings from app settings for use with HomeAssistantClient
 */
export function getHASettings(settings: AppSettings): HASettings | undefined {
  if (!settings.haUrl || !settings.haToken) {
    return undefined;
  }
  return {
    url: settings.haUrl,
    token: settings.haToken,
  };
}

/**
 * Get AppDaemon path from settings
 */
export function getAppdaemonPath(settings: AppSettings): string | undefined {
  return settings.appdaemonPath || undefined;
}

/**
 * Check if the app is running in add-on mode
 * Re-exported for convenience
 */
export { isAddonMode } from "./supervisor.server";
