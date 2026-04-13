import { useFieldArray, useWatch } from "react-hook-form";
import type { UseFormRegister, FieldErrors, Control, UseFormSetValue } from "react-hook-form";
import type { BlueprintInput } from "../../types";
import {
  isEntitySelector,
  isNumberSelector,
  isTextSelector,
  isBooleanSelector,
  isSelectSelector,
  isNotificationSelector,
  getSelectorType,
} from "../../types";
import { TextInput } from "./TextInput";
import { NumberInput } from "./NumberInput";
import { BooleanInput } from "./BooleanInput";
import { SelectInput } from "./SelectInput";
import { EntityInput } from "./EntityInput";
import { NotificationInput } from "./NotificationInput";

interface ObjectListInputProps {
  name: string;
  label: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: Record<string, BlueprintInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
}

function buildDefaultItem(fields: Record<string, BlueprintInput>): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(fields)) {
    if (field.default !== undefined) {
      item[key] = field.default;
    } else if (field.selector) {
      if ("boolean" in field.selector) {
        item[key] = false;
      } else if ("number" in field.selector) {
        item[key] = field.selector.number?.min ?? 0;
      } else {
        item[key] = "";
      }
    } else {
      item[key] = "";
    }
  }
  return item;
}

function buildSubFieldErrors(
  errors: FieldErrors<Record<string, unknown>> | undefined,
  baseName: string,
  index: number,
  fieldKeys: string[]
): FieldErrors<Record<string, unknown>> {
  const result: FieldErrors<Record<string, unknown>> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrayErrors = (errors as any)?.[baseName];
  if (!arrayErrors || !Array.isArray(arrayErrors)) return result;
  const itemErrors = arrayErrors[index];
  if (!itemErrors) return result;

  for (const key of fieldKeys) {
    if (itemErrors[key]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[`${baseName}.${index}.${key}`] = itemErrors[key];
    }
  }
  return result;
}

function ItemTitle({ control, name, fields }: { control: Control<any>; name: string; fields: Record<string, BlueprintInput> }) {
  const firstTextKey = Object.entries(fields).find(
    ([, f]) => !f.selector || (f.selector && "text" in f.selector)
  )?.[0];

  const value = useWatch({ control, name: firstTextKey ? `${name}.${firstTextKey}` : name });

  if (firstTextKey && value && typeof value === "string" && value.trim()) {
    return <span className="text-sm font-medium text-base-content">{value}</span>;
  }
  return null;
}

export function ObjectListInput({
  name,
  label,
  description,
  fields: fieldDefs,
  control,
  register,
  errors,
  setValue,
}: ObjectListInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const fieldKeys = Object.keys(fieldDefs);

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-base-content">{label}</label>
        {description && (
          <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
        )}
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-base-content/40 py-4 text-center border border-dashed border-base-300 rounded-lg">
          No items added yet
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const subErrors = buildSubFieldErrors(errors, name, index, fieldKeys);

          return (
            <details
              key={field.id}
              className="group collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg overflow-visible open:z-20 relative"
              open
            >
              <summary className="collapse-title text-base font-medium py-2 min-h-0">
                <div className="flex items-center justify-between pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-base-content/40 font-mono">#{index + 1}</span>
                    <ItemTitle control={control} name={`${name}.${index}`} fields={fieldDefs} />
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(index);
                    }}
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
              </summary>
              <div className="collapse-content overflow-visible">
                <div className="space-y-4 pt-2">
                  {Object.entries(fieldDefs).map(([fieldKey, fieldInput]) => {
                    const fullName = `${name}.${index}.${fieldKey}`;
                    return (
                      <div key={fieldKey}>
                        <SubField
                          name={fullName}
                          input={fieldInput}
                          register={register}
                          control={control}
                          errors={subErrors}
                          setValue={setValue}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline btn-primary w-full"
        onClick={() => append(buildDefaultItem(fieldDefs))}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add {label.replace(/s$/, "")}
      </button>
    </div>
  );
}

interface SubFieldProps {
  name: string;
  input: BlueprintInput;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
}

function SubField({ name, input, register, control, errors, setValue }: SubFieldProps) {
  const selector = input.selector;

  if (!selector) {
    return (
      <TextInput
        name={name}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
      />
    );
  }

  if (isEntitySelector(selector)) {
    return (
      <EntityInput
        name={name}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        domain={selector.entity?.domain}
        deviceClass={selector.entity?.device_class}
        multiple={selector.entity?.multiple}
        setValue={setValue}
      />
    );
  }

  if (isNumberSelector(selector)) {
    return (
      <NumberInput
        name={name}
        label={input.name}
        description={input.description}
        control={control}
        errors={errors}
        min={selector.number?.min}
        max={selector.number?.max}
        step={selector.number?.step}
        unit={selector.number?.unit_of_measurement}
        mode={selector.number?.mode}
        defaultValue={input.default as number | undefined}
      />
    );
  }

  if (isTextSelector(selector)) {
    return (
      <TextInput
        name={name}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        multiline={selector.text?.multiline}
        type={selector.text?.type}
      />
    );
  }

  if (isBooleanSelector(selector)) {
    return (
      <BooleanInput
        name={name}
        label={input.name}
        description={input.description}
        control={control}
        defaultValue={input.default as boolean | undefined}
      />
    );
  }

  if (isSelectSelector(selector)) {
    return (
      <SelectInput
        name={name}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        options={selector.select?.options || []}
        multiple={selector.select?.multiple}
      />
    );
  }

  if (isNotificationSelector(selector)) {
    return (
      <NotificationInput
        name={name}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
      />
    );
  }

  // Fallback for unsupported selectors (including nested object_list)
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-base-content">
        {input.name}
        <span className="text-xs text-warning ml-2">
          (unsupported: {getSelectorType(selector)})
        </span>
      </label>
      <input
        type="text"
        className="input input-bordered input-sm w-full bg-base-200 border-base-300"
        {...register(name)}
      />
      {input.description && (
        <p className="text-xs text-base-content/50">{input.description}</p>
      )}
    </div>
  );
}
