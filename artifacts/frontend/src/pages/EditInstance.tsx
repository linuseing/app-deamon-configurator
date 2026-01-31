import { Link, useParams, useNavigate } from "react-router-dom";
import { useInstance, useUpdateInstance } from "../hooks/useInstances";
import { useSettings } from "../hooks/useSettings";
import { ConfigureForm } from "../components/ConfigureForm";

export function EditInstance() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useInstance(instanceId);
  const { data: settingsData } = useSettings();
  const updateInstance = useUpdateInstance(instanceId!);

  const categories = settingsData?.settings?.categories ?? [];

  const handleSubmit = async (formData: {
    instanceName: string;
    config: Record<string, unknown>;
    category?: string;
    tags?: string[];
  }) => {
    try {
      await updateInstance.mutateAsync({
        config: formData.config,
        newInstanceId: formData.instanceName !== instanceId ? formData.instanceName : undefined,
        category: formData.category,
        tags: formData.tags,
      });
      navigate("/instances");
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (error || !data?.instance) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-error/30 bg-error/5 p-6 text-center">
          <p className="text-error">
            {error?.message || "Instance not found"}
          </p>
          <Link to="/instances" className="btn btn-ghost btn-sm mt-4">
            Back to Instances
          </Link>
        </div>
      </div>
    );
  }

  const { instance, blueprint } = data;

  // If no blueprint, show a message that editing requires a blueprint
  if (!blueprint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
            <Link to="/instances" className="hover:text-base-content">
              Instances
            </Link>
            <span>/</span>
            <span className="text-base-content font-mono">{instance.id}</span>
          </div>
          <h1 className="text-xl font-semibold">Edit Instance</h1>
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
          <h3 className="text-base font-medium mb-2">No Blueprint Found</h3>
          <p className="text-sm text-base-content/60 mb-4">
            This instance was not created with a blueprint (no <code className="text-xs bg-base-200 px-1 py-0.5 rounded">_blueprint</code> field).
            Edit the <code className="text-xs bg-base-200 px-1 py-0.5 rounded">apps.yaml</code> file directly to modify this instance.
          </p>
          <Link to="/instances" className="btn btn-ghost btn-sm">
            Back to Instances
          </Link>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-base-300 bg-base-100">
          <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
          <pre className="text-xs font-mono bg-base-200 p-3 rounded overflow-x-auto">
            {JSON.stringify(instance.config, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
          <Link to="/instances" className="hover:text-base-content">
            Instances
          </Link>
          <span>/</span>
          <span className="text-base-content font-mono">{instance.id}</span>
        </div>
        <h1 className="text-xl font-semibold">Edit {instance.id}</h1>
        <p className="text-sm text-base-content/50 mt-1">
          {blueprint.blueprint.description}
        </p>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <ConfigureForm
          blueprint={blueprint}
          blueprintId={instance._blueprint!}
          onSubmit={handleSubmit}
          isSubmitting={updateInstance.isPending}
          error={updateInstance.error?.message}
          defaultInstanceName={instance.id}
          existingValues={instance.config}
          availableCategories={categories}
          currentCategory={instance._category}
          currentTags={instance._tags}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
