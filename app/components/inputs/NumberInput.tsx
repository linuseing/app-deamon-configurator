import { useController } from "react-hook-form";
import { useState, useEffect } from "react";
import type { ControlledInputProps } from "./types";

interface NumberInputProps extends ControlledInputProps {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  mode?: "box" | "slider";
  defaultValue?: number;
}

export function NumberInput({
  name,
  label,
  description,
  min,
  max,
  step = 1,
  unit,
  mode = "box",
  required,
  control,
  errors,
  defaultValue,
}: NumberInputProps) {
  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue ?? min ?? 0,
  });

  const [inputValue, setInputValue] = useState<string>(
    field.value?.toString() ?? (min ?? 0).toString()
  );

  // Sync local state with field value when it changes externally
  useEffect(() => {
    if (field.value !== undefined && field.value !== null && Number(inputValue) !== field.value) {
      setInputValue(field.value.toString());
    }
    // We only want to sync when field.value changes, not inputValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  const error = errors?.[name];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setInputValue(newVal.toString());
    field.onChange(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);

    if (newVal === "" || newVal === "-") {
      return;
    }

    const parsed = parseFloat(newVal);
    if (!isNaN(parsed)) {
      field.onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (inputValue === "" || inputValue === "-") {
      const fallback = min ?? 0;
      setInputValue(fallback.toString());
      field.onChange(fallback);
    } else {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        // Clamp value if min/max exists
        let final = parsed;
        if (min !== undefined && final < min) final = min;
        if (max !== undefined && final > max) final = max;

        setInputValue(final.toString());
        field.onChange(final);
      }
    }
    field.onBlur();
  };

  if (mode === "slider") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="block text-sm font-medium text-base-content">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          <span className="text-sm font-mono text-base-content/70">
            {field.value}
            {unit && <span className="text-base-content/50 ml-0.5">{unit}</span>}
          </span>
        </div>
        <input
          type="range"
          id={name}
          min={min}
          max={max}
          step={step}
          value={field.value ?? min ?? 0}
          onChange={handleSliderChange}
          className="range range-sm range-primary"
        />
        {error && (
          <p className="text-xs text-error">{error.message as string}</p>
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
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          id={name}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`input input-bordered input-sm w-32 font-mono bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`}
        />
        {unit && (
          <span className="text-sm text-base-content/50">{unit}</span>
        )}
      </div>
      {error && (
        <p className="text-xs text-error">{error.message as string}</p>
      )}
      {description && !error && (
        <p className="text-xs text-base-content/50">{description}</p>
      )}
    </div>
  );
}
