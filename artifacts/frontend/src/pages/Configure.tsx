import { Link, useParams, useNavigate } from "react-router-dom";
import { useBlueprint } from "../hooks/useBlueprints";
import { useCreateInstance } from "../hooks/useInstances";
import { useSettings } from "../hooks/useSettings";
import { ConfigureForm } from "../components/ConfigureForm";

export function Configure() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useBlueprint(blueprintId);
  const { data: settingsData } = useSettings();
  const createInstance = useCreateInstance();

  const categories = settingsData?.settings?.categories ?? [];

  const handleSubmit = async (formData: {
    instanceName: string;
    config: Record<string, unknown>;
    category?: string;
    tags?: string[];
  }) => {
    if (!blueprintId) return;

    try {
      await createInstance.mutateAsync({
        blueprintId,
        instanceName: formData.instanceName,
        config: formData.config,
        category: formData.category,
        tags: formData.tags,
      });
      navigate("/");
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

  if (error || !data?.blueprint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-error/30 bg-error/5 p-6 text-center">
          <p className="text-error">
            {error?.message || "Blueprint not found"}
          </p>
          <Link to="/" className="btn btn-ghost btn-sm mt-4">
            Back to Blueprints
          </Link>
        </div>
      </div>
    );
  }

  const { blueprint } = data;

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
        <ConfigureForm
          blueprint={blueprint}
          blueprintId={blueprintId!}
          onSubmit={handleSubmit}
          isSubmitting={createInstance.isPending}
          error={createInstance.error?.message}
          availableCategories={categories}
        />
      </div>
    </div>
  );
}
