# AppDaemon Blueprint Configurator

A Home Assistant add-on that provides a blueprint-style UI for configuring AppDaemon apps.

## Features

- **Blueprint Discovery**: Automatically discovers AppDaemon apps with `blueprint.yaml` files
- **Configuration UI**: Form-based configuration interface similar to Home Assistant blueprints
- **Entity Selectors**: Fetch entities, devices, and areas from Home Assistant
- **Instance Management**: Create, edit, and delete app instances
- **Organization**: Categorize and tag instances for easy management
- **YAML Output**: Generates proper `apps.yaml` configuration blocks

## Installation as Home Assistant Add-on

1. In Home Assistant, go to **Settings → Add-ons → Add-on Store**
2. Click the **⋮** menu (top right) → **Repositories**
3. Add this repository URL:
   ```
   https://github.com/your-username/app-demon-config
   ```
4. Click **Add**, then close the dialog
5. Find "AppDaemon Blueprint Configurator" in the store and click **Install**
6. Start the add-on and access it via the sidebar panel

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `appdaemon_apps_path` | Path to AppDaemon apps folder | `/share/appdaemon/apps` |

## Setting Up Blueprints

Create a `blueprint.yaml` file in each app folder:

```yaml
blueprint:
  name: "Motion Light"
  description: "Turn on lights when motion is detected"
  domain: automation
  author: "Your Name"

input:
  motion_sensor:
    name: Motion Sensor
    description: The motion sensor to monitor
    selector:
      entity:
        domain: binary_sensor
        device_class: motion

  target_light:
    name: Target Light
    description: The light to control
    selector:
      entity:
        domain: light

  delay:
    name: Turn-off Delay
    description: Time before turning off the light
    default: 120
    selector:
      number:
        min: 0
        max: 3600
        unit_of_measurement: seconds
```

## Supported Selectors

| Selector | Description |
|----------|-------------|
| `entity` | Select Home Assistant entities (filterable by domain/device_class) |
| `device` | Select devices |
| `area` | Select areas |
| `number` | Numeric input with min/max/step |
| `text` | Text input (single or multiline) |
| `boolean` | Toggle switch |
| `select` | Dropdown with predefined options |
| `notify` | Notification service selector |

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building

```bash
npm run build
```

### Running Standalone (without Home Assistant)

You can run this app standalone without Home Assistant:

1. Build the app: `npm run build`
2. Start the server: `npm run start`
3. Go to Settings and configure:
   - Home Assistant URL and access token
   - Path to your AppDaemon apps folder

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

## License

MIT
