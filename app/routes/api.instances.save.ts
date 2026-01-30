import type { Route } from "./+types/api.instances.save";
import { createAppInstance, getAppInstances, generateInstanceId, toPascalCase } from "~/lib/apps.server";
import { getAppSettings } from "~/lib/settings.server";

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  if (!settings?.appdaemonPath) {
    return Response.json(
      { error: "AppDaemon path not configured. Please configure it in Settings." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { blueprintId, config, instanceName, instanceId: providedInstanceId, category, tags } = body as {
      blueprintId: string;
      config: Record<string, unknown>;
      instanceName?: string;
      instanceId?: string;
      category?: string;
      tags?: string[];
    };

    if (!blueprintId) {
      return Response.json({ error: "Blueprint ID is required" }, { status: 400 });
    }

    // Get existing instances to generate unique ID if needed
    const existingInstances = await getAppInstances(settings.appdaemonPath);
    const existingIds = existingInstances.map((i) => i.id);

    // Use provided instance name, fallback to instanceId, or generate one
    const instanceId = instanceName || providedInstanceId || generateInstanceId(blueprintId, existingIds);
    
    // Check if instance already exists
    if (existingIds.includes(instanceId)) {
      return Response.json(
        { error: `Instance "${instanceId}" already exists. Please choose a different name.` },
        { status: 400 }
      );
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
      config,
      blueprintId,
      category,
      tags
    );

    return Response.json({
      success: true,
      instance,
      message: `Instance "${instanceId}" created successfully`,
    });
  } catch (error) {
    console.error("Failed to save instance:", error);
    return Response.json(
      { error: `Failed to save instance: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
