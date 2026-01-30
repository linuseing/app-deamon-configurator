import type { Route } from "./+types/configure.$blueprintId";
import { redirect, Link } from "react-router";
import { getBlueprint, generateAppsYaml } from "~/lib/blueprint.server";
import { getAppSettings, stripQuotes } from "~/lib/settings.server";
import { flattenInputs } from "~/lib/types";
import { ConfigureForm } from "~/components/ConfigureForm";

export function meta({ data }: Route.MetaArgs) {
  const name = data?.blueprint?.blueprint?.name ?? "Configure";
  return [
    { title: `${name} | AppDaemon Configurator` },
    { name: "description", content: `Configure ${name} blueprint` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { blueprintId } = params;

  if (!blueprintId) {
    throw new Response("Blueprint ID is required", { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  const blueprint = await getBlueprint(blueprintId, settings?.appdaemonPath);

  if (!blueprint) {
    throw new Response("Blueprint not found", { status: 404 });
  }

  // Get available categories from settings
  const categories = settings?.categories ?? [];

  return { blueprint, blueprintId, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { blueprintId } = params;

  if (!blueprintId) {
    throw new Response("Blueprint ID is required", { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Parse config values (blueprintId is already from params)
  const { blueprintId: _, _instanceName, _category, _tags, ...values } = data;
  
  // Get the instance name from the form
  const instanceName = stripQuotes(_instanceName as string) || blueprintId.replace(/-/g, "_");
  
  // Get category and tags
  const category = stripQuotes(_category as string) || undefined;
  let tags: string[] = [];
  try {
    const tagsRaw = _tags as string;
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    tags = [];
  }

  const blueprint = await getBlueprint(blueprintId as string, settings?.appdaemonPath);
  if (!blueprint) {
    throw new Response("Blueprint not found", { status: 404 });
  }

  // Convert string values to appropriate types based on blueprint input definitions
  // Flatten keys to find nested inputs
  const flatInputs = flattenInputs(blueprint.input);
  const typedValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    const inputDef = flatInputs[key];
    const strValue = stripQuotes(value as string);
    
    if (!inputDef?.selector) {
      typedValues[key] = strValue;
      continue;
    }

    const selector = inputDef.selector;

    // Handle type conversions
    if ("number" in selector) {
      typedValues[key] = Number(strValue);
    } else if ("boolean" in selector) {
      typedValues[key] = strValue === "true" || strValue === "on";
    } else {
      typedValues[key] = strValue;
    }
  }

  const yaml = generateAppsYaml(blueprint, typedValues, blueprintId as string, instanceName);

  const previewData = JSON.stringify({
    yaml,
    blueprintId,
    blueprintName: blueprint.blueprint.name,
    instanceName,
    config: typedValues,
    category,
    tags,
  });
  const encodedPreview = Buffer.from(previewData).toString("base64");

  return redirect("/preview", {
    headers: {
      "Set-Cookie": `preview_data=${encodedPreview}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
    },
  });
}

export default function Configure({ loaderData }: Route.ComponentProps) {
  const { blueprint, blueprintId, categories } = loaderData;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
          <Link to="/" className="hover:text-base-content">
            Blueprints
          </Link>
          <span>/</span>
          <span className="text-base-content">{blueprint.blueprint.name}</span>
        </div>
        <h1 className="text-xl font-semibold">{blueprint.blueprint.name}</h1>
        <p className="text-sm text-base-content/50 mt-1">
          {blueprint.blueprint.description}
        </p>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <ConfigureForm blueprint={blueprint} blueprintId={blueprintId} availableCategories={categories} />
      </div>
    </div>
  );
}
