# Task: Refactor AppDaemon Blueprint Configurator to Backend + Static SPA Architecture

## Background & Problem

This project is a Home Assistant add-on that provides a web UI for configuring AppDaemon apps using blueprints. It currently uses **React Router 7 in framework mode** (with SSR) which has proven incompatible with Home Assistant's **Ingress** feature.

### The Ingress Problem

- HA Ingress proxies requests through a dynamic path like `/api/hassio_ingress/<token>/`
- The app is served at this path but internally thinks it's at `/`
- React Router 7's framework mode has assumptions about URL structure that break:
  - Dynamic route module imports use relative paths that compound (`/assets/assets/assets/...`)
  - SSR/hydration requires server and client to agree on basename
  - The basename comes from a runtime HTTP header, not build-time config
- After 10+ attempts with various workarounds (nginx rewrites, basename injection, SPA mode), it's clear this architecture is fundamentally incompatible.

## Goal Architecture

Refactor into two independent artifacts in `artifacts/` folder:

```
artifacts/
├── frontend/          # Static SPA (Vite + React)
│   ├── src/
│   ├── dist/          # Built static files
│   ├── package.json
│   └── vite.config.ts
│
└── backend/           # Express API server
    ├── src/
    ├── package.json
    └── tsconfig.json
```

### Frontend (Static SPA)

- Vite + React + React Router (in SPA/library mode, NOT framework mode)
- Built to static files served by the backend
- Uses `HashRouter` or `BrowserRouter` with runtime basename detection
- All data fetching via API calls to the backend
- Keep existing components, styling (Tailwind + DaisyUI), and UI

### Backend (Express API)

- Express.js server
- Serves static frontend files
- Provides REST API endpoints for:
  - Blueprint discovery and parsing
  - App instance CRUD operations
  - Home Assistant entity/service fetching (proxy to HA API)
  - Settings management
- Handles file system operations (reading/writing apps.yaml, blueprints)

### Single Container

- Both run in the same Docker container
- Backend serves frontend static files AND API
- Listens on port 8099 (or via nginx proxy)
- Works with HA Ingress because:
  - Frontend is static HTML/JS/CSS with no SSR
  - API calls use relative paths or are configured at runtime
  - No complex basename/path coordination needed

## What to Preserve

### Keep from current frontend

- All components in `app/components/` (BlueprintCard, BlueprintList, ConfigureForm, inputs/*, etc.)
- Styling approach (Tailwind CSS + DaisyUI)
- UI/UX design and flow
- TypeScript types from `app/lib/types.ts`

### Keep from current backend logic

- Blueprint parsing logic (`app/lib/blueprint.server.ts`)
- Apps.yaml management (`app/lib/apps.server.ts`)
- Home Assistant API client (`app/lib/homeassistant.server.ts`)
- Settings management (`app/lib/settings.server.ts`)
- Supervisor API integration (`app/lib/supervisor.server.ts`)

### Redesign

- Data flow: Replace React Router loaders/actions with API calls + React Query or SWR
- Routing: Use React Router in library mode with HashRouter (simplest for ingress) or BrowserRouter with runtime basename
- State management: Local state + API calls instead of server-side loaders

## Current File Structure Reference

```
app/
├── components/        # Keep all - UI components
├── lib/              # Keep server-side logic → move to backend
├── routes/           # Convert to pages + API endpoints
├── root.tsx          # Redesign as App shell
├── entry.client.tsx  # Replace with standard Vite entry
└── entry.server.tsx  # Remove - no SSR
```

## Constraints

1. **Single container deployment** - Both frontend and backend must run in one Docker container as an HA add-on
2. **HA Ingress compatibility** - Must work when accessed via `/api/hassio_ingress/<token>/`
3. **Keep existing UI** - Users should see the same interface
4. **TypeScript** - Both frontend and backend should use TypeScript
5. **Existing infrastructure** - Keep nginx.conf approach if helpful, or simplify if not needed

## Deliverables

1. `artifacts/frontend/` - Complete static SPA with all UI components migrated
2. `artifacts/backend/` - Express API server with all backend logic migrated
3. Updated `Dockerfile` - Builds both and runs them together
4. Updated `run.sh` - Starts the combined service
5. Updated `config.yaml` if needed

## Success Criteria

- App loads correctly through HA Ingress
- Navigation between pages works without 404s
- All existing functionality preserved:
  - Browse blueprints
  - Configure new instances
  - Edit existing instances
  - Delete instances
  - Settings management
  - Entity/service autocomplete from HA
