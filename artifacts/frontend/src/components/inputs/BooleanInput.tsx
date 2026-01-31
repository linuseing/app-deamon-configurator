import { useController } from "react-hook-form";
import type { ControlledInputProps } from "./types";

interface BooleanInputProps extends ControlledInputProps {
  defaultValue?: boolean;
}

export function BooleanInput({
  name,
  label,
  description,
  control,
  defaultValue = false,
}: BooleanInputProps) {
  const { field } = useController({
    name,
    control,
    defaultValue,
  });

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          id={name}
          checked={field.value ?? false}
          onChange={(e) => field.onChange(e.target.checked)}
          className="checkbox checkbox-sm checkbox-primary"
        />
        <span className="text-sm font-medium text-base-content">{label}</span>
      </label>
      {description && (
        <p className="text-xs text-base-content/50 ml-7">{description}</p>
      )}
    </div>
  );
}
