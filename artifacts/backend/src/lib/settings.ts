import type { AppSettings, HASettings } from "../types/index.js";
import { isAddonMode, getAddonSettings } from "./supervisor.js";

/**
 * Strip surrounding quotes from form values
 */
export function stripQuotes(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

/**
 * Parse app settings from cookie value
 * Supports both new format (app_settings) and legacy format (ha_settings)
 */
export function parseSettingsCookie(cookieValue: string | undefined): AppSettings | undefined {
  if (!cookieValue) return undefined;
  
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    return JSON.parse(decoded) as AppSettings;
  } catch {
    return undefined;
  }
}

/**
 * Encode settings to base64 for cookie storage
 */
export function encodeSettingsCookie(settings: AppSettings): string {
  return Buffer.from(JSON.stringify(settings)).toString("base64");
}

/**
 * Get app settings with automatic Supervisor detection
 * In add-on mode, returns settings from Supervisor API
 * Otherwise, falls back to cookie-based settings or environment variables
 */
export async function getAppSettings(cookies: Record<string, string>): Promise<AppSettings | undefined> {
  let settings: AppSettings | undefined;

  // Check for add-on mode first
  if (isAddonMode()) {
    const addonSettings = await getAddonSettings();
    if (addonSettings) {
      settings = addonSettings;
    }
  }

  // Get cookie-based settings
  const cookieSettings = parseSettingsCookie(cookies.app_settings) || parseSettingsCookie(cookies.ha_settings);

  // If we have both, allow cookie settings to override specific fields
  if (settings && cookieSettings) {
    if (cookieSettings.appdaemonPath) {
      settings.appdaemonPath = cookieSettings.appdaemonPath;
    }
    if (cookieSettings.categories) {
      settings.categories = cookieSettings.categories;
    }
  } else if (cookieSettings) {
    settings = cookieSettings;
  }

  // Fall back to environment variable for AppDaemon path (useful for standalone mode)
  if (!settings?.appdaemonPath && process.env.APPDAEMON_APPS_PATH) {
    settings = settings || { haUrl: "", haToken: "", appdaemonPath: "", categories: [] };
    settings.appdaemonPath = process.env.APPDAEMON_APPS_PATH;
  }

  return settings;
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
export { isAddonMode } from "./supervisor.js";
