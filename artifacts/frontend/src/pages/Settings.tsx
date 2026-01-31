import { useNavigate } from "react-router-dom";
import { useSettings, useSaveSettings } from "../hooks/useSettings";
import { SettingsForm } from "../components/SettingsForm";
import type { AppSettings } from "../types";

export function Settings() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSettings();
  const saveSettings = useSaveSettings();

  const handleSubmit = async (settings: Partial<AppSettings>) => {
    try {
      await saveSettings.mutateAsync(settings);
      navigate("/");
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  const addonMode = data?.addonMode ?? false;
  const settings = data?.settings;

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

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm">
          {error.message}
        </div>
      )}

      {saveSettings.error && (
        <div className="mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm">
          {saveSettings.error.message}
        </div>
      )}

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <SettingsForm
          defaultValues={settings}
          onSubmit={handleSubmit}
          isSubmitting={saveSettings.isPending}
          addonMode={addonMode}
        />
      </div>
    </div>
  );
}
