# AppDaemon Blueprint Configurator

A web UI for configuring AppDaemon apps using a blueprint-style interface, inspired by Home Assistant's blueprint system.

## Project Vision

When migrating complex automations from Home Assistant to AppDaemon Python scripts, the intuitive blueprint configurator UI is lost. This project bridges that gap by providing:

1. **Blueprint Definition**: Apps are packaged with a `blueprint.yaml` containing metadata and configuration options
2. **Configuration UI**: A web interface that reads blueprints and presents a form-based configuration experience
3. **YAML Output**: Generates prefilled `apps.yaml` blocks ready for AppDaemon
4. **Home Assistant Integration**: Connects to HA API to fetch entities/devices matching selector criteria

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  blueprint.yaml │────▶│  Blueprint Parser │────▶│  Configuration  │
└─────────────────┘     └──────────────────┘     │       UI        │
                                                  └────────┬────────┘
┌─────────────────┐                                        │
│  Home Assistant │────────────────────────────────────────┤
│      API        │  (entities, devices for selectors)     │
└─────────────────┘                                        ▼
                                                  ┌─────────────────┐
                                                  │  YAML Generator │
                                                  └────────┬────────┘
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   apps.yaml     │
                                                  │     output      │
                                                  └─────────────────┘
```

## Tech Stack

- **Framework**: React Router 7 (framework mode with server-side loaders/actions)
- **Styling**: Tailwind CSS + DaisyUI
- **Language**: TypeScript
- **YAML Parsing**: `yaml` package

## Blueprint Schema

Blueprints follow a schema inspired by Home Assistant blueprints:

```yaml
blueprint:
  name: "Human-readable name"
  description: "What this automation does"
  domain: automation  # or script, etc.
  author: "Your Name"

input:
  input_key:
    name: "Display Name"
    description: "Help text for this input"
    default: "optional default value"
    selector:
      # Selector type determines UI component and validation
      entity:
        domain: light
        device_class: motion
      # OR
      number:
        min: 0
        max: 100
        step: 1
        unit_of_measurement: "%"
      # OR
      text:
        multiline: false
      # OR
      boolean: {}
      # OR
      select:
        options:
          - "option1"
          - "option2"
      # OR
      device:
        integration: zwave_js
      # OR
      area: {}
      # OR
      time: {}
      # OR
      datetime: {}
```

## Supported Selectors

| Selector | Description | HA API Integration |
|----------|-------------|-------------------|
| `entity` | Select a Home Assistant entity | Fetches entities filtered by domain/device_class |
| `device` | Select a device | Fetches devices filtered by integration |
| `area` | Select an area | Fetches areas from HA |
| `number` | Numeric input with min/max/step | N/A |
| `text` | Text input (single or multiline) | N/A |
| `boolean` | Toggle switch | N/A |
| `select` | Dropdown with predefined options | N/A |
| `time` | Time picker | N/A |
| `datetime` | Date and time picker | N/A |

## Application Routes

| Route | Purpose |
|-------|---------|
| `/` | Home - List available blueprints |
| `/settings` | Configure Home Assistant connection (URL + token) |
| `/configure/:blueprintId` | Configure a specific blueprint |
| `/preview` | View and copy generated apps.yaml |

## Code Organization

- **Routes** (`app/routes/`): Layout and scaffolding only, compose components
- **Components** (`app/components/`): Each in own file, handle all UI logic
- **Lib** (`app/lib/`): Types, utilities, server-side helpers

## Home Assistant API Integration

The app connects to Home Assistant's REST API using a long-lived access token:

- `GET /api/states` - Fetch all entity states (filtered client-side by selector criteria)
- `GET /api/config/device_registry/list` - Fetch devices
- `GET /api/config/area_registry/list` - Fetch areas

## Generated Output Format

The configurator generates AppDaemon-compatible YAML:

```yaml
motion_light_living_room:
  module: motion_light
  class: MotionLight
  motion_sensor: binary_sensor.living_room_motion
  target_light: light.living_room_ceiling
  delay: 120
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Future Considerations

- Blueprint file upload vs. directory scanning
- OAuth 2.0 authentication for Home Assistant
- Blueprint validation and error reporting
- Export/import configuration presets
- Multi-app configuration in single session
