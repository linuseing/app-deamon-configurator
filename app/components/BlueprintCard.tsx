import { Link } from "react-router";
import type { BlueprintSummary } from "~/lib/types";

interface BlueprintCardProps {
  blueprint: BlueprintSummary;
}

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  return (
    <Link
      to={`/configure/${blueprint.id}`}
      className="flex flex-col h-full p-4 rounded-lg border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200/30 transition-all group"
    >
      <div className="flex-1">
        <h3 className="font-medium text-base-content group-hover:text-primary transition-colors line-clamp-1">
          {blueprint.name}
        </h3>
        <p className="text-sm text-base-content/50 mt-1 line-clamp-2">
          {blueprint.description}
        </p>
      </div>
      <div className="flex items-center flex-wrap gap-2 mt-3 text-xs text-base-content/40">
        <span className="px-1.5 py-0.5 rounded bg-base-200 text-base-content/60">
          {blueprint.domain}
        </span>
        <span>{blueprint.inputCount} inputs</span>
        {blueprint.author && (
          <>
            <span>•</span>
            <span className="truncate max-w-[100px]">{blueprint.author}</span>
          </>
        )}
      </div>
    </Link>
  );
}
