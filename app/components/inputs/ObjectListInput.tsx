import { useState, useCallback } from "react";
import type { BlueprintInput } from "~/lib/types";

interface ObjectListInputProps {
  name: string;
  label: string;
  description?: string;
  fields: Record<string, BlueprintInput>;
  defaultValue?: Record<string, unknown>[];
}

export function ObjectListInput({
  name,
  label,
  description,
  fields,
  defaultValue,
}: ObjectListInputProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>(
    defaultValue ?? []
  );

  const addItem = useCallback(() => {
    const newItem: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(fields)) {
      if (field.default !== undefined) {
        newItem[key] = field.default;
      } else if (field.selector && "boolean" in field.selector) {
        newItem[key] = false;
      } else if (field.selector && "number" in field.selector) {
        newItem[key] = field.selector.number.min ?? 0;
      } else if (field.selector && "select" in field.selector && field.selector.select.multiple) {
        newItem[key] = [];
      } else {
        newItem[key] = "";
      }
    }
    setItems((prev) => [...prev, newItem]);
  }, [fields]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback(
    (index: number, fieldKey: string, value: unknown) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [fieldKey]: value };
        return next;
      });
    },
    []
  );

  // Find the first text-like field key to use as item title
  const titleFieldKey = Object.entries(fields).find(
    ([, f]) => !f.selector || "text" in f.selector
  )?.[0];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-base-content">
          {label}
        </label>
        {description && (
          <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
        )}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 && (
        <div className="text-sm text-base-content/40 py-4 text-center border border-dashed border-base-300 rounded-lg">
          No items added yet
        </div>
      )}

      {items.map((item, index) => {
        const itemTitle =
          titleFieldKey && item[titleFieldKey]
            ? String(item[titleFieldKey])
            : `Item ${index + 1}`;

        return (
          <details
            key={index}
            className="group collapse collapse-arrow border border-base-300 rounded-lg bg-base-100"
            open
          >
            <summary className="collapse-title text-sm font-medium py-2 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-base-content">
                  <span className="text-base-content/40 mr-1.5">
                    {index + 1}.
                  </span>
                  {itemTitle}
                </span>
              </div>
            </summary>
            <div className="collapse-content">
              <div className="space-y-3 pt-1">
                {Object.entries(fields).map(([fieldKey, fieldDef]) => (
                  <ObjectFieldInput
                    key={fieldKey}
                    fieldKey={fieldKey}
                    fieldDef={fieldDef}
                    value={item[fieldKey]}
                    onChange={(value) => updateItem(index, fieldKey, value)}
                  />
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-base-300">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
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
                  Remove
                </button>
              </div>
            </div>
          </details>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="btn btn-ghost btn-sm border border-dashed border-base-300 w-full"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add {label ? label.replace(/s$/, "") : "Item"}
      </button>
    </div>
  );
}

// Controlled field input renderer for sub-fields within each list item
interface ObjectFieldInputProps {
  fieldKey: string;
  fieldDef: BlueprintInput;
  value: unknown;
  onChange: (value: unknown) => void;
}

function ObjectFieldInput({
  fieldKey,
  fieldDef,
  value,
  onChange,
}: ObjectFieldInputProps) {
  const selector = fieldDef.selector;

  // Boolean selector
  if (selector && "boolean" in selector) {
    return (
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`obj-${fieldKey}`}
          checked={value === true || value === "true"}
          onChange={(e) => onChange(e.target.checked)}
          className="checkbox checkbox-primary checkbox-sm"
        />
        <div>
          <label
            htmlFor={`obj-${fieldKey}`}
            className="text-sm font-medium text-base-content cursor-pointer"
          >
            {fieldDef.name}
          </label>
          {fieldDef.description && (
            <p className="text-xs text-base-content/50">
              {fieldDef.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Number selector
  if (selector && "number" in selector) {
    const { min, max, step, unit_of_measurement, mode } = selector.number;
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={`obj-${fieldKey}`}
          className="block text-sm font-medium text-base-content"
        >
          {fieldDef.name}
        </label>
        <div className="flex items-center gap-2">
          <input
            type={mode === "slider" ? "range" : "number"}
            id={`obj-${fieldKey}`}
            value={value !== undefined && value !== null ? Number(value) : ""}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className={
              mode === "slider"
                ? "range range-primary range-sm flex-1"
                : "input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary"
            }
          />
          {mode === "slider" && (
            <span className="text-sm font-mono text-base-content/70 min-w-[3ch] text-right">
              {value !== undefined ? String(value) : "0"}
            </span>
          )}
          {unit_of_measurement && (
            <span className="text-sm text-base-content/50">
              {unit_of_measurement}
            </span>
          )}
        </div>
        {fieldDef.description && (
          <p className="text-xs text-base-content/50">
            {fieldDef.description}
          </p>
        )}
      </div>
    );
  }

  // Select selector
  if (selector && "select" in selector) {
    const { options, multiple } = selector.select;

    if (multiple) {
      // Multiple select rendered as checkbox list
      const selected = Array.isArray(value)
        ? (value as string[])
        : [];

      return (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-base-content">
            {fieldDef.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const optValue =
                typeof option === "string" ? option : option.value;
              const optLabel =
                typeof option === "string" ? option : option.label;
              const isChecked = selected.includes(optValue);

              return (
                <label
                  key={optValue}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-xs transition-colors ${
                    isChecked
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-base-300 bg-base-200 text-base-content/70 hover:border-base-content/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selected, optValue]);
                      } else {
                        onChange(selected.filter((v) => v !== optValue));
                      }
                    }}
                    className="hidden"
                  />
                  {optLabel}
                </label>
              );
            })}
          </div>
          {fieldDef.description && (
            <p className="text-xs text-base-content/50">
              {fieldDef.description}
            </p>
          )}
        </div>
      );
    }

    // Single select
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={`obj-${fieldKey}`}
          className="block text-sm font-medium text-base-content"
        >
          {fieldDef.name}
        </label>
        <select
          id={`obj-${fieldKey}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary"
        >
          <option value="">Select...</option>
          {options.map((option) => {
            const optValue =
              typeof option === "string" ? option : option.value;
            const optLabel =
              typeof option === "string" ? option : option.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {fieldDef.description && (
          <p className="text-xs text-base-content/50">
            {fieldDef.description}
          </p>
        )}
      </div>
    );
  }

  // Text selector (default) — also handles text with multiline and entity/notification fallback
  const isMultiline = selector && "text" in selector && selector.text.multiline;
  const inputType =
    selector && "text" in selector && selector.text.type
      ? selector.text.type
      : "text";

  if (isMultiline) {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={`obj-${fieldKey}`}
          className="block text-sm font-medium text-base-content"
        >
          {fieldDef.name}
        </label>
        <textarea
          id={`obj-${fieldKey}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="textarea textarea-bordered textarea-sm w-full bg-base-200 border-base-300 focus:border-primary"
        />
        {fieldDef.description && (
          <p className="text-xs text-base-content/50">
            {fieldDef.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`obj-${fieldKey}`}
        className="block text-sm font-medium text-base-content"
      >
        {fieldDef.name}
      </label>
      <input
        type={inputType}
        id={`obj-${fieldKey}`}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary"
      />
      {fieldDef.description && (
        <p className="text-xs text-base-content/50">
          {fieldDef.description}
        </p>
      )}
    </div>
  );
}
