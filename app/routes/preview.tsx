import type { Route } from "./+types/preview";
import { redirect } from "react-router";
import { YamlPreview } from "~/components/YamlPreview";
import { getAppSettings, isAddonMode } from "~/lib/settings.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Preview | AppDaemon Configurator" },
    { name: "description", content: "Preview generated apps.yaml configuration" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const previewData = parsePreviewCookie(cookieHeader);

  if (!previewData) {
    return redirect("/");
  }

  // Check if AppDaemon path is configured (always true in add-on mode)
  const settings = await getAppSettings(cookieHeader);
  const hasAppdaemonPath = isAddonMode() || !!settings?.appdaemonPath;

  return { ...previewData, hasAppdaemonPath };
}

function parsePreviewCookie(cookieHeader: string) {
  const match = cookieHeader.match(/preview_data=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = Buffer.from(match[1], "base64").toString("utf-8");
    return JSON.parse(decoded) as {
      yaml: string;
      blueprintId: string;
      blueprintName: string;
      instanceName: string;
      config: Record<string, unknown>;
      category?: string;
      tags?: string[];
    };
  } catch {
    return null;
  }
}

export default function Preview({ loaderData }: Route.ComponentProps) {
  const { yaml, blueprintId, blueprintName, instanceName, config, hasAppdaemonPath, category, tags } = loaderData;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <YamlPreview
        yaml={yaml}
        blueprintId={blueprintId}
        blueprintName={blueprintName}
        instanceName={instanceName}
        config={config}
        hasAppdaemonPath={hasAppdaemonPath}
        category={category}
        tags={tags}
      />
    </div>
  );
}
