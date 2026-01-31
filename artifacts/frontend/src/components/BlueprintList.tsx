import type { BlueprintSummary } from "../types";
import { BlueprintCard } from "./BlueprintCard";

interface BlueprintListProps {
  blueprints: BlueprintSummary[];
}

export function BlueprintList({ blueprints }: BlueprintListProps) {
  if (blueprints.length === 0) {
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium mb-1">No blueprints found</h3>
        <p className="text-sm text-base-content/50 max-w-sm mx-auto">
          Add blueprint folders to <code className="text-xs bg-base-200 px-1 py-0.5 rounded">blueprints/</code> directory.
          Each folder should contain a <code className="text-xs bg-base-200 px-1 py-0.5 rounded">blueprint.yaml</code> file.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {blueprints.map((blueprint) => (
        <BlueprintCard key={blueprint.id} blueprint={blueprint} />
      ))}
    </div>
  );
}
