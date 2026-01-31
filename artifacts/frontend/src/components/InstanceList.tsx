import { Link } from "react-router-dom";
import type { AppInstanceSummary } from "../types";
import { InstanceCard } from "./InstanceCard";

interface InstanceListProps {
  instances: AppInstanceSummary[];
  onDelete?: (id: string) => void;
}

export function InstanceList({ instances, onDelete }: InstanceListProps) {
  if (instances.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-base-content/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium mb-1">No app instances found</h3>
        <p className="text-sm text-base-content/50 max-w-sm mx-auto mb-4">
          Create your first app instance from a blueprint, or add apps directly to your{" "}
          <code className="text-xs bg-base-200 px-1 py-0.5 rounded">apps.yaml</code> file.
        </p>
        <Link to="/" className="btn btn-primary btn-sm">
          Browse Blueprints
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {instances.map((instance) => (
        <InstanceCard key={instance.id} instance={instance} onDelete={onDelete} />
      ))}
    </div>
  );
}
