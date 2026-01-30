import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("instances", "routes/instances.tsx"),
  route("instances/:instanceId/edit", "routes/instances.$instanceId.edit.tsx"),
  route("settings", "routes/settings.tsx"),
  route("configure/:blueprintId", "routes/configure.$blueprintId.tsx"),
  route("preview", "routes/preview.tsx"),
  route("api/entities", "routes/api.entities.ts"),
  route("api/notify-services", "routes/api.notify-services.ts"),
  route("api/instances/save", "routes/api.instances.save.ts"),
] satisfies RouteConfig;
