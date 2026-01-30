import type { BaseInputProps } from "./types";

interface TextInputProps extends BaseInputProps {
  multiline?: boolean;
  type?: "text" | "password" | "email" | "url";
  placeholder?: string;
}

export function TextInput({
  name,
  label,
  description,
  multiline = false,
  type = "text",
  placeholder,
  required,
  register,
  errors,
}: TextInputProps) {
  const error = errors?.[name];

  if (multiline) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className="block text-sm font-medium text-base-content">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        <textarea
          id={name}
          placeholder={placeholder}
          rows={4}
          className={`textarea textarea-bordered textarea-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary resize-y ${error ? "textarea-error" : ""}`}
          {...register(name, { required })}
        />
        {error && (
          <p className="text-xs text-error">{error.message as string || "This field is required"}</p>
        )}
        {description && !error && (
          <p className="text-xs text-base-content/50">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-base-content">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        className={`input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`}
        {...register(name, { required })}
      />
      {error && (
        <p className="text-xs text-error">{error.message as string || "This field is required"}</p>
      )}
      {description && !error && (
        <p className="text-xs text-base-content/50">{description}</p>
      )}
    </div>
  );
}
