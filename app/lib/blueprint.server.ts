import fs from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import type {
  Blueprint,
  BlueprintSummary,
  ConfigValues,
} from "./types";

// Fallback blueprints directory (for development/testing without AppDaemon path)
const FALLBACK_BLUEPRINTS_DIR = path.join(process.cwd(), "blueprints");

/**
 * Get all available blueprints from the apps directory
 * Scans subdirectories for blueprint.yaml files
 */
export async function getAllBlueprints(appdaemonPath?: string): Promise<BlueprintSummary[]> {
  const blueprints: BlueprintSummary[] = [];
  const searchDir = appdaemonPath || FALLBACK_BLUEPRINTS_DIR;

  try {
    const entries = await fs.readdir(searchDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const blueprintPath = path.join(
          searchDir,
          entry.name,
          "blueprint.yaml"
        );

        try {
          const content = await fs.readFile(blueprintPath, "utf-8");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parsed = parse(content) as any;

          const input = parsed.blueprint?.input || parsed.input || {};

          blueprints.push({
            id: entry.name,
            name: parsed.blueprint.name,
            description: parsed.blueprint.description,
            domain: parsed.blueprint.domain,
            author: parsed.blueprint.author,
            inputCount: Object.keys(input).length,
          });
        } catch {
          // Skip directories without valid blueprint.yaml (e.g., just Python files)
        }
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Failed to read blueprints from ${searchDir}:`, error);
    }
  }

  return blueprints;
}

/**
 * Get a specific blueprint by ID
 */
export async function getBlueprint(id: string, appdaemonPath?: string): Promise<Blueprint | null> {
  const searchDir = appdaemonPath || FALLBACK_BLUEPRINTS_DIR;
  const blueprintPath = path.join(searchDir, id, "blueprint.yaml");

  try {
    const content = await fs.readFile(blueprintPath, "utf-8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = parse(content) as any;

    // Normalize: hoisting input from blueprint.input to root if needed
    if (parsed.blueprint?.input) {
      parsed.input = parsed.blueprint.input;
      delete parsed.blueprint.input;
    }

    return parsed as Blueprint;
  } catch {
    return null;
  }
}

/**
 * Generate apps.yaml content from blueprint and config values
 */
export function generateAppsYaml(
  blueprint: Blueprint,
  config: ConfigValues,
  blueprintId: string,
  instanceName?: string
): string {
  // Derive module name from blueprint ID (folder name)
  const moduleName = blueprintId.replace(/-/g, "_");

  // Create the app configuration
  const appConfig: Record<string, unknown> = {
    module: moduleName,
    class: toPascalCase(moduleName),
  };

  // Add all configured values (exclude internal _instanceName)
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== "" && !key.startsWith("_")) {
      appConfig[key] = value;
    }
  }

  // Generate YAML with the app instance name as the key
  const finalInstanceName = instanceName || `${moduleName}_instance`;
  const output = { [finalInstanceName]: appConfig };

  return stringify(output, {
    indent: 2,
    lineWidth: 0,
  });
}

/**
 * Convert snake_case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
