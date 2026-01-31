import { Link } from "react-router-dom";
import { useBlueprints } from "../hooks/useBlueprints";
import { useSettings } from "../hooks/useSettings";
import { BlueprintList } from "../components/BlueprintList";
import { UploadModal } from "../components/UploadModal";

export function Home() {
  const { data: blueprints, isLoading, error } = useBlueprints();
  const { data: settingsData } = useSettings();
  
  const needsSettings = !settingsData?.addonMode && !settingsData?.settings?.appdaemonPath;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-error/30 bg-error/5 p-6 text-center">
          <p className="text-error">Failed to load blueprints: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Blueprints</h1>
          <p className="text-sm text-base-content/50 mt-1">
            Select a blueprint to configure
          </p>
        </div>
        <UploadModal />
      </div>

      {needsSettings && (
        <div className="mb-4 p-4 rounded-lg border border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-warning flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-base-content/80">
                Configure your AppDaemon apps folder path to discover blueprints.
              </p>
              <Link to="/settings" className="btn btn-warning btn-xs mt-2">
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      <BlueprintList blueprints={blueprints || []} />
    </div>
  );
}
