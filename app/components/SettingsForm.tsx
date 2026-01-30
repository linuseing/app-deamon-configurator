import { useRemixForm } from "remix-hook-form";
import { Form } from "react-router";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AppSettings } from "~/lib/types";

// Schema changes based on add-on mode
const createSettingsSchema = (addonMode: boolean) =>
  z.object({
    haUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
    haToken: z.string(),
    // AppDaemon path is optional in add-on mode (auto-configured)
    appdaemonPath: addonMode
      ? z.string().optional()
      : z.string().min(1, "AppDaemon apps folder path is required"),
    categories: z.string().optional(),
  });

type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;

interface SettingsFormProps {
  defaultValues?: AppSettings;
  addonMode?: boolean;
}

export function SettingsForm({ defaultValues, addonMode = false }: SettingsFormProps) {
  const [showToken, setShowToken] = useState(false);
  const [categories, setCategories] = useState<string[]>(defaultValues?.categories ?? []);
  const [newCategory, setNewCategory] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useRemixForm<SettingsFormData>({
    resolver: zodResolver(createSettingsSchema(addonMode)),
    defaultValues: {
      haUrl: defaultValues?.haUrl ?? "",
      haToken: defaultValues?.haToken ?? "",
      appdaemonPath: defaultValues?.appdaemonPath ?? "",
    },
    submitConfig: {
      method: "POST",
    },
  });

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* AppDaemon Section - Hidden in add-on mode */}
        {!addonMode && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-base-content border-b border-base-300 pb-2">
              AppDaemon Configuration
            </h3>
            
            <div className="space-y-1.5">
              <label htmlFor="appdaemonPath" className="block text-sm font-medium text-base-content">
                Apps Folder Path
              </label>
              <input
                type="text"
                id="appdaemonPath"
                placeholder="/config/appdaemon/apps"
                className={`input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary font-mono text-sm ${errors.appdaemonPath ? "input-error" : ""}`}
                {...register("appdaemonPath")}
              />
              {errors.appdaemonPath ? (
                <p className="text-xs text-error">{errors.appdaemonPath.message}</p>
              ) : (
                <p className="text-xs text-base-content/50">
                  Path to AppDaemon apps folder containing apps.yaml
                </p>
              )}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-base-content border-b border-base-300 pb-2">
            Instance Categories
          </h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                      setCategories([...categories, newCategory.trim()]);
                      setNewCategory("");
                    }
                  }
                }}
                placeholder="Add category..."
                className="input input-bordered input-sm flex-1 bg-base-200 border-base-300 focus:border-primary"
              />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory("");
                  }
                }}
              >
                Add
              </button>
            </div>
            
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setCategories(categories.filter((c) => c !== cat))}
                      className="hover:bg-primary/20 rounded-full p-0.5"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50">
                No categories defined. Add categories to organize your instances.
              </p>
            )}
            
            {/* Hidden input to pass categories to form */}
            <input type="hidden" name="categories" value={JSON.stringify(categories)} />
          </div>
        </div>

        {/* Home Assistant Section - Hidden in add-on mode */}
        {!addonMode && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-base-content border-b border-base-300 pb-2">
              Home Assistant Connection
              <span className="text-xs font-normal text-base-content/50 ml-2">(optional)</span>
            </h3>
            
            <div className="space-y-1.5">
              <label htmlFor="haUrl" className="block text-sm font-medium text-base-content">
                Home Assistant URL
              </label>
              <input
                type="url"
                id="haUrl"
                placeholder="http://homeassistant.local:8123"
                className={`input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary ${errors.haUrl ? "input-error" : ""}`}
                {...register("haUrl")}
              />
              {errors.haUrl ? (
                <p className="text-xs text-error">{errors.haUrl.message}</p>
              ) : (
                <p className="text-xs text-base-content/50">
                  The URL of your Home Assistant instance
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="haToken" className="block text-sm font-medium text-base-content">
                Long-Lived Access Token
              </label>
              <div className="flex gap-1">
                <input
                  type={showToken ? "text" : "password"}
                  id="haToken"
                  placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
                  className={`input input-bordered input-sm flex-1 font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${errors.haToken ? "input-error" : ""}`}
                  {...register("haToken")}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.haToken ? (
                <p className="text-xs text-error">{errors.haToken.message}</p>
              ) : (
                <p className="text-xs text-base-content/50">
                  Create in Home Assistant: Profile → Long-Lived Access Tokens
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-base-200/50 border border-base-300">
          <p className="text-xs text-base-content/60">
            <strong className="text-base-content/80">Note:</strong>{" "}
            {addonMode
              ? "Categories are stored locally in your browser for organizing instances."
              : "Settings are stored locally in your browser. Home Assistant credentials are used to fetch entities for selectors."}
          </p>
        </div>

        <div className="pt-2">
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
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </Form>
  );
}
