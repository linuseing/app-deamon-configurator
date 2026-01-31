# Changelog

## [2.0.0] - 2026-01-31

### Changed

- **Complete architecture rewrite** - Migrated from React Router framework mode (SSR) to static SPA + Express backend
- Removed Nginx dependency - Express now serves static files directly
- Switched from React Router loaders/actions to React Query for data fetching
- Using HashRouter for reliable Ingress compatibility
- Relative asset paths for proper Ingress path handling

### Added

- Dedicated Express.js backend with REST API endpoints
- React Query for caching and state management
- Environment variable support for standalone mode (`APPDAEMON_APPS_PATH`)

### Fixed

- Ingress compatibility issues with dynamic base paths
- Asset loading behind Home Assistant Ingress proxy

### Technical

- Frontend: Vite + React + React Router DOM + React Query + Tailwind/DaisyUI
- Backend: Express 5 + TypeScript
- Single Docker container deployment (no Nginx required)

---

## [1.0.0] - 2026-01-29

### Added

- Initial release of AppDaemon Blueprint Configurator
- Blueprint-based configuration UI for AppDaemon apps
- Automatic Home Assistant API integration via Supervisor
- Support for entity, device, area, and notification selectors
- Instance management (create, edit, delete)
- Category and tag organization for instances
- Dark/light theme support
- Ingress support for seamless Home Assistant UI integration
