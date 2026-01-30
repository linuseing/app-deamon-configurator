import type { BaseInputProps } from "./types";

interface SelectInputProps extends BaseInputProps {
  options: (string | { label: string; value: string })[];
  multiple?: boolean;
}

export function SelectInput({
  name,
  label,
  description,
  options,
  required,
  register,
  errors,
}: SelectInputProps) {
  const error = errors?.[name];

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-base-content">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <select
        id={name}
        className={`select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary ${error ? "select-error" : ""}`}
        {...register(name, { required })}
      >
        <option value="">Select...</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="text-xs text-error">{error.message as string || "This field is required"}</p>
      )}
      {description && !error && (
        <p className="text-xs text-base-content/50">{description}</p>
      )}
    </div>
  );
}
