import type { Route } from "./+types/instances.$instanceId.edit";
import { redirect, Link } from "react-router";
import { getAppInstance, updateAppInstance } from "~/lib/apps.server";
import { getBlueprint } from "~/lib/blueprint.server";
import { getAppSettings, stripQuotes, isAddonMode } from "~/lib/settings.server";
import { flattenInputs } from "~/lib/types";
import { ConfigureForm } from "~/components/ConfigureForm";

export function meta({ data }: Route.MetaArgs) {
  const instanceId = data?.instance?.id ?? "Edit Instance";
  return [
    { title: `Edit ${instanceId} | AppDaemon Configurator` },
    { name: "description", content: `Edit app instance ${instanceId}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { instanceId } = params;

  if (!instanceId) {
    throw new Response("Instance ID is required", { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  const appdaemonPath = settings?.appdaemonPath || (isAddonMode() ? "/share/appdaemon/apps" : null);

  if (!appdaemonPath) {
    throw new Response("AppDaemon path not configured", { status: 400 });
  }

  const instance = await getAppInstance(appdaemonPath, instanceId);

  if (!instance) {
    throw new Response("Instance not found", { status: 404 });
  }

  // If the instance has a blueprint, load it
  let blueprint = null;
  if (instance._blueprint) {
    blueprint = await getBlueprint(instance._blueprint, appdaemonPath);
  }

  // Get available categories from settings
  const categories = settings?.categories ?? [];

  return { instance, blueprint, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { instanceId } = params;

  if (!instanceId) {
    throw new Response("Instance ID is required", { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings = await getAppSettings(cookieHeader);

  const appdaemonPath = settings?.appdaemonPath || (isAddonMode() ? "/share/appdaemon/apps" : null);
  if (!appdaemonPath) {
    throw new Response("AppDaemon path not configured", { status: 400 });
  }

  const instance = await getAppInstance(appdaemonPath, instanceId);
  if (!instance) {
    throw new Response("Instance not found", { status: 404 });
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Parse config values (remove metadata fields from form data)
  const { blueprintId: _, _instanceName, _category, _tags, ...values } = data;

  // Get the new instance name (for renaming)
  const newInstanceName = stripQuotes(_instanceName as string) || instanceId;

  // Get category and tags
  const category = stripQuotes(_category as string) || undefined;
  let tags: string[] = [];
  try {
    const tagsRaw = _tags as string;
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    tags = [];
  }

  // Get blueprint for type conversion
  let blueprint = null;
  if (instance._blueprint) {
    blueprint = await getBlueprint(instance._blueprint, appdaemonPath);
  }

  // Convert string values to appropriate types based on blueprint input definitions
  const typedValues: Record<string, unknown> = {};

  if (blueprint) {
    const flatInputs = flattenInputs(blueprint.input);

    for (const [key, value] of Object.entries(values)) {
      const inputDef = flatInputs[key];
      const strValue = stripQuotes(value as string);

      if (!inputDef?.selector) {
        typedValues[key] = strValue;
        continue;
      }

      const selector = inputDef.selector;

      // Handle type conversions
      if ("number" in selector) {
        typedValues[key] = Number(strValue);
      } else if ("boolean" in selector) {
        typedValues[key] = strValue === "true" || strValue === "on";
      } else {
        typedValues[key] = strValue;
      }
    }
  } else {
    // No blueprint, just strip quotes from raw values
    for (const [key, value] of Object.entries(values)) {
      typedValues[key] = stripQuotes(value as string);
    }
  }

  try {
    await updateAppInstance(appdaemonPath, instanceId, typedValues, newInstanceName, category, tags);
    return redirect("/instances");
  } catch (error) {
    throw new Response(`Failed to update instance: ${(error as Error).message}`, {
      status: 500,
    });
  }
}

export default function EditInstance({ loaderData }: Route.ComponentProps) {
  const { instance, blueprint, categories } = loaderData;

  // If no blueprint, show a message that editing requires a blueprint
  if (!blueprint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
            <Link to="/instances" className="hover:text-base-content">
              Instances
            </Link>
            <span>/</span>
            <span className="text-base-content font-mono">{instance.id}</span>
          </div>
          <h1 className="text-xl font-semibold">Edit Instance</h1>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium mb-2">No Blueprint Found</h3>
          <p className="text-sm text-base-content/60 mb-4">
            This instance was not created with a blueprint (no <code className="text-xs bg-base-200 px-1 py-0.5 rounded">_blueprint</code> field).
            Edit the <code className="text-xs bg-base-200 px-1 py-0.5 rounded">apps.yaml</code> file directly to modify this instance.
          </p>
          <Link to="/instances" className="btn btn-ghost btn-sm">
            Back to Instances
          </Link>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-base-300 bg-base-100">
          <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
          <pre className="text-xs font-mono bg-base-200 p-3 rounded overflow-x-auto">
            {JSON.stringify(instance.config, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
          <Link to="/instances" className="hover:text-base-content">
            Instances
          </Link>
          <span>/</span>
          <span className="text-base-content font-mono">{instance.id}</span>
        </div>
        <h1 className="text-xl font-semibold">Edit {instance.id}</h1>
        <p className="text-sm text-base-content/50 mt-1">
          {blueprint.blueprint.description}
        </p>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <ConfigureFormWithValues
          blueprint={blueprint}
          blueprintId={instance._blueprint!}
          instanceId={instance.id}
          existingValues={instance.config}
          availableCategories={categories}
          currentCategory={instance._category}
          currentTags={instance._tags}
        />
      </div>
    </div>
  );
}

// Extended ConfigureForm that accepts existing values
import { useRemixForm } from "remix-hook-form";
import { Form } from "react-router";
import { useEffect, useState } from "react";
import type { Blueprint, BlueprintInput, BlueprintSection } from "~/lib/types";
import {
  isEntitySelector,
  isNumberSelector,
  isTextSelector,
  isBooleanSelector,
  isSelectSelector,
  isNotificationSelector,
  getSelectorType,
  isSection,
} from "~/lib/types";
import {
  EntityInput,
  NumberInput,
  TextInput,
  BooleanInput,
  SelectInput,
  NotificationInput,
} from "~/components/inputs";

interface ConfigureFormWithValuesProps {
  blueprint: Blueprint;
  blueprintId: string;
  instanceId: string;
  existingValues: Record<string, unknown>;
  availableCategories: string[];
  currentCategory?: string;
  currentTags?: string[];
}

function ConfigureFormWithValues({
  blueprint,
  blueprintId,
  instanceId,
  existingValues,
  availableCategories,
  currentCategory,
  currentTags,
}: ConfigureFormWithValuesProps) {
  const [tags, setTags] = useState<string[]>(currentTags ?? []);
  const [newTag, setNewTag] = useState("");
  // Build default values from blueprint inputs, then override with existing values
  const defaultValues: Record<string, unknown> = {
    _instanceName: instanceId,
  };
  const flatInputs = flattenInputs(blueprint.input);

  for (const [key, input] of Object.entries(flatInputs)) {
    if (existingValues[key] !== undefined) {
      defaultValues[key] = existingValues[key];
    } else if (input.default !== undefined) {
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
            defaultValue={currentCategory ?? ""}
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
        {blueprint.input &&
          Object.entries(blueprint.input).map(([key, input]) => (
            <ConfigItemEdit
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

      <div className="pt-4 border-t border-base-300 flex gap-2">
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Saving...
            </>
          ) : (
            <>
              Save Changes
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
        <Link to="/instances" className="btn btn-ghost btn-sm">
          Cancel
        </Link>
      </div>
    </Form>
  );
}

interface ConfigItemEditProps {
  itemKey: string;
  item: BlueprintInput | BlueprintSection;
  register: ReturnType<typeof useRemixForm>["register"];
  control: ReturnType<typeof useRemixForm>["control"];
  errors: ReturnType<typeof useRemixForm>["formState"]["errors"];
}

function ConfigItemEdit({
  itemKey,
  item,
  register,
  control,
  errors,
}: ConfigItemEditProps) {
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
                <ConfigItemEdit
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
      <InputFieldEdit
        inputKey={itemKey}
        input={item}
        register={register}
        control={control}
        errors={errors}
      />
    </div>
  );
}

interface InputFieldEditProps {
  inputKey: string;
  input: BlueprintInput;
  register: ReturnType<typeof useRemixForm>["register"];
  control: ReturnType<typeof useRemixForm>["control"];
  errors: ReturnType<typeof useRemixForm>["formState"]["errors"];
}

function InputFieldEdit({
  inputKey,
  input,
  register,
  control,
  errors,
}: InputFieldEditProps) {
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
