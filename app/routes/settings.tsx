import type { Route } from "./+types/settings";
import { redirect } from "react-router";
import { SettingsForm } from "~/components/SettingsForm";
import { getAppSettings, stripQuotes, isAddonMode } from "~/lib/settings.server";
import type { AppSettings } from "~/lib/types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Settings | AppDaemon Configurator" },
    { name: "description", content: "Configure Home Assistant and AppDaemon settings" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  // Fetch effective settings (Add-on defaults + Cookie overrides)
  const settings = await getAppSettings(cookieHeader);
  const addonMode = isAddonMode();
  return { settings, addonMode };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const haUrl = stripQuotes(formData.get("haUrl") as string);
  const haToken = stripQuotes(formData.get("haToken") as string);
  const appdaemonPath = stripQuotes(formData.get("appdaemonPath") as string);
  const categoriesRaw = formData.get("categories") as string;

  // Parse categories from JSON
  let categories: string[] = [];
  try {
    categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];
  } catch {
    categories = [];
  }

  const settings: AppSettings = { haUrl, haToken, appdaemonPath, categories };
  const encodedSettings = Buffer.from(JSON.stringify(settings)).toString("base64");

  return redirect("/", {
    headers: {
      "Set-Cookie": `app_settings=${encodedSettings}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
    },
  });
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { settings, addonMode } = loaderData;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-base-content/50 mt-1">
          {addonMode
            ? "Configure categories and other options"
            : "Configure Home Assistant and AppDaemon connections"}
        </p>
      </div>

      {addonMode && (
        <div className="mb-4 p-3 rounded-lg border border-info/30 bg-info/5">
          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-info flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-base-content/80">
              Running as Home Assistant add-on. Connection settings are automatically configured.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <SettingsForm defaultValues={settings} addonMode={addonMode} />
      </div>
    </div>
  );
}
