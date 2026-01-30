import type { Route } from "./+types/instances";
import { Link, useFetcher } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { getAppInstances, deleteAppInstance } from "~/lib/apps.server";
import { getAppSettings, isAddonMode } from "~/lib/settings.server";
import { InstanceList } from "~/components/InstanceList";
import { DeleteConfirmModal } from "~/components/DeleteConfirmModal";
import type { AppInstanceSummary } from "~/lib/types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Instances | AppDaemon Configurator" },
    { name: "description", content: "Manage your configured app instances" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  // In add-on mode, settings are auto-configured
  if (!settings?.appdaemonPath && !isAddonMode()) {
    return { instances: [], needsSettings: true, categories: [] };
  }

  try {
    const instances = await getAppInstances(settings?.appdaemonPath || "/share/appdaemon/apps");
    const categories = settings?.categories ?? [];
    return { instances, needsSettings: false, categories };
  } catch (error) {
    console.error("Failed to load instances:", error);
    return { instances: [], needsSettings: false, error: "Failed to load instances", categories: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  if (!settings?.appdaemonPath) {
    return { error: "AppDaemon path not configured" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const instanceId = formData.get("instanceId") as string;

  if (intent === "delete" && instanceId) {
    try {
      await deleteAppInstance(settings.appdaemonPath, instanceId);
      return { success: true };
    } catch (error) {
      return { error: `Failed to delete instance: ${(error as Error).message}` };
    }
  }

  return { error: "Invalid action" };
}

export default function Instances({ loaderData }: Route.ComponentProps) {
  const { instances, needsSettings, error, categories } = loaderData;
  const fetcher = useFetcher();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");

  const handleDelete = (instanceId: string) => {
    setDeleteTarget(instanceId);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const basename = typeof window !== "undefined" ? (window as any).BASENAME || "" : "";
      fetcher.submit(
        { intent: "delete", instanceId: deleteTarget },
        { method: "POST", action: `${basename}/instances` }
      );
    }
  };

  // Close modal after successful delete
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setDeleteTarget(null);
    }
  }, [fetcher.state, fetcher.data]);

  // Get all unique tags from instances for the tag filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    instances.forEach((instance: AppInstanceSummary) => {
      instance.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [instances]);

  // Filter instances based on category and tag filters
  const filteredInstances = useMemo(() => {
    return instances.filter((instance: AppInstanceSummary) => {
      // Category filter
      if (categoryFilter) {
        if (categoryFilter === "__none__") {
          if (instance.category) return false;
        } else if (instance.category !== categoryFilter) {
          return false;
        }
      }

      // Tag filter
      if (tagFilter) {
        if (!instance.tags?.includes(tagFilter)) return false;
      }

      return true;
    });
  }, [instances, categoryFilter, tagFilter]);

  // Get all unique categories from instances (including those not in settings)
  const instanceCategories = useMemo(() => {
    const cats = new Set<string>(categories);
    instances.forEach((instance: AppInstanceSummary) => {
      if (instance.category) cats.add(instance.category);
    });
    return Array.from(cats).sort();
  }, [instances, categories]);

  if (needsSettings) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">App Instances</h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage your configured AppDaemon apps
          </p>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-warning"
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
          </div>
          <h3 className="text-base font-medium mb-2">AppDaemon Path Required</h3>
          <p className="text-sm text-base-content/60 mb-4">
            Configure your AppDaemon apps folder path in settings to view and manage instances.
          </p>
          <Link to="/settings" className="btn btn-warning btn-sm">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">App Instances</h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage your configured AppDaemon apps
          </p>
        </div>
        <Link to="/" className="btn btn-primary btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Instance
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm">
          {error}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm">
          {fetcher.data.error}
        </div>
      )}

      {/* Filter Bar */}
      {instances.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 items-center p-3 rounded-lg border border-base-300 bg-base-100">
          <div className="flex items-center gap-2">
            <label className="text-sm text-base-content/70">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select select-bordered select-sm bg-base-200 border-base-300 min-w-[140px]"
            >
              <option value="">All</option>
              <option value="__none__">Uncategorized</option>
              {instanceCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-base-content/70">Tag:</label>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="select select-bordered select-sm bg-base-200 border-base-300 min-w-[140px]"
            >
              <option value="">All</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {(categoryFilter || tagFilter) && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setTagFilter("");
              }}
              className="btn btn-ghost btn-xs text-base-content/60"
            >
              Clear filters
            </button>
          )}

          <div className="flex-1" />

          <span className="text-xs text-base-content/50">
            {filteredInstances.length} of {instances.length} instances
          </span>
        </div>
      )}

      <InstanceList instances={filteredInstances} onDelete={handleDelete} />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        instanceId={deleteTarget ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={fetcher.state === "submitting"}
      />
    </div>
  );
}
