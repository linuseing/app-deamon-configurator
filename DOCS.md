# AppDaemon Blueprint Configurator - Documentation

This document explains the configuration format, blueprint system, and architecture for both human developers and AI agents working with this project.

---

## Table of Contents

1. [Overview](#overview)
2. [The Blueprint Concept](#the-blueprint-concept)
3. [Blueprint File Format](#blueprint-file-format)
4. [Supported Selectors](#supported-selectors)
5. [Generated Output Format](#generated-output-format)
6. [Home Assistant Add-on Configuration](#home-assistant-add-on-configuration)
7. [API Reference](#api-reference)
8. [Architecture Overview](#architecture-overview)

---

## Overview

The AppDaemon Blueprint Configurator bridges the gap between Home Assistant's intuitive blueprint UI and AppDaemon's powerful Python scripting. It allows users to:

1. **Define** AppDaemon apps with a declarative `blueprint.yaml` alongside the Python code
2. **Configure** apps through a web UI that reads the blueprint and presents appropriate form inputs
3. **Generate** valid `apps.yaml` entries ready for AppDaemon

This approach brings the "fill in the blanks" simplicity of Home Assistant blueprints to AppDaemon automations.

---

## The Blueprint Concept

### What is a Blueprint?

A blueprint is a **metadata file** (`blueprint.yaml`) that describes the configuration options for an AppDaemon app. It defines:

- **What** the app does (name, description)
- **Who** created it (author)
- **What inputs** the app needs (entities, numbers, booleans, etc.)
- **What types** those inputs should be (using selectors)

### Why Blueprints?

When migrating complex automations from Home Assistant to AppDaemon:
- You lose the visual configuration UI
- Users must manually edit `apps.yaml` with correct syntax
- There's no validation or entity picking

Blueprints restore this UX by:
- Providing structured input definitions
- Enabling form-based configuration
- Integrating with Home Assistant API for entity/device selection

### File Structure

Each AppDaemon app should be organized as:

```
apps/
├── motion-light/
│   ├── blueprint.yaml    # UI configuration schema
│   └── motion_light.py   # Python implementation
├── garbage-reminder/
│   ├── blueprint.yaml
│   └── garbage_reminder.py
└── apps.yaml             # Generated configurations
```

---

## Blueprint File Format

A blueprint file has two main sections: `blueprint` (metadata) and `input` (configuration fields).

### Complete Example

```yaml
blueprint:
  name: Motion Light
  description: Turn on a light when motion is detected, and turn it off after a configurable delay
  domain: automation
  author: AppDaemon Configurator

input:
  motion_sensor:
    name: Motion Sensor
    description: The binary sensor that detects motion
    selector:
      entity:
        domain: binary_sensor
        device_class: motion

  target_light:
    name: Target Light
    description: The light to control when motion is detected
    selector:
      entity:
        domain: light

  delay:
    name: Turn Off Delay
    description: Time to wait before turning off the light after motion stops
    default: 120
    selector:
      number:
        min: 0
        max: 3600
        step: 10
        unit_of_measurement: seconds
        mode: slider

  brightness:
    name: Brightness
    description: Brightness level when turning on the light (0-100)
    default: 100
    selector:
      number:
        min: 0
        max: 100
        step: 5
        unit_of_measurement: "%"
        mode: slider

  only_after_sunset:
    name: Only After Sunset
    description: Only turn on the light after sunset
    default: false
    selector:
      boolean: {}
```

### Blueprint Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Human-readable name displayed in the UI |
| `description` | string | ✅ | What this automation does |
| `domain` | string | ✅ | Category (e.g., `automation`, `script`) |
| `author` | string | ❌ | Creator's name |
| `min_version` | string | ❌ | Minimum AppDaemon version required |

### Input Definition

Each input key becomes a configuration parameter. The key name (e.g., `motion_sensor`) is used in both the UI and generated YAML.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display label in the UI |
| `description` | string | ❌ | Help text shown below the input |
| `default` | any | ❌ | Pre-filled value |
| `selector` | object | ✅ | Determines the input type and validation |

---

## Supported Selectors

Selectors define what type of input to render and how to validate it. They are inspired by Home Assistant's blueprint selectors.

### Entity Selector

Select a Home Assistant entity. The UI fetches entities from Home Assistant and filters by the specified criteria.

```yaml
selector:
  entity:
    domain: light                    # Filter by domain (string or array)
    device_class: motion             # Filter by device class (string or array)
    multiple: false                  # Allow selecting multiple entities
```

**Examples:**

```yaml
# Single light
selector:
  entity:
    domain: light

# Motion sensors only
selector:
  entity:
    domain: binary_sensor
    device_class: motion

# Any sensor or binary_sensor
selector:
  entity:
    domain:
      - sensor
      - binary_sensor

# Multiple selection
selector:
  entity:
    domain: light
    multiple: true
```

### Device Selector

Select a Home Assistant device.

```yaml
selector:
  device:
    integration: zwave_js           # Filter by integration
    manufacturer: Philips           # Filter by manufacturer
    model: Hue Bridge               # Filter by model
    multiple: false                 # Allow selecting multiple devices
```

### Area Selector

Select a Home Assistant area.

```yaml
selector:
  area:
    multiple: false                 # Allow selecting multiple areas
```

### Number Selector

Numeric input with constraints.

```yaml
selector:
  number:
    min: 0                          # Minimum value
    max: 100                        # Maximum value
    step: 5                         # Increment step
    unit_of_measurement: "%"        # Unit label
    mode: slider                    # "slider" or "box"
```

**Example with temperature:**

```yaml
morning_temp:
  name: Morning Temperature
  default: 21
  selector:
    number:
      min: 15
      max: 28
      step: 0.5
      unit_of_measurement: "°C"
      mode: box
```

### Text Selector

Text input field.

```yaml
selector:
  text:
    multiline: false                # Single line or textarea
    type: text                      # "text", "password", "email", or "url"
```

**Example:**

```yaml
arrival_message:
  name: Arrival Message
  default: "Welcome home!"
  selector:
    text:
      multiline: false
```

### Boolean Selector

Toggle switch for true/false values.

```yaml
selector:
  boolean: {}
```

**Example:**

```yaml
only_after_sunset:
  name: Only After Sunset
  default: false
  selector:
    boolean: {}
```

### Select Selector

Dropdown with predefined options.

```yaml
selector:
  select:
    options:
      - "option1"                   # Simple string options
      - "option2"
      - label: "Display Name"       # Or label/value pairs
        value: "actual_value"
    multiple: false                 # Allow multiple selection
    custom_value: false             # Allow custom values not in list
```

**Example:**

```yaml
priority:
  name: Priority Level
  default: medium
  selector:
    select:
      options:
        - label: Low
          value: low
        - label: Medium
          value: medium
        - label: High
          value: high
```

### Time Selector

Time picker (HH:MM:SS format).

```yaml
selector:
  time: {}
```

**Example:**

```yaml
reminder_time:
  name: Reminder Time
  default: "19:00:00"
  selector:
    time: {}
```

### DateTime Selector

Combined date and time picker.

```yaml
selector:
  datetime: {}
```

### Notification Selector (notify)

Special selector for Home Assistant notification services. The UI fetches available `notify.*` services.

```yaml
selector:
  notify: {}
```

**Example:**

```yaml
notify_service:
  name: Notification Service
  description: The notification service to use for reminders
  selector:
    notify: {}
```

---

## Generated Output Format

When a user configures a blueprint, the system generates an entry for AppDaemon's `apps.yaml`.

### Output Structure

```yaml
instance_name:
  module: folder_name.python_file     # Path to Python module
  class: ClassName                     # Python class name
  _blueprint: blueprint-id             # Links back to the source blueprint
  _category: optional_category         # Optional organizational category
  _tags:                               # Optional tags for filtering
    - tag1
    - tag2
  input_key_1: configured_value
  input_key_2: configured_value
```

### Example

Given a blueprint for "Motion Light" and user configuration:

**Generated apps.yaml entry:**

```yaml
motion_light_kitchen:
  module: motion-light.motion_light
  class: MotionLight
  _blueprint: motion-light
  motion_sensor: binary_sensor.kitchen_motion
  target_light: light.kitchen_light_strip
  delay: 1360
  brightness: 80
  only_after_sunset: true
```

### Special Fields

| Field | Purpose |
|-------|---------|
| `_blueprint` | Links instance back to its source blueprint (for editing) |
| `_category` | Organizational grouping (UI feature) |
| `_tags` | Array of tags for filtering (UI feature) |

Fields starting with `_` are metadata and typically not used by the Python app itself.

---

## Home Assistant Add-on Configuration

This project is designed to run as a Home Assistant add-on. The `config.yaml` in the repository root defines the add-on manifest.

### config.yaml Structure

```yaml
name: "AppDaemon Blueprint Configurator"
version: "2.0.2"
slug: "appdaemon_configurator"
description: "Configure AppDaemon apps using a blueprint-style UI"
url: "https://github.com/your-username/app-demon-config"

# CPU architectures supported
arch:
  - aarch64
  - amd64
  - armhf
  - armv7
  - i386

# Ingress for seamless HA sidebar integration
ingress: true
ingress_port: 8099
panel_icon: "mdi:robot"
panel_title: "AppDaemon Config"

# API permissions
homeassistant_api: true    # Access HA REST API
auth_api: true             # Access authentication

# Volume mappings
map:
  - addon_config:rw        # Read/write to add-on config
  - share:rw               # Read/write to /share
  - all_addon_configs:rw   # Access other add-ons' configs

# Startup behavior
init: false
startup: application
boot: auto

# User-configurable options
options:
  appdaemon_apps_path: "/share/appdaemon/apps"

# Options schema validation
schema:
  appdaemon_apps_path: str
```

### Key Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `appdaemon_apps_path` | `/share/appdaemon/apps` | Path to AppDaemon's apps directory |

---

## API Reference

The backend exposes a REST API for the frontend.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blueprints` | List all discovered blueprints |
| `GET` | `/api/blueprints/:id` | Get a specific blueprint |
| `GET` | `/api/instances` | List all configured app instances |
| `GET` | `/api/instances/:id` | Get a specific instance |
| `POST` | `/api/instances` | Create a new instance |
| `PUT` | `/api/instances/:id` | Update an existing instance |
| `DELETE` | `/api/instances/:id` | Delete an instance |
| `GET` | `/api/entities` | Get Home Assistant entities |
| `GET` | `/api/services` | Get Home Assistant services |
| `GET` | `/api/settings` | Get app settings |
| `POST` | `/api/settings` | Update app settings |
| `POST` | `/api/upload` | Upload a new blueprint |

### Entity Filtering

The `/api/entities` endpoint accepts query parameters for filtering:

```
GET /api/entities?domain=light
GET /api/entities?domain=binary_sensor&device_class=motion
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Home Assistant                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Entities  │  │   Devices   │  │   Services  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              AppDaemon Blueprint Configurator                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       Backend (Express)                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │ Blueprint  │  │  Instance  │  │  HA API Proxy      │  │   │
│  │  │  Parser    │  │  Manager   │  │  (entities/svc)    │  │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘  │   │
│  └────────┼───────────────┼───────────────────┼─────────────┘   │
│           │               │                   │                  │
│           ▼               ▼                   ▼                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React + Vite)                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │ Blueprint  │  │ Configure  │  │    Instance        │  │   │
│  │  │   List     │  │   Form     │  │    Management      │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AppDaemon                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       apps.yaml                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ Instance 1  │  │ Instance 2  │  │    Instance N   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Python Apps                             │  │
│  │  motion_light.py  |  garbage_reminder.py  |  ...          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Discovery**: Backend scans `appdaemon_apps_path` for `blueprint.yaml` files
2. **Selection**: User selects a blueprint to configure
3. **Form Generation**: Frontend renders input fields based on blueprint selectors
4. **Entity Fetching**: When needed, frontend requests entities/services from backend (proxied from HA)
5. **Configuration**: User fills in values
6. **Generation**: Backend writes entry to `apps.yaml`
7. **Execution**: AppDaemon reads `apps.yaml` and instantiates apps

---

## For AI Agents

### Key Files to Understand

| File | Purpose |
|------|---------|
| `artifacts/backend/src/lib/blueprint.ts` | Blueprint parsing and discovery |
| `artifacts/backend/src/lib/apps.ts` | Reading/writing apps.yaml |
| `artifacts/frontend/src/types/index.ts` | TypeScript type definitions |
| `artifacts/frontend/src/components/inputs/` | Input component implementations |
| `mock-appdaemon/apps/*/blueprint.yaml` | Example blueprints |

### Adding a New Selector Type

1. Add TypeScript interface to `artifacts/frontend/src/types/index.ts`
2. Add to the `Selector` union type
3. Create type guard function (`isNewSelector`)
4. Create input component in `artifacts/frontend/src/components/inputs/`
5. Register in `artifacts/frontend/src/components/inputs/index.ts`
6. Update `ConfigureForm.tsx` to handle the new selector

### Creating a New Blueprint

1. Create folder under apps directory: `apps/my-app/`
2. Add `blueprint.yaml` with metadata and inputs
3. Add Python implementation `my_app.py`
4. The configurator will auto-discover it

---

## Quick Reference

### Minimal Blueprint Template

```yaml
blueprint:
  name: My App Name
  description: What this app does
  domain: automation
  author: Your Name

input:
  my_input:
    name: Display Name
    description: Help text
    selector:
      text: {}
```

### Common Selector Patterns

```yaml
# Entity picker for lights
selector:
  entity:
    domain: light

# Numeric slider 0-100
selector:
  number:
    min: 0
    max: 100
    mode: slider

# Yes/No toggle
selector:
  boolean: {}

# Time picker
selector:
  time: {}

# Notification service
selector:
  notify: {}
```
