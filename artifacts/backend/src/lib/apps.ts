import fs from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import type { AppInstance, AppInstanceSummary, Blueprint, ConfigValues } from "../types/index.js";
import { getBlueprint, toPascalCase } from "./blueprint.js";

/**
 * Get the apps.yaml file path from AppDaemon path
 */
function getAppsYamlPath(appdaemonPath: string): string {
  return path.join(appdaemonPath, "apps.yaml");
}

/**
 * Read and parse apps.yaml file
 */
async function readAppsYaml(appdaemonPath: string): Promise<Record<string, Record<string, unknown>>> {
  const appsYamlPath = getAppsYamlPath(appdaemonPath);
  
  try {
    const content = await fs.readFile(appsYamlPath, "utf-8");
    const parsed = parse(content);
    return parsed || {};
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist yet, return empty object
      return {};
    }
    throw error;
  }
}

/**
 * Write apps.yaml file
 */
async function writeAppsYaml(
  appdaemonPath: string,
  apps: Record<string, Record<string, unknown>>
): Promise<void> {
  const appsYamlPath = getAppsYamlPath(appdaemonPath);
  
  // Ensure directory exists
  await fs.mkdir(appdaemonPath, { recursive: true });
  
  const yamlContent = stringify(apps, {
    indent: 2,
    lineWidth: 0,
  });
  
  await fs.writeFile(appsYamlPath, yamlContent, "utf-8");
}

// Reserved keys that are not part of the config
const RESERVED_KEYS = ["module", "class", "_blueprint", "_category", "_tags"];

/**
 * Get all app instances from apps.yaml
 */
export async function getAppInstances(appdaemonPath: string): Promise<AppInstanceSummary[]> {
  const apps = await readAppsYaml(appdaemonPath);
  const instances: AppInstanceSummary[] = [];

  for (const [id, config] of Object.entries(apps)) {
    if (!config || typeof config !== "object") continue;
    
    const module = config.module as string | undefined;
    const className = config.class as string | undefined;
    const blueprintId = config._blueprint as string | undefined;
    const category = config._category as string | undefined;
    const tags = config._tags as string[] | undefined;
    
    if (!module || !className) continue;
    
    // Try to get blueprint name if we have a blueprint ID
    let blueprintName: string | undefined;
    if (blueprintId) {
      const blueprint = await getBlueprint(blueprintId, appdaemonPath);
      blueprintName = blueprint?.blueprint?.name;
    }
    
    // Count config entries (excluding reserved keys)
    const configCount = Object.keys(config).filter(
      (key) => !RESERVED_KEYS.includes(key)
    ).length;

    instances.push({
      id,
      module,
      class: className,
      blueprintId,
      blueprintName,
      configCount,
      category,
      tags,
    });
  }

  return instances;
}

/**
 * Get a single app instance by ID
 */
export async function getAppInstance(
  appdaemonPath: string,
  instanceId: string
): Promise<AppInstance | null> {
  const apps = await readAppsYaml(appdaemonPath);
  const config = apps[instanceId];
  
  if (!config || typeof config !== "object") {
    return null;
  }

  const module = config.module as string | undefined;
  const className = config.class as string | undefined;
  const blueprintId = config._blueprint as string | undefined;
  const category = config._category as string | undefined;
  const tags = config._tags as string[] | undefined;

  if (!module || !className) {
    return null;
  }

  // Extract config (everything except reserved keys)
  const configValues: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!RESERVED_KEYS.includes(key)) {
      configValues[key] = value;
    }
  }

  return {
    id: instanceId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config: configValues,
  };
}

/**
 * Create a new app instance
 */
export async function createAppInstance(
  appdaemonPath: string,
  instanceId: string,
  module: string,
  className: string,
  config: ConfigValues,
  blueprintId?: string,
  category?: string,
  tags?: string[]
): Promise<AppInstance> {
  const apps = await readAppsYaml(appdaemonPath);

  if (apps[instanceId]) {
    throw new Error(`Instance "${instanceId}" already exists`);
  }

  const appConfig: Record<string, unknown> = {
    module,
    class: className,
  };

  // Add blueprint reference if provided
  if (blueprintId) {
    appConfig._blueprint = blueprintId;
  }

  // Add category if provided
  if (category) {
    appConfig._category = category;
  }

  // Add tags if provided
  if (tags && tags.length > 0) {
    appConfig._tags = tags;
  }

  // Add all config values
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== "") {
      appConfig[key] = value;
    }
  }

  apps[instanceId] = appConfig;
  await writeAppsYaml(appdaemonPath, apps);

  return {
    id: instanceId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config,
  };
}

/**
 * Update an existing app instance
 */
export async function updateAppInstance(
  appdaemonPath: string,
  instanceId: string,
  config: ConfigValues,
  newInstanceId?: string,
  category?: string,
  tags?: string[]
): Promise<AppInstance> {
  const apps = await readAppsYaml(appdaemonPath);
  const existingConfig = apps[instanceId];

  if (!existingConfig) {
    throw new Error(`Instance "${instanceId}" not found`);
  }

  const module = existingConfig.module as string;
  const className = existingConfig.class as string;
  const blueprintId = existingConfig._blueprint as string | undefined;

  // Build new config
  const appConfig: Record<string, unknown> = {
    module,
    class: className,
  };

  if (blueprintId) {
    appConfig._blueprint = blueprintId;
  }

  // Add category if provided
  if (category) {
    appConfig._category = category;
  }

  // Add tags if provided
  if (tags && tags.length > 0) {
    appConfig._tags = tags;
  }

  // Add all config values
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== "") {
      appConfig[key] = value;
    }
  }

  // Handle rename
  const finalId = newInstanceId || instanceId;
  if (newInstanceId && newInstanceId !== instanceId) {
    if (apps[newInstanceId]) {
      throw new Error(`Instance "${newInstanceId}" already exists`);
    }
    delete apps[instanceId];
  }

  apps[finalId] = appConfig;
  await writeAppsYaml(appdaemonPath, apps);

  return {
    id: finalId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config,
  };
}

/**
 * Delete an app instance
 */
export async function deleteAppInstance(
  appdaemonPath: string,
  instanceId: string
): Promise<void> {
  const apps = await readAppsYaml(appdaemonPath);

  if (!apps[instanceId]) {
    throw new Error(`Instance "${instanceId}" not found`);
  }

  delete apps[instanceId];
  await writeAppsYaml(appdaemonPath, apps);
}

/**
 * Generate a unique instance ID from blueprint ID
 */
export function generateInstanceId(
  blueprintId: string,
  existingIds: string[]
): string {
  const baseId = blueprintId.replace(/-/g, "_");
  
  // Check if base ID is available
  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  // Find next available number
  let counter = 2;
  while (existingIds.includes(`${baseId}_${counter}`)) {
    counter++;
  }
  
  return `${baseId}_${counter}`;
}

/**
 * Generate apps.yaml content from blueprint and config values
 * Returns the YAML string for preview/copy purposes
 */
export function generateAppsYamlPreview(
  blueprint: Blueprint,
  config: ConfigValues,
  instanceId: string,
  blueprintId: string
): string {
  const moduleName = blueprintId.replace(/-/g, "_");

  const appConfig: Record<string, unknown> = {
    module: moduleName,
    class: toPascalCase(moduleName),
    _blueprint: blueprintId,
  };

  // Add all configured values
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== "") {
      appConfig[key] = value;
    }
  }

  const output = { [instanceId]: appConfig };

  return stringify(output, {
    indent: 2,
    lineWidth: 0,
  });
}
