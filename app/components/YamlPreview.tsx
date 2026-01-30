import { useState } from "react";
import { Link, useNavigate } from "react-router";

interface YamlPreviewProps {
  yaml: string;
  blueprintId: string;
  blueprintName: string;
  instanceName: string;
  config: Record<string, unknown>;
  hasAppdaemonPath: boolean;
  category?: string;
  tags?: string[];
}

export function YamlPreview({
  yaml,
  blueprintId,
  blueprintName,
  instanceName,
  config,
  hasAppdaemonPath,
  category,
  tags,
}: YamlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/instances/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blueprintId,
          instanceName,
          config,
          category,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save instance");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/instances");
      }, 1500);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Generated Configuration</h2>
          <p className="text-sm text-base-content/50">
            Save to apps.yaml or copy manually
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/configure/${blueprintId}`}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </Link>
          <button
            onClick={handleCopy}
            className={`btn btn-sm ${copied ? "btn-success" : "btn-ghost"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {hasAppdaemonPath ? (
            <button
              onClick={handleSave}
              disabled={saving || saveSuccess}
              className={`btn btn-sm ${saveSuccess ? "btn-success" : "btn-primary"}`}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save to apps.yaml
                </>
              )}
            </button>
          ) : (
            <Link to="/settings" className="btn btn-sm btn-primary">
              Configure Path
            </Link>
          )}
        </div>
      </div>

      {saveError && (
        <div className="p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm">
          {saveError}
        </div>
      )}

      {!hasAppdaemonPath && (
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 text-warning text-sm">
          Configure your AppDaemon apps folder path in Settings to save directly to apps.yaml.
        </div>
      )}

      <div className="rounded-lg border border-base-300 bg-base-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-base-300 bg-base-300/50">
          <span className="text-xs text-base-content/50 font-mono">apps.yaml</span>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-base-content">{yaml}</code>
        </pre>
      </div>

      <div className="p-3 rounded-lg bg-base-200/50 border border-base-300">
        <h3 className="text-sm font-medium mb-2">Next Steps</h3>
        <ol className="text-xs text-base-content/60 space-y-1 list-decimal list-inside">
          {hasAppdaemonPath ? (
            <>
              <li>Click "Save to apps.yaml" to add this configuration automatically</li>
              <li>Ensure <code className="bg-base-200 px-1 py-0.5 rounded">{blueprintId.replace(/-/g, "_")}.py</code> exists in your apps folder</li>
              <li>Restart AppDaemon to load the configuration</li>
            </>
          ) : (
            <>
              <li>Copy the configuration above to your AppDaemon <code className="bg-base-200 px-1 py-0.5 rounded">apps.yaml</code></li>
              <li>Ensure <code className="bg-base-200 px-1 py-0.5 rounded">{blueprintId.replace(/-/g, "_")}.py</code> exists in your apps folder</li>
              <li>Restart AppDaemon to load the configuration</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
}
