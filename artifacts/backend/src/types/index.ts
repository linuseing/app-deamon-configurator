// Blueprint metadata
export interface BlueprintMetadata {
  name: string;
  description: string;
  domain: string;
  author?: string;
  min_version?: string;
}

// Selector types matching Home Assistant's blueprint selectors
export interface EntitySelector {
  entity: {
    domain?: string | string[];
    device_class?: string | string[];
    multiple?: boolean;
  };
}

export interface DeviceSelector {
  device: {
    integration?: string;
    manufacturer?: string;
    model?: string;
    multiple?: boolean;
  };
}

export interface AreaSelector {
  area: {
    multiple?: boolean;
  };
}

export interface NumberSelector {
  number: {
    min?: number;
    max?: number;
    step?: number;
    unit_of_measurement?: string;
    mode?: "box" | "slider";
  };
}

export interface TextSelector {
  text: {
    multiline?: boolean;
    type?: "text" | "password" | "email" | "url";
  };
}

export interface BooleanSelector {
  boolean: Record<string, never>;
}

export interface SelectSelector {
  select: {
    options: (string | { label: string; value: string })[];
    multiple?: boolean;
    custom_value?: boolean;
  };
}

export interface TimeSelector {
  time: Record<string, never>;
}

export interface DateTimeSelector {
  datetime: Record<string, never>;
}

export interface NotificationSelector {
  notify: Record<string, never>;
}

export type Selector =
  | EntitySelector
  | DeviceSelector
  | AreaSelector
  | NumberSelector
  | TextSelector
  | BooleanSelector
  | SelectSelector
  | TimeSelector
  | DateTimeSelector
  | NotificationSelector;

// Blueprint input definition
export interface BlueprintInput {
  name: string;
  description?: string;
  default?: unknown;
  selector?: Selector;
}

// Blueprint section definition
export interface BlueprintSection {
  name: string;
  description?: string;
  icon?: string;
  collapsed?: boolean;
  input: Record<string, BlueprintInput | BlueprintSection>;
}

// Full blueprint structure
export interface Blueprint {
  blueprint: BlueprintMetadata;
  input: Record<string, BlueprintInput | BlueprintSection>;
}

// Blueprint with ID for listing
export interface BlueprintSummary {
  id: string;
  name: string;
  description: string;
  domain: string;
  author?: string;
  inputCount: number;
}

// Home Assistant connection settings
export interface HASettings {
  url: string;
  token: string;
}

// App settings (includes HA + AppDaemon paths)
export interface AppSettings {
  haUrl: string;
  haToken: string;
  appdaemonPath: string;
  categories?: string[];
}

// App instance from apps.yaml
export interface AppInstance {
  id: string;              // YAML key (e.g., "motion_light_living_room")
  module: string;
  class: string;
  _blueprint?: string;     // Links back to blueprint ID
  _category?: string;      // Instance category
  _tags?: string[];        // Instance tags
  config: Record<string, unknown>;
}

// App instance summary for listing
export interface AppInstanceSummary {
  id: string;
  module: string;
  class: string;
  blueprintId?: string;
  blueprintName?: string;
  configCount: number;
  category?: string;
  tags?: string[];
}

// Configuration values from the form
export type ConfigValues = Record<string, unknown>;

// Home Assistant entity state (simplified)
export interface HAEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    [key: string]: unknown;
  };
}

// Home Assistant device (simplified)
export interface HADevice {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  area_id?: string;
}

// Home Assistant area (simplified)
export interface HAArea {
  area_id: string;
  name: string;
}

// Helper to determine selector type
export function getSelectorType(
  selector: Selector | undefined
): string | undefined {
  if (!selector) return undefined;
  return Object.keys(selector)[0];
}

// Type guards for selectors
export function isEntitySelector(
  selector: Selector
): selector is EntitySelector {
  return "entity" in selector;
}

export function isDeviceSelector(
  selector: Selector
): selector is DeviceSelector {
  return "device" in selector;
}

export function isAreaSelector(selector: Selector): selector is AreaSelector {
  return "area" in selector;
}

export function isNumberSelector(
  selector: Selector
): selector is NumberSelector {
  return "number" in selector;
}

export function isTextSelector(selector: Selector): selector is TextSelector {
  return "text" in selector;
}

export function isBooleanSelector(
  selector: Selector
): selector is BooleanSelector {
  return "boolean" in selector;
}

export function isSelectSelector(
  selector: Selector
): selector is SelectSelector {
  return "select" in selector;
}

export function isTimeSelector(selector: Selector): selector is TimeSelector {
  return "time" in selector;
}

export function isDateTimeSelector(
  selector: Selector
): selector is DateTimeSelector {
  return "datetime" in selector;
}

export function isNotificationSelector(
  selector: Selector
): selector is NotificationSelector {
  return "notify" in selector;
}

// Type guard for BlueprintSection
export function isSection(
  item: BlueprintInput | BlueprintSection
): item is BlueprintSection {
  return "input" in item;
}

// Helper to flatten inputs from a nested structure
export function flattenInputs(
  inputs: Record<string, BlueprintInput | BlueprintSection> | undefined
): Record<string, BlueprintInput> {
  let flat: Record<string, BlueprintInput> = {};

  if (!inputs) return flat;

  for (const [key, item] of Object.entries(inputs)) {
    if (isSection(item)) {
      flat = { ...flat, ...flattenInputs(item.input) };
    } else {
      flat[key] = item;
    }
  }

  return flat;
}
