import { Link } from "react-router-dom";
import type { AppInstanceSummary } from "../types";

interface InstanceCardProps {
  instance: AppInstanceSummary;
  onDelete?: (id: string) => void;
}

export function InstanceCard({ instance, onDelete }: InstanceCardProps) {
  return (
    <div className="flex flex-col h-full p-4 rounded-lg border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200/30 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base-content truncate font-mono text-sm">
            {instance.id}
          </h3>
          <p className="text-sm text-base-content/50 mt-1 truncate">
            {instance.blueprintName ? (
              <>
                <span className="text-primary/70">{instance.blueprintName}</span>
                <span className="text-base-content/30 mx-1">•</span>
              </>
            ) : null}
            <span className="font-mono text-xs">{instance.module}.{instance.class}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {instance.blueprintId ? (
            <Link
              to={`/instances/${instance.id}/edit`}
              className="btn btn-ghost btn-xs"
              title="Edit instance"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          ) : null}
          {onDelete && (
            <button
              onClick={() => onDelete(instance.id)}
              className="btn btn-ghost btn-xs text-error hover:bg-error/10"
              title="Delete instance"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Tags */}
      {instance.tags && instance.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {instance.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-base-200 text-base-content/60 text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex-1" />
      <div className="flex items-center flex-wrap gap-2 mt-3 text-xs text-base-content/40">
        {instance.category && (
          <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-medium">
            {instance.category}
          </span>
        )}
        {instance.blueprintId ? (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 truncate max-w-full">
            {instance.blueprintId}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-base-200 text-base-content/60">
            manual
          </span>
        )}
        <span>{instance.configCount} settings</span>
      </div>
    </div>
  );
}
