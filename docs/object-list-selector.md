# Object List Selector

The `object_list` selector allows blueprint authors to define a **repeatable list of structured objects**. Each object in the list shares the same schema, defined by a `fields` map. The UI renders each item as a collapsible card with add and remove controls.

## Blueprint Definition

Add an `object_list` selector to any input in your `blueprint.yaml`:

```yaml
input:
  cameras:
    name: Cameras
    description: Configure your camera feeds
    selector:
      object_list:
        fields:
          name:
            name: Camera Name
            selector:
              text: {}
          frigate_camera_name:
            name: Frigate Camera Name
            description: Must match the camera name in Frigate
            selector:
              text: {}
          object_types:
            name: Object Types
            selector:
              select:
                options:
                  - person
                  - package
                  - car
                  - dog
                  - cat
                multiple: true
          notify_always:
            name: Always Notify
            default: false
            selector:
              boolean: {}
          ptz_enabled:
            name: PTZ Enabled
            default: false
            selector:
              boolean: {}
          privacy_preset:
            name: Privacy Preset
            description: Frigate PTZ preset name
            selector:
              text: {}
          surveillance_preset:
            name: Surveillance Preset
            description: Frigate PTZ preset name
            selector:
              text: {}
```

## Generated Output

When a user fills in the form, the resulting `apps.yaml` config will contain a YAML list of objects:

```yaml
my_frigate_app:
  module: frigate_monitor
  class: FrigateMonitor
  _blueprint: frigate-monitor
  cameras:
    - name: Front Door
      frigate_camera_name: front_door
      object_types:
        - person
        - package
      notify_always: true
      ptz_enabled: false
    - name: Living Room
      frigate_camera_name: living_room
      object_types:
        - person
      notify_always: false
      ptz_enabled: true
      privacy_preset: Privacy
      surveillance_preset: Monitor
```

## Supported Field Types

Each field inside `object_list.fields` is a standard `BlueprintInput` and supports all existing selectors:

| Selector | Example | Notes |
|----------|---------|-------|
| `text` | `selector: { text: {} }` | Supports `multiline`, `type` (password, email, url) |
| `number` | `selector: { number: { min: 0, max: 100 } }` | Supports `min`, `max`, `step`, `unit_of_measurement`, `mode` (box/slider) |
| `boolean` | `selector: { boolean: {} }` | Renders a checkbox toggle |
| `select` | `selector: { select: { options: [...] } }` | Supports `multiple` |
| `entity` | `selector: { entity: { domain: light } }` | Home Assistant entity picker, supports `multiple` |
| `notify` | `selector: { notify: {} }` | Notification service picker |
| *(none)* | *(no selector key)* | Defaults to a plain text input |

### Example with mixed field types

```yaml
input:
  zones:
    name: Monitoring Zones
    selector:
      object_list:
        fields:
          zone_name:
            name: Zone Name
            selector:
              text: {}
          area:
            name: Home Assistant Area
            selector:
              area: {}
          sensitivity:
            name: Detection Sensitivity
            default: 50
            selector:
              number:
                min: 0
                max: 100
                step: 5
                unit_of_measurement: "%"
                mode: slider
          enabled:
            name: Enabled
            default: true
            selector:
              boolean: {}
```

## Default Values

You can provide defaults at two levels:

### Per-field defaults

Each field definition can include a `default` value. When the user clicks "Add", the new item is populated with these defaults:

```yaml
fields:
  enabled:
    name: Enabled
    default: true
    selector:
      boolean: {}
  timeout:
    name: Timeout
    default: 30
    selector:
      number:
        min: 1
        max: 300
```

If no explicit default is set, fields default to sensible zero-values: `""` for text, `false` for boolean, `0` (or `min`) for number.

### Input-level defaults

You can also set a `default` on the input itself to pre-populate the list with items:

```yaml
input:
  cameras:
    name: Cameras
    default:
      - name: Default Camera
        enabled: true
    selector:
      object_list:
        fields:
          name:
            name: Camera Name
            selector:
              text: {}
          enabled:
            name: Enabled
            default: true
            selector:
              boolean: {}
```

## UI Behavior

- **Empty state**: Shows a dashed placeholder with "No items added yet"
- **Add button**: Labeled "Add {singular label}" (e.g., "Add Camera" for a field labeled "Cameras")
- **Each item**: Renders as a collapsible card showing the item number and a preview title derived from the first text field
- **Remove**: Each item has a remove button in its header
- **Collapsible**: Items are expanded by default and can be collapsed to save space

## Limitations

- **No nested lists**: `object_list` fields cannot themselves contain another `object_list` selector. If encountered, the nested field falls back to a plain text input.
- **No sections within items**: Fields inside an object list item are flat. Use the top-level `section` structure to group object lists with other inputs.
