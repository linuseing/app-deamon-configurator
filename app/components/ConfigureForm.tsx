import { useRemixForm } from "remix-hook-form";
import { Form } from "react-router";
import { useEffect, useState } from "react";
import type { Blueprint, BlueprintInput, Selector } from "~/lib/types";
import {
  isEntitySelector,
  isNumberSelector,
  isTextSelector,
  isBooleanSelector,
  isSelectSelector,
  isNotificationSelector,
  getSelectorType,
  flattenInputs,
  isSection,
  type BlueprintSection,
} from "~/lib/types";
import {
  EntityInput,
  NumberInput,
  TextInput,
  BooleanInput,
  SelectInput,
  NotificationInput,
} from "./inputs";

interface ConfigureFormProps {
  blueprint: Blueprint;
  blueprintId: string;
  /** Default instance name (for editing existing instances) */
  defaultInstanceName?: string;
  /** Whether this is editing an existing instance */
  isEditing?: boolean;
  /** Available categories from settings */
  availableCategories?: string[];
}

export function ConfigureForm({
  blueprint,
  blueprintId,
  defaultInstanceName,
  isEditing = false,
  availableCategories = [],
}: ConfigureFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  // Build default values from blueprint inputs
  const defaultValues: Record<string, unknown> = {
    _instanceName: defaultInstanceName || blueprintId.replace(/-/g, "_"),
  };
  const flatInputs = flattenInputs(blueprint.input);

  for (const [key, input] of Object.entries(flatInputs)) {
    if (input.default !== undefined) {
      defaultValues[key] = input.default;
    }
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useRemixForm({
    defaultValues,
    submitConfig: {
      method: "POST",
    },
  });

  // Reset form when blueprint changes or default values update
  useEffect(() => {
    reset(defaultValues);
  }, [blueprintId, reset]);

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <input type="hidden" name="blueprintId" value={blueprintId} />

      {/* Instance Name Field */}
      <div className="pb-4 mb-4 border-b border-base-300">
        <div className="space-y-1.5">
          <label htmlFor="_instanceName" className="block text-sm font-medium text-base-content">
            Instance Name
            <span className="text-error ml-1">*</span>
          </label>
          <input
            type="text"
            id="_instanceName"
            placeholder={blueprintId.replace(/-/g, "_")}
            className={`input input-bordered input-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${errors._instanceName ? "input-error" : ""}`}
            {...register("_instanceName", {
              required: "Instance name is required",
              pattern: {
                value: /^[a-z][a-z0-9_]*$/,
                message: "Must start with letter, use only lowercase letters, numbers, and underscores"
              }
            })}
          />
          {errors._instanceName ? (
            <p className="text-xs text-error">{errors._instanceName.message as string}</p>
          ) : (
            <p className="text-xs text-base-content/50">
              Unique identifier for this app instance in apps.yaml
            </p>
          )}
        </div>
      </div>

      {/* Category & Tags */}
      <div className="pb-4 mb-4 border-b border-base-300 space-y-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="_category" className="block text-sm font-medium text-base-content">
            Category
          </label>
          <select
            id="_category"
            className="select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary"
            {...register("_category")}
          >
            <option value="">No category</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="text-xs text-base-content/50">
            Organize instances by category (configure in Settings)
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-base-content">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newTag.trim() && !tags.includes(newTag.trim())) {
                    setTags([...tags, newTag.trim()]);
                    setNewTag("");
                  }
                }
              }}
              placeholder="Add tag..."
              className="input input-bordered input-sm flex-1 bg-base-200 border-base-300 focus:border-primary"
            />
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                if (newTag.trim() && !tags.includes(newTag.trim())) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-base-200 text-base-content/70 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:bg-base-300 rounded-full p-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          <input type="hidden" name="_tags" value={JSON.stringify(tags)} />
          <p className="text-xs text-base-content/50">
            Free-form tags for filtering and organization
          </p>
        </div>
      </div>

      <div className="divide-y divide-base-300">
        {blueprint.input && Object.entries(blueprint.input).map(([key, input]) => (
          <ConfigItem
            key={key}
            itemKey={key}
            item={input}
            register={register}
            control={control}
            errors={errors}
          />
        ))}
      </div>

      {!blueprint.input && (
        <div className="py-8 text-center text-base-content/50">
          No configuration options available for this blueprint.
        </div>
      )}

      <div className="pt-4 border-t border-base-300">
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Generating...
            </>
          ) : (
            <>
              Generate Configuration
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </Form>
  );
}

interface ConfigItemProps {
  itemKey: string;
  item: BlueprintInput | BlueprintSection;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

function ConfigItem({ itemKey, item, register, control, errors }: ConfigItemProps) {
  if (isSection(item)) {
    return (
      <div className="py-4 first:pt-0 last:pb-0">
        <details className="group collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg">
          <summary className="collapse-title text-base font-medium">
            <div className="flex items-center gap-2">
              {item.icon && <span className={`mdi ${item.icon}`} />}
              {item.name}
            </div>
            {item.description && (
              <div className="text-xs font-normal text-base-content/60 mt-0.5">
                {item.description}
              </div>
            )}
          </summary>
          <div className="collapse-content">
            <div className="divide-y divide-base-300">
              {Object.entries(item.input).map(([key, input]) => (
                <ConfigItem
                  key={key}
                  itemKey={key}
                  item={input}
                  register={register}
                  control={control}
                  errors={errors}
                />
              ))}
            </div>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <InputField
        inputKey={itemKey}
        input={item}
        register={register}
        control={control}
        errors={errors}
      />
    </div>
  );
}

interface InputFieldProps {
  inputKey: string;
  input: BlueprintInput;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

function InputField({ inputKey, input, register, control, errors }: InputFieldProps) {
  const selector = input.selector;

  if (!selector) {
    return (
      <TextInput
        name={inputKey}
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
        name={inputKey}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        domain={selector.entity.domain}
        deviceClass={selector.entity.device_class}
        multiple={selector.entity.multiple}
      />
    );
  }

  if (isNumberSelector(selector)) {
    return (
      <NumberInput
        name={inputKey}
        label={input.name}
        description={input.description}
        control={control}
        errors={errors}
        min={selector.number.min}
        max={selector.number.max}
        step={selector.number.step}
        unit={selector.number.unit_of_measurement}
        mode={selector.number.mode}
        defaultValue={input.default as number | undefined}
      />
    );
  }

  if (isTextSelector(selector)) {
    return (
      <TextInput
        name={inputKey}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        multiline={selector.text.multiline}
        type={selector.text.type}
      />
    );
  }

  if (isBooleanSelector(selector)) {
    return (
      <BooleanInput
        name={inputKey}
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
        name={inputKey}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
        options={selector.select.options}
        multiple={selector.select.multiple}
      />
    );
  }

  if (isNotificationSelector(selector)) {
    return (
      <NotificationInput
        name={inputKey}
        label={input.name}
        description={input.description}
        register={register}
        errors={errors}
      />
    );
  }

  // Fallback for unsupported selectors
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
        {...register(inputKey)}
      />
      {input.description && (
        <p className="text-xs text-base-content/50">{input.description}</p>
      )}
    </div>
  );
}

// Helper for route action to parse form data
export async function parseConfigureFormData(request: Request) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Extract blueprintId and parse the rest as config values
  const { blueprintId, ...values } = data;

  return {
    blueprintId: blueprintId as string,
    values: values as Record<string, unknown>,
  };
}
