import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { ServerRouter, useLocation, Link, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, useRouteLoaderData, Meta, Links, ScrollRestoration, Scripts, useFetcher, useActionData, useNavigate, Form, redirect, data } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect, useRef, useMemo } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import { useRemixForm } from "remix-hook-form";
import { useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdmZip from "adm-zip";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  request.headers.get("user-agent");
  const ingressPath = request.headers.get("x-ingress-path") || "/";
  let basename2 = ingressPath;
  if (basename2 !== "/" && basename2.endsWith("/")) {
    basename2 = basename2.slice(0, -1);
  }
  const url = new URL(request.url);
  if (basename2 !== "/" && !url.pathname.startsWith(basename2)) {
    url.pathname = basename2 + url.pathname;
    url.pathname = url.pathname.replace("//", "/");
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: url.toString(),
          basename: basename2
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const THEMES = ["light", "dark", "dim"];
function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved && THEMES.includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    handleThemeChange(THEMES[nextIndex]);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: cycleTheme,
      className: "p-2 rounded-md text-base-content/60 hover:text-base-content hover:bg-base-200/50 transition-colors",
      title: `Theme: ${theme}`,
      children: theme === "light" ? /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-4 w-4",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            }
          )
        }
      ) : /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-4 w-4",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            }
          )
        }
      )
    }
  );
}
function Navbar({ addonMode = false }) {
  const location = useLocation();
  const isActive = (path2) => {
    if (path2 === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/configure");
    }
    if (path2 === "/instances") {
      return location.pathname === "/instances" || location.pathname.startsWith("/instances/");
    }
    return location.pathname.startsWith(path2);
  };
  return /* @__PURE__ */ jsx("header", { className: "border-b border-base-300 bg-base-100", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 h-14 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-base-content", children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-5 w-5 text-primary",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: [
              /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "AppDaemon Config" }),
        addonMode && /* @__PURE__ */ jsx("span", { className: "ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary uppercase tracking-wide", children: "Add-on" })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: `px-3 py-1.5 text-sm rounded-md transition-colors ${isActive("/") && !isActive("/settings") && !isActive("/instances") ? "bg-base-200 text-base-content" : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"}`,
            children: "Blueprints"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/instances",
            className: `px-3 py-1.5 text-sm rounded-md transition-colors ${isActive("/instances") ? "bg-base-200 text-base-content" : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"}`,
            children: "Instances"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/settings",
            className: `px-3 py-1.5 text-sm rounded-md transition-colors ${isActive("/settings") ? "bg-base-200 text-base-content" : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"}`,
            children: "Settings"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(ThemeToggle, {})
  ] }) });
}
function isAddonMode() {
  return process.env.ADDON_MODE === "true" || !!process.env.SUPERVISOR_TOKEN;
}
function getSupervisorToken() {
  return process.env.SUPERVISOR_TOKEN;
}
async function getAddonOptions() {
  try {
    const content = await fs.readFile("/data/options.json", "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}
async function getAddonAppdaemonPath() {
  if (process.env.APPDAEMON_APPS_PATH) {
    return process.env.APPDAEMON_APPS_PATH;
  }
  const options = await getAddonOptions();
  return options.appdaemon_apps_path;
}
async function getAddonSettings() {
  if (!isAddonMode()) {
    return null;
  }
  const token = getSupervisorToken();
  if (!token) {
    return null;
  }
  const appdaemonPath = await getAddonAppdaemonPath();
  return {
    haUrl: "http://supervisor/core",
    haToken: token,
    appdaemonPath: appdaemonPath || "/share/appdaemon/apps"
  };
}
function stripQuotes(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/^["']|["']$/g, "").trim();
}
function parseSettingsCookie(cookieHeader) {
  const newMatch = cookieHeader.match(/app_settings=([^;]+)/);
  if (newMatch) {
    try {
      const decoded = Buffer.from(newMatch[1], "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
    }
  }
  const legacyMatch = cookieHeader.match(/ha_settings=([^;]+)/);
  if (legacyMatch) {
    try {
      const decoded = Buffer.from(legacyMatch[1], "base64").toString("utf-8");
      const legacy = JSON.parse(decoded);
      return {
        haUrl: legacy.url,
        haToken: legacy.token,
        appdaemonPath: ""
      };
    } catch {
      return void 0;
    }
  }
  return void 0;
}
async function getAppSettings(cookieHeader) {
  let settings2;
  if (isAddonMode()) {
    const addonSettings = await getAddonSettings();
    if (addonSettings) {
      settings2 = addonSettings;
    }
  }
  const cookieSettings = parseSettingsCookie(cookieHeader);
  if (settings2 && cookieSettings) {
    if (cookieSettings.appdaemonPath) {
      settings2.appdaemonPath = cookieSettings.appdaemonPath;
    }
    if (cookieSettings.categories) {
      settings2.categories = cookieSettings.categories;
    }
  } else if (cookieSettings) {
    settings2 = cookieSettings;
  }
  return settings2;
}
function getHASettings(settings2) {
  if (!settings2.haUrl || !settings2.haToken) {
    return void 0;
  }
  return {
    url: settings2.haUrl,
    token: settings2.haToken
  };
}
async function loader$8({
  request
}) {
  const ingressPath = request.headers.get("x-ingress-path") || "/";
  let basename2 = ingressPath;
  if (basename2 !== "/" && basename2.endsWith("/")) {
    basename2 = basename2.slice(0, -1);
  }
  return {
    addonMode: isAddonMode(),
    basename: basename2
  };
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
}];
function Layout({
  children
}) {
  const data2 = useRouteLoaderData("root");
  const basename2 = data2?.basename || "/";
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx("base", {
        href: basename2 === "/" ? "/" : `${basename2}/`
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App({
  loaderData
}) {
  const {
    addonMode,
    basename: basename2
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex flex-col",
    children: [/* @__PURE__ */ jsx("script", {
      dangerouslySetInnerHTML: {
        __html: `window.BASENAME = ${JSON.stringify(basename2)};`
      }
    }), /* @__PURE__ */ jsx(Navbar, {
      addonMode
    }), /* @__PURE__ */ jsx("main", {
      className: "flex-1",
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const FALLBACK_BLUEPRINTS_DIR$1 = path.join(process.cwd(), "blueprints");
async function getAllBlueprints(appdaemonPath) {
  const blueprints = [];
  const searchDir = appdaemonPath || FALLBACK_BLUEPRINTS_DIR$1;
  try {
    const entries = await fs.readdir(searchDir, { withFileTypes: true });
    for (const entry2 of entries) {
      if (entry2.isDirectory()) {
        const blueprintPath = path.join(
          searchDir,
          entry2.name,
          "blueprint.yaml"
        );
        try {
          const content = await fs.readFile(blueprintPath, "utf-8");
          const parsed = parse(content);
          const input = parsed.blueprint?.input || parsed.input || {};
          blueprints.push({
            id: entry2.name,
            name: parsed.blueprint.name,
            description: parsed.blueprint.description,
            domain: parsed.blueprint.domain,
            author: parsed.blueprint.author,
            inputCount: Object.keys(input).length
          });
        } catch {
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Failed to read blueprints from ${searchDir}:`, error);
    }
  }
  return blueprints;
}
async function getBlueprint(id, appdaemonPath) {
  const searchDir = appdaemonPath || FALLBACK_BLUEPRINTS_DIR$1;
  const blueprintPath = path.join(searchDir, id, "blueprint.yaml");
  try {
    const content = await fs.readFile(blueprintPath, "utf-8");
    const parsed = parse(content);
    if (parsed.blueprint?.input) {
      parsed.input = parsed.blueprint.input;
      delete parsed.blueprint.input;
    }
    return parsed;
  } catch {
    return null;
  }
}
function BlueprintCard({ blueprint }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: `/configure/${blueprint.id}`,
      className: "flex flex-col h-full p-4 rounded-lg border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200/30 transition-all group",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium text-base-content group-hover:text-primary transition-colors line-clamp-1", children: blueprint.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/50 mt-1 line-clamp-2", children: blueprint.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-2 mt-3 text-xs text-base-content/40", children: [
          /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-base-200 text-base-content/60", children: blueprint.domain }),
          /* @__PURE__ */ jsxs("span", { children: [
            blueprint.inputCount,
            " inputs"
          ] }),
          blueprint.author && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsx("span", { className: "truncate max-w-[100px]", children: blueprint.author })
          ] })
        ] })
      ]
    }
  );
}
function BlueprintList({ blueprints }) {
  if (blueprints.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12 px-4", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 mb-4", children: /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6 text-base-content/40",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("h3", { className: "text-base font-medium mb-1", children: "No blueprints found" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/50 max-w-sm mx-auto", children: [
        "Add blueprint folders to ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-base-200 px-1 py-0.5 rounded", children: "blueprints/" }),
        " directory. Each folder should contain a ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-base-200 px-1 py-0.5 rounded", children: "blueprint.yaml" }),
        " file."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: blueprints.map((blueprint) => /* @__PURE__ */ jsx(BlueprintCard, { blueprint }, blueprint.id)) });
}
function UploadModal() {
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef(null);
  const dialogRef = useRef(null);
  const isUploading = fetcher.state !== "idle";
  const success = fetcher.data?.success;
  const error = fetcher.data?.error;
  useEffect(() => {
    if (success && isOpen) {
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [success, isOpen]);
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);
  const toggleModal = () => setIsOpen(!isOpen);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("button", { onClick: toggleModal, className: "btn btn-primary btn-sm", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-4 w-4 mr-1",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            }
          )
        }
      ),
      "Upload Blueprints"
    ] }),
    /* @__PURE__ */ jsxs("dialog", { ref: dialogRef, className: "modal", onClose: () => setIsOpen(false), children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-box", children: [
        /* @__PURE__ */ jsx("form", { method: "dialog", children: /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2", children: "✕" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4", children: "Upload Blueprints" }),
        /* @__PURE__ */ jsx("p", { className: "py-2 text-sm text-base-content/70", children: "Upload a .zip file containing your blueprints. The file will be unpacked into your configured AppDaemon apps directory." }),
        /* @__PURE__ */ jsxs(
          fetcher.Form,
          {
            method: "post",
            action: "/api/upload-blueprints",
            encType: "multipart/form-data",
            ref: formRef,
            className: "mt-4 space-y-4",
            children: [
              /* @__PURE__ */ jsx("div", { className: "form-control w-full", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  name: "file",
                  accept: ".zip",
                  required: true,
                  className: "file-input file-input-bordered w-full",
                  disabled: isUploading
                }
              ) }),
              error && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-2", children: [
                /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "stroke-current shrink-0 h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                /* @__PURE__ */ jsx("span", { children: error })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "modal-action", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-ghost",
                    onClick: () => setIsOpen(false),
                    disabled: isUploading,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    className: "btn btn-primary",
                    disabled: isUploading,
                    children: isUploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
                      "Uploading..."
                    ] }) : "Upload"
                  }
                )
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("form", { method: "dialog", className: "modal-backdrop", children: /* @__PURE__ */ jsx("button", { children: "close" }) })
    ] })
  ] });
}
function meta$5({}) {
  return [{
    title: "AppDaemon Configurator"
  }, {
    name: "description",
    content: "Configure AppDaemon apps with a blueprint-style UI"
  }];
}
async function loader$7({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const blueprints = await getAllBlueprints(settings2?.appdaemonPath);
  const needsSettings = !isAddonMode() && !settings2?.appdaemonPath;
  return {
    blueprints,
    needsSettings
  };
}
const home = UNSAFE_withComponentProps(function Home({
  loaderData
}) {
  const {
    blueprints,
    needsSettings
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-6xl mx-auto px-4 py-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-6 flex items-center justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-xl font-semibold",
          children: "Blueprints"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-base-content/50 mt-1",
          children: "Select a blueprint to configure"
        })]
      }), /* @__PURE__ */ jsx(UploadModal, {})]
    }), needsSettings && /* @__PURE__ */ jsx("div", {
      className: "mb-4 p-4 rounded-lg border border-warning/30 bg-warning/5",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex items-start gap-3",
        children: [/* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-5 w-5 text-warning flex-shrink-0 mt-0.5",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex-1",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-base-content/80",
            children: "Configure your AppDaemon apps folder path to discover blueprints."
          }), /* @__PURE__ */ jsx(Link, {
            to: "/settings",
            className: "btn btn-warning btn-xs mt-2",
            children: "Go to Settings"
          })]
        })]
      })
    }), /* @__PURE__ */ jsx(BlueprintList, {
      blueprints
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  loader: loader$7,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
function getAppsYamlPath(appdaemonPath) {
  return path.join(appdaemonPath, "apps.yaml");
}
async function readAppsYaml(appdaemonPath) {
  const appsYamlPath = getAppsYamlPath(appdaemonPath);
  try {
    const content = await fs.readFile(appsYamlPath, "utf-8");
    const parsed = parse(content);
    return parsed || {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}
async function writeAppsYaml(appdaemonPath, apps) {
  const appsYamlPath = getAppsYamlPath(appdaemonPath);
  await fs.mkdir(appdaemonPath, { recursive: true });
  const yamlContent = stringify(apps, {
    indent: 2,
    lineWidth: 0
  });
  await fs.writeFile(appsYamlPath, yamlContent, "utf-8");
}
const RESERVED_KEYS = ["module", "class", "_blueprint", "_category", "_tags"];
async function getAppInstances(appdaemonPath) {
  const apps = await readAppsYaml(appdaemonPath);
  const instances = [];
  for (const [id, config] of Object.entries(apps)) {
    if (!config || typeof config !== "object") continue;
    const module = config.module;
    const className = config.class;
    const blueprintId = config._blueprint;
    const category = config._category;
    const tags = config._tags;
    if (!module || !className) continue;
    let blueprintName;
    if (blueprintId) {
      const blueprint = await getBlueprint(blueprintId, appdaemonPath);
      blueprintName = blueprint?.blueprint?.name;
    }
    const configCount = Object.keys(config).filter(
      (key) => !RESERVED_KEYS.includes(key)
    ).length;
    instances.push({
      id,
      module,
      class: className,
      blueprintId,
      blueprintName,
      configCount,
      category,
      tags
    });
  }
  return instances;
}
async function getAppInstance(appdaemonPath, instanceId) {
  const apps = await readAppsYaml(appdaemonPath);
  const config = apps[instanceId];
  if (!config || typeof config !== "object") {
    return null;
  }
  const module = config.module;
  const className = config.class;
  const blueprintId = config._blueprint;
  const category = config._category;
  const tags = config._tags;
  if (!module || !className) {
    return null;
  }
  const configValues = {};
  for (const [key, value] of Object.entries(config)) {
    if (!RESERVED_KEYS.includes(key)) {
      configValues[key] = value;
    }
  }
  return {
    id: instanceId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config: configValues
  };
}
async function createAppInstance(appdaemonPath, instanceId, module, className, config, blueprintId, category, tags) {
  const apps = await readAppsYaml(appdaemonPath);
  if (apps[instanceId]) {
    throw new Error(`Instance "${instanceId}" already exists`);
  }
  const appConfig = {
    module,
    class: className
  };
  if (blueprintId) {
    appConfig._blueprint = blueprintId;
  }
  if (category) {
    appConfig._category = category;
  }
  if (tags && tags.length > 0) {
    appConfig._tags = tags;
  }
  for (const [key, value] of Object.entries(config)) {
    if (value !== void 0 && value !== "") {
      appConfig[key] = value;
    }
  }
  apps[instanceId] = appConfig;
  await writeAppsYaml(appdaemonPath, apps);
  return {
    id: instanceId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config
  };
}
async function updateAppInstance(appdaemonPath, instanceId, config, newInstanceId, category, tags) {
  const apps = await readAppsYaml(appdaemonPath);
  const existingConfig = apps[instanceId];
  if (!existingConfig) {
    throw new Error(`Instance "${instanceId}" not found`);
  }
  const module = existingConfig.module;
  const className = existingConfig.class;
  const blueprintId = existingConfig._blueprint;
  const appConfig = {
    module,
    class: className
  };
  if (blueprintId) {
    appConfig._blueprint = blueprintId;
  }
  if (category) {
    appConfig._category = category;
  }
  if (tags && tags.length > 0) {
    appConfig._tags = tags;
  }
  for (const [key, value] of Object.entries(config)) {
    if (value !== void 0 && value !== "") {
      appConfig[key] = value;
    }
  }
  const finalId = newInstanceId || instanceId;
  if (newInstanceId && newInstanceId !== instanceId) {
    if (apps[newInstanceId]) {
      throw new Error(`Instance "${newInstanceId}" already exists`);
    }
    delete apps[instanceId];
  }
  apps[finalId] = appConfig;
  await writeAppsYaml(appdaemonPath, apps);
  return {
    id: finalId,
    module,
    class: className,
    _blueprint: blueprintId,
    _category: category,
    _tags: tags,
    config
  };
}
async function deleteAppInstance(appdaemonPath, instanceId) {
  const apps = await readAppsYaml(appdaemonPath);
  if (!apps[instanceId]) {
    throw new Error(`Instance "${instanceId}" not found`);
  }
  delete apps[instanceId];
  await writeAppsYaml(appdaemonPath, apps);
}
function generateInstanceId(blueprintId, existingIds) {
  const baseId = blueprintId.replace(/-/g, "_");
  if (!existingIds.includes(baseId)) {
    return baseId;
  }
  let counter = 2;
  while (existingIds.includes(`${baseId}_${counter}`)) {
    counter++;
  }
  return `${baseId}_${counter}`;
}
function toPascalCase(str) {
  return str.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
}
function InstanceCard({ instance, onDelete }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full p-4 rounded-lg border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-200/30 transition-all group", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-base-content truncate font-mono text-sm", children: instance.id }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/50 mt-1 truncate", children: [
          instance.blueprintName ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary/70", children: instance.blueprintName }),
            /* @__PURE__ */ jsx("span", { className: "text-base-content/30 mx-1", children: "•" })
          ] }) : null,
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs", children: [
            instance.module,
            ".",
            instance.class
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
        instance.blueprintId ? /* @__PURE__ */ jsx(
          Link,
          {
            to: `/instances/${instance.id}/edit`,
            className: "btn btn-ghost btn-xs",
            title: "Edit instance",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                className: "h-4 w-4",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  }
                )
              }
            )
          }
        ) : null,
        onDelete && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onDelete(instance.id),
            className: "btn btn-ghost btn-xs text-error hover:bg-error/10",
            title: "Delete instance",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                className: "h-4 w-4",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  }
                )
              }
            )
          }
        )
      ] })
    ] }),
    instance.tags && instance.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: instance.tags.map((tag) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "px-1.5 py-0.5 rounded bg-base-200 text-base-content/60 text-[10px]",
        children: tag
      },
      tag
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-2 mt-3 text-xs text-base-content/40", children: [
      instance.category && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-medium", children: instance.category }),
      instance.blueprintId ? /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 truncate max-w-full", children: instance.blueprintId }) : /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-base-200 text-base-content/60", children: "manual" }),
      /* @__PURE__ */ jsxs("span", { children: [
        instance.configCount,
        " settings"
      ] })
    ] })
  ] });
}
function InstanceList({ instances, onDelete }) {
  if (instances.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12 px-4", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-lg bg-base-200 mb-4", children: /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6 text-base-content/40",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("h3", { className: "text-base font-medium mb-1", children: "No app instances found" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/50 max-w-sm mx-auto mb-4", children: [
        "Create your first app instance from a blueprint, or add apps directly to your",
        " ",
        /* @__PURE__ */ jsx("code", { className: "text-xs bg-base-200 px-1 py-0.5 rounded", children: "apps.yaml" }),
        " file."
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "btn btn-primary btn-sm", children: "Browse Blueprints" })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: instances.map((instance) => /* @__PURE__ */ jsx(InstanceCard, { instance, onDelete }, instance.id)) });
}
function DeleteConfirmModal({
  isOpen,
  instanceId,
  onConfirm,
  onCancel,
  isDeleting = false
}) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxs(
    "dialog",
    {
      ref: dialogRef,
      className: "modal",
      onClose: onCancel,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "modal-box max-w-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-full bg-error/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                className: "h-5 w-5 text-error",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base", children: "Delete Instance" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "This action cannot be undone" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/80 mb-4", children: [
            "Are you sure you want to delete",
            " ",
            /* @__PURE__ */ jsx("code", { className: "bg-base-200 px-1.5 py-0.5 rounded font-mono text-xs", children: instanceId }),
            "? This will remove the configuration from your apps.yaml file."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "modal-action", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-ghost btn-sm",
                onClick: onCancel,
                disabled: isDeleting,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-error btn-sm",
                onClick: onConfirm,
                disabled: isDeleting,
                children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
                  "Deleting..."
                ] }) : "Delete"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("form", { method: "dialog", className: "modal-backdrop", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: onCancel, children: "close" }) })
      ]
    }
  );
}
function meta$4({}) {
  return [{
    title: "Instances | AppDaemon Configurator"
  }, {
    name: "description",
    content: "Manage your configured app instances"
  }];
}
async function loader$6({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  if (!settings2?.appdaemonPath && !isAddonMode()) {
    return {
      instances: [],
      needsSettings: true,
      categories: []
    };
  }
  try {
    const instances = await getAppInstances(settings2?.appdaemonPath || "/share/appdaemon/apps");
    const categories = settings2?.categories ?? [];
    return {
      instances,
      needsSettings: false,
      categories
    };
  } catch (error) {
    console.error("Failed to load instances:", error);
    return {
      instances: [],
      needsSettings: false,
      error: "Failed to load instances",
      categories: []
    };
  }
}
async function action$5({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  if (!settings2?.appdaemonPath) {
    return {
      error: "AppDaemon path not configured"
    };
  }
  const formData = await request.formData();
  const intent = formData.get("intent");
  const instanceId = formData.get("instanceId");
  if (intent === "delete" && instanceId) {
    try {
      await deleteAppInstance(settings2.appdaemonPath, instanceId);
      return {
        success: true
      };
    } catch (error) {
      return {
        error: `Failed to delete instance: ${error.message}`
      };
    }
  }
  return {
    error: "Invalid action"
  };
}
const instances__index = UNSAFE_withComponentProps(function Instances({
  loaderData
}) {
  const {
    instances,
    needsSettings,
    error,
    categories
  } = loaderData;
  const fetcher = useFetcher();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const handleDelete = (instanceId) => {
    setDeleteTarget(instanceId);
  };
  const confirmDelete = () => {
    if (deleteTarget) {
      fetcher.submit({
        intent: "delete",
        instanceId: deleteTarget
      }, {
        method: "POST"
      });
    }
  };
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setDeleteTarget(null);
    }
  }, [fetcher.state, fetcher.data]);
  const allTags = useMemo(() => {
    const tags = /* @__PURE__ */ new Set();
    instances.forEach((instance) => {
      instance.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [instances]);
  const filteredInstances = useMemo(() => {
    return instances.filter((instance) => {
      if (categoryFilter) {
        if (categoryFilter === "__none__") {
          if (instance.category) return false;
        } else if (instance.category !== categoryFilter) {
          return false;
        }
      }
      if (tagFilter) {
        if (!instance.tags?.includes(tagFilter)) return false;
      }
      return true;
    });
  }, [instances, categoryFilter, tagFilter]);
  const instanceCategories = useMemo(() => {
    const cats = new Set(categories);
    instances.forEach((instance) => {
      if (instance.category) cats.add(instance.category);
    });
    return Array.from(cats).sort();
  }, [instances, categories]);
  if (needsSettings) {
    return /* @__PURE__ */ jsxs("div", {
      className: "max-w-6xl mx-auto px-4 py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-6",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-xl font-semibold",
          children: "App Instances"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-base-content/50 mt-1",
          children: "Manage your configured AppDaemon apps"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-lg border border-warning/30 bg-warning/5 p-6 text-center",
        children: [/* @__PURE__ */ jsx("div", {
          className: "inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 mb-4",
          children: /* @__PURE__ */ jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-6 w-6 text-warning",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            })
          })
        }), /* @__PURE__ */ jsx("h3", {
          className: "text-base font-medium mb-2",
          children: "AppDaemon Path Required"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-base-content/60 mb-4",
          children: "Configure your AppDaemon apps folder path in settings to view and manage instances."
        }), /* @__PURE__ */ jsx(Link, {
          to: "/settings",
          className: "btn btn-warning btn-sm",
          children: "Go to Settings"
        })]
      })]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-6xl mx-auto px-4 py-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between mb-6",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-xl font-semibold",
          children: "App Instances"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-base-content/50 mt-1",
          children: "Manage your configured AppDaemon apps"
        })]
      }), /* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "btn btn-primary btn-sm",
        children: [/* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-4 w-4 mr-1",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 4v16m8-8H4"
          })
        }), "New Instance"]
      })]
    }), error && /* @__PURE__ */ jsx("div", {
      className: "mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm",
      children: error
    }), fetcher.data?.error && /* @__PURE__ */ jsx("div", {
      className: "mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm",
      children: fetcher.data.error
    }), instances.length > 0 && /* @__PURE__ */ jsxs("div", {
      className: "mb-4 flex flex-wrap gap-3 items-center p-3 rounded-lg border border-base-300 bg-base-100",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-2",
        children: [/* @__PURE__ */ jsx("label", {
          className: "text-sm text-base-content/70",
          children: "Category:"
        }), /* @__PURE__ */ jsxs("select", {
          value: categoryFilter,
          onChange: (e) => setCategoryFilter(e.target.value),
          className: "select select-bordered select-sm bg-base-200 border-base-300 min-w-[140px]",
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            children: "All"
          }), /* @__PURE__ */ jsx("option", {
            value: "__none__",
            children: "Uncategorized"
          }), instanceCategories.map((cat) => /* @__PURE__ */ jsx("option", {
            value: cat,
            children: cat
          }, cat))]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-2",
        children: [/* @__PURE__ */ jsx("label", {
          className: "text-sm text-base-content/70",
          children: "Tag:"
        }), /* @__PURE__ */ jsxs("select", {
          value: tagFilter,
          onChange: (e) => setTagFilter(e.target.value),
          className: "select select-bordered select-sm bg-base-200 border-base-300 min-w-[140px]",
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            children: "All"
          }), allTags.map((tag) => /* @__PURE__ */ jsx("option", {
            value: tag,
            children: tag
          }, tag))]
        })]
      }), (categoryFilter || tagFilter) && /* @__PURE__ */ jsx("button", {
        onClick: () => {
          setCategoryFilter("");
          setTagFilter("");
        },
        className: "btn btn-ghost btn-xs text-base-content/60",
        children: "Clear filters"
      }), /* @__PURE__ */ jsx("div", {
        className: "flex-1"
      }), /* @__PURE__ */ jsxs("span", {
        className: "text-xs text-base-content/50",
        children: [filteredInstances.length, " of ", instances.length, " instances"]
      })]
    }), /* @__PURE__ */ jsx(InstanceList, {
      instances: filteredInstances,
      onDelete: handleDelete
    }), /* @__PURE__ */ jsx(DeleteConfirmModal, {
      isOpen: !!deleteTarget,
      instanceId: deleteTarget ?? "",
      onConfirm: confirmDelete,
      onCancel: () => setDeleteTarget(null),
      isDeleting: fetcher.state === "submitting"
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: instances__index,
  loader: loader$6,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function getSelectorType(selector) {
  if (!selector) return void 0;
  return Object.keys(selector)[0];
}
function isEntitySelector(selector) {
  return "entity" in selector;
}
function isNumberSelector(selector) {
  return "number" in selector;
}
function isTextSelector(selector) {
  return "text" in selector;
}
function isBooleanSelector(selector) {
  return "boolean" in selector;
}
function isSelectSelector(selector) {
  return "select" in selector;
}
function isNotificationSelector(selector) {
  return "notify" in selector;
}
function isSection(item) {
  return "input" in item;
}
function flattenInputs(inputs) {
  let flat = {};
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
function EntityInput({
  name,
  label,
  description,
  domain,
  required,
  register,
  errors
}) {
  const domainHint = Array.isArray(domain) ? domain.join(", ") : domain;
  const error = errors?.[name];
  const rootData = useRouteLoaderData("root");
  const basename2 = rootData?.basename === "/" ? "" : rootData?.basename || "";
  const effectiveBasename = basename2 || (typeof window !== "undefined" ? window.BASENAME : "") || "";
  useEffect(() => {
    console.log("[EntityInput] Mounted", { name, basename: basename2, effectiveBasename, rootData });
  }, [name, basename2, effectiveBasename, rootData]);
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const { ref: inputRef, ...restRegister } = register(name, { required });
  const buildFetchUrl = () => {
    const params = new URLSearchParams();
    if (domain) {
      const domains = Array.isArray(domain) ? domain : [domain];
      params.append("domain", domains.join(","));
    }
    const url = `${effectiveBasename}/api/entities?${params.toString()}`;
    console.log("[EntityInput] Built URL:", url);
    return url;
  };
  const fetchEntities = async () => {
    console.log("[EntityInput] fetchEntities called", { isLoading, hasFetched });
    if (isLoading) return;
    setIsLoading(true);
    try {
      const url = buildFetchUrl();
      console.log("[EntityInput] Fetching:", url);
      const response = await fetch(url);
      console.log("[EntityInput] Response status:", response.status);
      if (response.ok) {
        const data2 = await response.json();
        console.log("[EntityInput] Data received:", data2);
        if (data2.entities) {
          setEntities(data2.entities);
          setSuggestions(data2.entities);
          if (!hasFetched) {
            setShowSuggestions(true);
          }
        }
      } else {
        console.error("Failed to fetch entities:", response.status);
      }
    } catch (e) {
      console.error("Error fetching entities:", e);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };
  useEffect(() => {
    if (entities.length > 0) {
      const filtered = entities.filter(
        (s) => s.value.toLowerCase().includes(filter.toLowerCase()) || s.label.toLowerCase().includes(filter.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [filter, entities]);
  const filteredSuggestions = suggestions;
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSuggestions.length]);
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);
  const selectSuggestion = (suggestion) => {
    const input = document.getElementById(name);
    if (input) {
      input.value = suggestion.value;
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);
      setFilter(suggestion.value);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowSuggestions(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 relative", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          id: name,
          autoComplete: "off",
          placeholder: domainHint ? `${domainHint}.entity_id` : "entity_id",
          className: `input input-bordered input-sm flex-1 font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`,
          ...restRegister,
          ref: (e) => {
            inputRef(e);
          },
          onChange: (e) => {
            restRegister.onChange(e);
            setFilter(e.target.value);
            setShowSuggestions(true);
          },
          onKeyDown: handleKeyDown,
          onFocus: () => {
            if (!hasFetched) {
              fetchEntities();
            }
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          },
          onBlur: (e) => {
            restRegister.onBlur(e);
            setTimeout(() => setShowSuggestions(false), 200);
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => {
            fetchEntities();
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          },
          className: `btn btn-sm btn-ghost ml-1 ${isLoading ? "loading" : ""}`,
          title: "Refresh entities from Home Assistant",
          children: !isLoading ? /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                }
              )
            }
          ) : null
        }
      ),
      showSuggestions && filteredSuggestions.length > 0 && /* @__PURE__ */ jsx(
        "ul",
        {
          ref: listRef,
          className: "absolute z-50 top-full left-0 right-12 mt-1 max-h-60 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-lg",
          children: filteredSuggestions.map((s, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            /* @__PURE__ */ jsxs(
              "li",
              {
                ref: (el) => {
                  itemRefs.current[index] = el;
                },
                className: `px-3 py-2 text-sm cursor-pointer flex flex-col ${index === selectedIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"}`,
                onMouseDown: (e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                },
                onMouseEnter: () => setSelectedIndex(index),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: s.label }),
                  /* @__PURE__ */ jsx("span", { className: `text-xs font-mono ${index === selectedIndex ? "text-primary-content/70" : "text-base-content/50"}`, children: s.value })
                ]
              },
              s.value
            )
          ))
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message || "This field is required" }),
    description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
  ] });
}
function NumberInput({
  name,
  label,
  description,
  min,
  max,
  step = 1,
  unit,
  mode = "box",
  required,
  control,
  errors,
  defaultValue
}) {
  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue ?? min ?? 0
  });
  const [inputValue, setInputValue] = useState(
    field.value?.toString() ?? (min ?? 0).toString()
  );
  useEffect(() => {
    if (field.value !== void 0 && field.value !== null && Number(inputValue) !== field.value) {
      setInputValue(field.value.toString());
    }
  }, [field.value]);
  const error = errors?.[name];
  const handleSliderChange = (e) => {
    const newVal = Number(e.target.value);
    setInputValue(newVal.toString());
    field.onChange(newVal);
  };
  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    if (newVal === "" || newVal === "-") {
      return;
    }
    const parsed = parseFloat(newVal);
    if (!isNaN(parsed)) {
      field.onChange(parsed);
    }
  };
  const handleBlur = () => {
    if (inputValue === "" || inputValue === "-") {
      const fallback = min ?? 0;
      setInputValue(fallback.toString());
      field.onChange(fallback);
    } else {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        let final = parsed;
        if (min !== void 0 && final < min) final = min;
        if (max !== void 0 && final > max) final = max;
        setInputValue(final.toString());
        field.onChange(final);
      }
    }
    field.onBlur();
  };
  if (mode === "slider") {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
          label,
          required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-mono text-base-content/70", children: [
          field.value,
          unit && /* @__PURE__ */ jsx("span", { className: "text-base-content/50 ml-0.5", children: unit })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          id: name,
          min,
          max,
          step,
          value: field.value ?? min ?? 0,
          onChange: handleSliderChange,
          className: "range range-sm range-primary"
        }
      ),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message }),
      description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          id: name,
          value: inputValue,
          onChange: handleInputChange,
          onBlur: handleBlur,
          className: `input input-bordered input-sm w-32 font-mono bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`
        }
      ),
      unit && /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/50", children: unit })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message }),
    description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
  ] });
}
function TextInput({
  name,
  label,
  description,
  multiline = false,
  type = "text",
  placeholder,
  required,
  register,
  errors
}) {
  const error = errors?.[name];
  if (multiline) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
        label,
        required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: name,
          placeholder,
          rows: 4,
          className: `textarea textarea-bordered textarea-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary resize-y ${error ? "textarea-error" : ""}`,
          ...register(name, { required })
        }
      ),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message || "This field is required" }),
      description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type,
        id: name,
        placeholder,
        className: `input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`,
        ...register(name, { required })
      }
    ),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message || "This field is required" }),
    description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
  ] });
}
function BooleanInput({
  name,
  label,
  description,
  control,
  defaultValue = false
}) {
  const { field } = useController({
    name,
    control,
    defaultValue
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          id: name,
          checked: field.value ?? false,
          onChange: (e) => field.onChange(e.target.checked),
          className: "checkbox checkbox-sm checkbox-primary"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-base-content", children: label })
    ] }),
    description && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50 ml-7", children: description })
  ] });
}
function SelectInput({
  name,
  label,
  description,
  options,
  required,
  register,
  errors
}) {
  const error = errors?.[name];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs(
      "select",
      {
        id: name,
        className: `select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary ${error ? "select-error" : ""}`,
        ...register(name, { required }),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
          options.map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return /* @__PURE__ */ jsx("option", { value: optionValue, children: optionLabel }, optionValue);
          })
        ]
      }
    ),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message || "This field is required" }),
    description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
  ] });
}
function NotificationInput({
  name,
  label,
  description,
  required,
  register,
  errors
}) {
  const error = errors?.[name];
  const rootData = useRouteLoaderData("root");
  const basename2 = rootData?.basename === "/" ? "" : rootData?.basename || "";
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const { ref: inputRef, ...restRegister } = register(name, { required });
  const fetchServices = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`${basename2}/api/notify-services`);
      if (response.ok) {
        const data2 = await response.json();
        if (data2.services) {
          setServices(data2.services);
          setSuggestions(data2.services);
          if (!hasFetched) {
            setShowSuggestions(true);
          }
        } else if (data2.error) {
          console.error("Error fetching notification services:", data2.error);
          setFetchError(data2.error);
          setSuggestions([]);
        }
      } else {
        console.error("Failed to fetch notification services:", response.status);
        setFetchError(`Failed to fetch: ${response.status}`);
      }
    } catch (e) {
      console.error("Error fetching notification services:", e);
      setFetchError("Network error");
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };
  useEffect(() => {
    const filtered = services.filter(
      (s) => s.value.toLowerCase().includes(filter.toLowerCase()) || s.label.toLowerCase().includes(filter.toLowerCase())
    );
    setSuggestions(filtered);
  }, [filter, services]);
  const filteredSuggestions = suggestions;
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSuggestions.length]);
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);
  const selectSuggestion = (suggestion) => {
    const input = document.getElementById(name);
    if (input) {
      input.value = suggestion.value;
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);
      setFilter(suggestion.value);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowSuggestions(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 relative", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "block text-sm font-medium text-base-content", children: [
      label,
      required && /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          id: name,
          autoComplete: "off",
          placeholder: "notify.mobile_app_phone",
          className: `input input-bordered input-sm flex-1 font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`,
          ...restRegister,
          ref: (e) => {
            inputRef(e);
          },
          onChange: (e) => {
            restRegister.onChange(e);
            setFilter(e.target.value);
            setShowSuggestions(true);
          },
          onKeyDown: handleKeyDown,
          onFocus: () => {
            if (!hasFetched) {
              fetchServices();
            }
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          },
          onBlur: (e) => {
            restRegister.onBlur(e);
            setTimeout(() => setShowSuggestions(false), 200);
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => {
            fetchServices();
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          },
          className: `btn btn-sm btn-ghost ml-1 ${isLoading ? "loading" : ""}`,
          title: "Refresh notification services from Home Assistant",
          children: !isLoading ? /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                }
              )
            }
          ) : null
        }
      ),
      showSuggestions && filteredSuggestions.length > 0 && /* @__PURE__ */ jsx(
        "ul",
        {
          ref: listRef,
          className: "absolute z-50 top-full left-0 right-12 mt-1 max-h-60 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-lg",
          children: filteredSuggestions.map((s, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            /* @__PURE__ */ jsxs(
              "li",
              {
                ref: (el) => {
                  itemRefs.current[index] = el;
                },
                className: `px-3 py-2 text-sm cursor-pointer flex flex-col ${index === selectedIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"}`,
                onMouseDown: (e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                },
                onMouseEnter: () => setSelectedIndex(index),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: s.label }),
                  /* @__PURE__ */ jsx("span", { className: `text-xs font-mono ${index === selectedIndex ? "text-primary-content/70" : "text-base-content/50"}`, children: s.value })
                ]
              },
              s.value
            )
          ))
        }
      ),
      showSuggestions && !isLoading && !fetchError && suggestions.length === 0 && /* @__PURE__ */ jsx("div", { className: "absolute z-50 top-full left-0 right-12 mt-1 p-3 bg-base-100 border border-base-300 rounded-lg shadow-lg text-sm text-base-content/60", children: "No notification services found" }),
      fetchError && /* @__PURE__ */ jsx("div", { className: "absolute z-50 top-full left-0 right-12 mt-1 p-3 bg-error/10 border border-error rounded-lg shadow-lg text-sm text-error", children: fetchError })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: error.message || "This field is required" }),
    description && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: description })
  ] });
}
function ConfigureForm({
  blueprint,
  blueprintId,
  defaultInstanceName,
  isEditing = false,
  availableCategories = []
}) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const actionData = useActionData();
  const navigate = useNavigate();
  useEffect(() => {
    if (actionData?.success) {
      navigate("/");
    }
  }, [actionData, navigate]);
  const defaultValues = {
    _instanceName: defaultInstanceName || blueprintId.replace(/-/g, "_")
  };
  const flatInputs = flattenInputs(blueprint.input);
  for (const [key, input] of Object.entries(flatInputs)) {
    if (input.default !== void 0) {
      defaultValues[key] = input.default;
    }
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useRemixForm({
    defaultValues,
    submitConfig: {
      method: "POST"
    }
  });
  useEffect(() => {
    reset(defaultValues);
  }, [blueprintId, reset]);
  return /* @__PURE__ */ jsxs(Form, { method: "post", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "blueprintId", value: blueprintId }),
    /* @__PURE__ */ jsx("div", { className: "pb-4 mb-4 border-b border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: "_instanceName", className: "block text-sm font-medium text-base-content", children: [
        "Instance Name",
        /* @__PURE__ */ jsx("span", { className: "text-error ml-1", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          id: "_instanceName",
          placeholder: blueprintId.replace(/-/g, "_"),
          className: `input input-bordered input-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${errors._instanceName ? "input-error" : ""}`,
          ...register("_instanceName", {
            required: "Instance name is required",
            pattern: {
              value: /^[a-z][a-z0-9_]*$/,
              message: "Must start with letter, use only lowercase letters, numbers, and underscores"
            }
          })
        }
      ),
      errors._instanceName ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: errors._instanceName.message }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Unique identifier for this app instance in apps.yaml" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "pb-4 mb-4 border-b border-base-300 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "_category", className: "block text-sm font-medium text-base-content", children: "Category" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "_category",
            className: "select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary",
            ...register("_category"),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "No category" }),
              availableCategories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Organize instances by category (configure in Settings)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-base-content", children: "Tags" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: newTag,
              onChange: (e) => setNewTag(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newTag.trim() && !tags.includes(newTag.trim())) {
                    setTags([...tags, newTag.trim()]);
                    setNewTag("");
                  }
                }
              },
              placeholder: "Add tag...",
              className: "input input-bordered input-sm flex-1 bg-base-200 border-base-300 focus:border-primary"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-ghost",
              onClick: () => {
                if (newTag.trim() && !tags.includes(newTag.trim())) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              },
              children: "Add"
            }
          )
        ] }),
        tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: tags.map((tag) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-base-200 text-base-content/70 text-xs",
            children: [
              tag,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setTags(tags.filter((t) => t !== tag)),
                  className: "hover:bg-base-300 rounded-full p-0.5",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "h-3 w-3",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        }
                      )
                    }
                  )
                }
              )
            ]
          },
          tag
        )) }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_tags", value: JSON.stringify(tags) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Free-form tags for filtering and organization" })
      ] })
    ] }),
    actionData?.error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm", children: actionData.error }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-base-300", children: blueprint.input && Object.entries(blueprint.input).map(([key, input]) => /* @__PURE__ */ jsx(
      ConfigItem,
      {
        itemKey: key,
        item: input,
        register,
        control,
        errors
      },
      key
    )) }),
    !blueprint.input && /* @__PURE__ */ jsx("div", { className: "py-8 text-center text-base-content/50", children: "No configuration options available for this blueprint." }),
    /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-base-300", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-primary btn-sm",
        disabled: isSubmitting,
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
          "Saving..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          "Save Configuration",
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M9 5l7 7-7 7"
                }
              )
            }
          )
        ] })
      }
    ) })
  ] });
}
function ConfigItem({ itemKey, item, register, control, errors }) {
  if (isSection(item)) {
    return /* @__PURE__ */ jsx("div", { className: "py-4 first:pt-0 last:pb-0", children: /* @__PURE__ */ jsxs("details", { className: "group collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg", children: [
      /* @__PURE__ */ jsxs("summary", { className: "collapse-title text-base font-medium", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          item.icon && /* @__PURE__ */ jsx("span", { className: `mdi ${item.icon}` }),
          item.name
        ] }),
        item.description && /* @__PURE__ */ jsx("div", { className: "text-xs font-normal text-base-content/60 mt-0.5", children: item.description })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "collapse-content", children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-base-300", children: Object.entries(item.input).map(([key, input]) => /* @__PURE__ */ jsx(
        ConfigItem,
        {
          itemKey: key,
          item: input,
          register,
          control,
          errors
        },
        key
      )) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "py-4 first:pt-0 last:pb-0", children: /* @__PURE__ */ jsx(
    InputField,
    {
      inputKey: itemKey,
      input: item,
      register,
      control,
      errors
    }
  ) });
}
function InputField({ inputKey, input, register, control, errors }) {
  const selector = input.selector;
  if (!selector) {
    return /* @__PURE__ */ jsx(
      TextInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        register,
        errors
      }
    );
  }
  if (isEntitySelector(selector)) {
    return /* @__PURE__ */ jsx(
      EntityInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        register,
        errors,
        domain: selector.entity.domain,
        deviceClass: selector.entity.device_class,
        multiple: selector.entity.multiple
      }
    );
  }
  if (isNumberSelector(selector)) {
    return /* @__PURE__ */ jsx(
      NumberInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        control,
        errors,
        min: selector.number.min,
        max: selector.number.max,
        step: selector.number.step,
        unit: selector.number.unit_of_measurement,
        mode: selector.number.mode,
        defaultValue: input.default
      }
    );
  }
  if (isTextSelector(selector)) {
    return /* @__PURE__ */ jsx(
      TextInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        register,
        errors,
        multiline: selector.text.multiline,
        type: selector.text.type
      }
    );
  }
  if (isBooleanSelector(selector)) {
    return /* @__PURE__ */ jsx(
      BooleanInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        control,
        defaultValue: input.default
      }
    );
  }
  if (isSelectSelector(selector)) {
    return /* @__PURE__ */ jsx(
      SelectInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        register,
        errors,
        options: selector.select.options,
        multiple: selector.select.multiple
      }
    );
  }
  if (isNotificationSelector(selector)) {
    return /* @__PURE__ */ jsx(
      NotificationInput,
      {
        name: inputKey,
        label: input.name,
        description: input.description,
        register,
        errors
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-base-content", children: [
      input.name,
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-warning ml-2", children: [
        "(unsupported: ",
        getSelectorType(selector),
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        className: "input input-bordered input-sm w-full bg-base-200 border-base-300",
        ...register(inputKey)
      }
    ),
    input.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: input.description })
  ] });
}
function meta$3({
  data: data2
}) {
  const instanceId = data2?.instance?.id ?? "Edit Instance";
  return [{
    title: `Edit ${instanceId} | AppDaemon Configurator`
  }, {
    name: "description",
    content: `Edit app instance ${instanceId}`
  }];
}
async function loader$5({
  params,
  request
}) {
  const {
    instanceId
  } = params;
  if (!instanceId) {
    throw new Response("Instance ID is required", {
      status: 400
    });
  }
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const appdaemonPath = settings2?.appdaemonPath || (isAddonMode() ? "/share/appdaemon/apps" : null);
  if (!appdaemonPath) {
    throw new Response("AppDaemon path not configured", {
      status: 400
    });
  }
  const instance = await getAppInstance(appdaemonPath, instanceId);
  if (!instance) {
    throw new Response("Instance not found", {
      status: 404
    });
  }
  let blueprint = null;
  if (instance._blueprint) {
    blueprint = await getBlueprint(instance._blueprint, appdaemonPath);
  }
  const categories = settings2?.categories ?? [];
  return {
    instance,
    blueprint,
    categories
  };
}
async function action$4({
  request,
  params
}) {
  const {
    instanceId
  } = params;
  if (!instanceId) {
    throw new Response("Instance ID is required", {
      status: 400
    });
  }
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const appdaemonPath = settings2?.appdaemonPath || (isAddonMode() ? "/share/appdaemon/apps" : null);
  if (!appdaemonPath) {
    throw new Response("AppDaemon path not configured", {
      status: 400
    });
  }
  const instance = await getAppInstance(appdaemonPath, instanceId);
  if (!instance) {
    throw new Response("Instance not found", {
      status: 404
    });
  }
  const formData = await request.formData();
  const data2 = Object.fromEntries(formData);
  const {
    blueprintId: _,
    _instanceName,
    _category,
    _tags,
    ...values
  } = data2;
  const newInstanceName = stripQuotes(_instanceName) || instanceId;
  const category = stripQuotes(_category) || void 0;
  let tags = [];
  try {
    const tagsRaw = _tags;
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    tags = [];
  }
  let blueprint = null;
  if (instance._blueprint) {
    blueprint = await getBlueprint(instance._blueprint, appdaemonPath);
  }
  const typedValues = {};
  if (blueprint) {
    const flatInputs = flattenInputs(blueprint.input);
    for (const [key, value] of Object.entries(values)) {
      const inputDef = flatInputs[key];
      const strValue = stripQuotes(value);
      if (!inputDef?.selector) {
        typedValues[key] = strValue;
        continue;
      }
      const selector = inputDef.selector;
      if ("number" in selector) {
        typedValues[key] = Number(strValue);
      } else if ("boolean" in selector) {
        typedValues[key] = strValue === "true" || strValue === "on";
      } else {
        typedValues[key] = strValue;
      }
    }
  } else {
    for (const [key, value] of Object.entries(values)) {
      typedValues[key] = stripQuotes(value);
    }
  }
  try {
    await updateAppInstance(appdaemonPath, instanceId, typedValues, newInstanceName, category, tags);
    return redirect("/instances");
  } catch (error) {
    throw new Response(`Failed to update instance: ${error.message}`, {
      status: 500
    });
  }
}
const instances_$instanceId_edit = UNSAFE_withComponentProps(function EditInstance({
  loaderData
}) {
  const {
    instance,
    blueprint,
    categories
  } = loaderData;
  if (!blueprint) {
    return /* @__PURE__ */ jsxs("div", {
      className: "max-w-2xl mx-auto px-4 py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2 text-sm text-base-content/50 mb-2",
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/instances",
            className: "hover:text-base-content",
            children: "Instances"
          }), /* @__PURE__ */ jsx("span", {
            children: "/"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-base-content font-mono",
            children: instance.id
          })]
        }), /* @__PURE__ */ jsx("h1", {
          className: "text-xl font-semibold",
          children: "Edit Instance"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-lg border border-warning/30 bg-warning/5 p-6 text-center",
        children: [/* @__PURE__ */ jsx("div", {
          className: "inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 mb-4",
          children: /* @__PURE__ */ jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-6 w-6 text-warning",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            })
          })
        }), /* @__PURE__ */ jsx("h3", {
          className: "text-base font-medium mb-2",
          children: "No Blueprint Found"
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-sm text-base-content/60 mb-4",
          children: ["This instance was not created with a blueprint (no ", /* @__PURE__ */ jsx("code", {
            className: "text-xs bg-base-200 px-1 py-0.5 rounded",
            children: "_blueprint"
          }), " field). Edit the ", /* @__PURE__ */ jsx("code", {
            className: "text-xs bg-base-200 px-1 py-0.5 rounded",
            children: "apps.yaml"
          }), " file directly to modify this instance."]
        }), /* @__PURE__ */ jsx(Link, {
          to: "/instances",
          className: "btn btn-ghost btn-sm",
          children: "Back to Instances"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-6 p-4 rounded-lg border border-base-300 bg-base-100",
        children: [/* @__PURE__ */ jsx("h4", {
          className: "text-sm font-medium mb-2",
          children: "Current Configuration"
        }), /* @__PURE__ */ jsx("pre", {
          className: "text-xs font-mono bg-base-200 p-3 rounded overflow-x-auto",
          children: JSON.stringify(instance.config, null, 2)
        })]
      })]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-2xl mx-auto px-4 py-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-6",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-2 text-sm text-base-content/50 mb-2",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/instances",
          className: "hover:text-base-content",
          children: "Instances"
        }), /* @__PURE__ */ jsx("span", {
          children: "/"
        }), /* @__PURE__ */ jsx("span", {
          className: "text-base-content font-mono",
          children: instance.id
        })]
      }), /* @__PURE__ */ jsxs("h1", {
        className: "text-xl font-semibold",
        children: ["Edit ", instance.id]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-base-content/50 mt-1",
        children: blueprint.blueprint.description
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "rounded-lg border border-base-300 bg-base-100 p-4",
      children: /* @__PURE__ */ jsx(ConfigureFormWithValues, {
        blueprint,
        blueprintId: instance._blueprint,
        instanceId: instance.id,
        existingValues: instance.config,
        availableCategories: categories,
        currentCategory: instance._category,
        currentTags: instance._tags
      })
    })]
  });
});
function ConfigureFormWithValues({
  blueprint,
  blueprintId,
  instanceId,
  existingValues,
  availableCategories,
  currentCategory,
  currentTags
}) {
  const [tags, setTags] = useState(currentTags ?? []);
  const [newTag, setNewTag] = useState("");
  const defaultValues = {
    _instanceName: instanceId
  };
  const flatInputs = flattenInputs(blueprint.input);
  for (const [key, input] of Object.entries(flatInputs)) {
    if (existingValues[key] !== void 0) {
      defaultValues[key] = existingValues[key];
    } else if (input.default !== void 0) {
      defaultValues[key] = input.default;
    }
  }
  const {
    register,
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    },
    reset
  } = useRemixForm({
    defaultValues,
    submitConfig: {
      method: "POST"
    }
  });
  useEffect(() => {
    reset(defaultValues);
  }, [blueprintId, reset]);
  return /* @__PURE__ */ jsxs(Form, {
    method: "post",
    onSubmit: handleSubmit,
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "blueprintId",
      value: blueprintId
    }), /* @__PURE__ */ jsx("div", {
      className: "pb-4 mb-4 border-b border-base-300",
      children: /* @__PURE__ */ jsxs("div", {
        className: "space-y-1.5",
        children: [/* @__PURE__ */ jsxs("label", {
          htmlFor: "_instanceName",
          className: "block text-sm font-medium text-base-content",
          children: ["Instance Name", /* @__PURE__ */ jsx("span", {
            className: "text-error ml-1",
            children: "*"
          })]
        }), /* @__PURE__ */ jsx("input", {
          type: "text",
          id: "_instanceName",
          placeholder: blueprintId.replace(/-/g, "_"),
          className: `input input-bordered input-sm w-full font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${errors._instanceName ? "input-error" : ""}`,
          ...register("_instanceName", {
            required: "Instance name is required",
            pattern: {
              value: /^[a-z][a-z0-9_]*$/,
              message: "Must start with letter, use only lowercase letters, numbers, and underscores"
            }
          })
        }), errors._instanceName ? /* @__PURE__ */ jsx("p", {
          className: "text-xs text-error",
          children: errors._instanceName.message
        }) : /* @__PURE__ */ jsx("p", {
          className: "text-xs text-base-content/50",
          children: "Unique identifier for this app instance in apps.yaml"
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "pb-4 mb-4 border-b border-base-300 space-y-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "space-y-1.5",
        children: [/* @__PURE__ */ jsx("label", {
          htmlFor: "_category",
          className: "block text-sm font-medium text-base-content",
          children: "Category"
        }), /* @__PURE__ */ jsxs("select", {
          id: "_category",
          className: "select select-bordered select-sm w-full bg-base-200 border-base-300 focus:border-primary",
          defaultValue: currentCategory ?? "",
          ...register("_category"),
          children: [/* @__PURE__ */ jsx("option", {
            value: "",
            children: "No category"
          }), availableCategories.map((cat) => /* @__PURE__ */ jsx("option", {
            value: cat,
            children: cat
          }, cat))]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs text-base-content/50",
          children: "Organize instances by category (configure in Settings)"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-1.5",
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-base-content",
          children: "Tags"
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex gap-2",
          children: [/* @__PURE__ */ jsx("input", {
            type: "text",
            value: newTag,
            onChange: (e) => setNewTag(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newTag.trim() && !tags.includes(newTag.trim())) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }
            },
            placeholder: "Add tag...",
            className: "input input-bordered input-sm flex-1 bg-base-200 border-base-300 focus:border-primary"
          }), /* @__PURE__ */ jsx("button", {
            type: "button",
            className: "btn btn-sm btn-ghost",
            onClick: () => {
              if (newTag.trim() && !tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
                setNewTag("");
              }
            },
            children: "Add"
          })]
        }), tags.length > 0 && /* @__PURE__ */ jsx("div", {
          className: "flex flex-wrap gap-1.5 mt-2",
          children: tags.map((tag) => /* @__PURE__ */ jsxs("span", {
            className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-base-200 text-base-content/70 text-xs",
            children: [tag, /* @__PURE__ */ jsx("button", {
              type: "button",
              onClick: () => setTags(tags.filter((t) => t !== tag)),
              className: "hover:bg-base-300 rounded-full p-0.5",
              children: /* @__PURE__ */ jsx("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                className: "h-3 w-3",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                })
              })
            })]
          }, tag))
        }), /* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "_tags",
          value: JSON.stringify(tags)
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs text-base-content/50",
          children: "Free-form tags for filtering and organization"
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "divide-y divide-base-300",
      children: blueprint.input && Object.entries(blueprint.input).map(([key, input]) => /* @__PURE__ */ jsx(ConfigItemEdit, {
        itemKey: key,
        item: input,
        register,
        control,
        errors
      }, key))
    }), !blueprint.input && /* @__PURE__ */ jsx("div", {
      className: "py-8 text-center text-base-content/50",
      children: "No configuration options available for this blueprint."
    }), /* @__PURE__ */ jsxs("div", {
      className: "pt-4 border-t border-base-300 flex gap-2",
      children: [/* @__PURE__ */ jsx("button", {
        type: "submit",
        className: "btn btn-primary btn-sm",
        disabled: isSubmitting,
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("span", {
            className: "loading loading-spinner loading-xs"
          }), "Saving..."]
        }) : /* @__PURE__ */ jsxs(Fragment, {
          children: ["Save Changes", /* @__PURE__ */ jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-4 w-4",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M5 13l4 4L19 7"
            })
          })]
        })
      }), /* @__PURE__ */ jsx(Link, {
        to: "/instances",
        className: "btn btn-ghost btn-sm",
        children: "Cancel"
      })]
    })]
  });
}
function ConfigItemEdit({
  itemKey,
  item,
  register,
  control,
  errors
}) {
  if (isSection(item)) {
    return /* @__PURE__ */ jsx("div", {
      className: "py-4 first:pt-0 last:pb-0",
      children: /* @__PURE__ */ jsxs("details", {
        className: "group collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg",
        children: [/* @__PURE__ */ jsxs("summary", {
          className: "collapse-title text-base font-medium",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [item.icon && /* @__PURE__ */ jsx("span", {
              className: `mdi ${item.icon}`
            }), item.name]
          }), item.description && /* @__PURE__ */ jsx("div", {
            className: "text-xs font-normal text-base-content/60 mt-0.5",
            children: item.description
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "collapse-content",
          children: /* @__PURE__ */ jsx("div", {
            className: "divide-y divide-base-300",
            children: Object.entries(item.input).map(([key, input]) => /* @__PURE__ */ jsx(ConfigItemEdit, {
              itemKey: key,
              item: input,
              register,
              control,
              errors
            }, key))
          })
        })]
      })
    });
  }
  return /* @__PURE__ */ jsx("div", {
    className: "py-4 first:pt-0 last:pb-0",
    children: /* @__PURE__ */ jsx(InputFieldEdit, {
      inputKey: itemKey,
      input: item,
      register,
      control,
      errors
    })
  });
}
function InputFieldEdit({
  inputKey,
  input,
  register,
  control,
  errors
}) {
  const selector = input.selector;
  if (!selector) {
    return /* @__PURE__ */ jsx(TextInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      register,
      errors
    });
  }
  if (isEntitySelector(selector)) {
    return /* @__PURE__ */ jsx(EntityInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      register,
      errors,
      domain: selector.entity.domain,
      deviceClass: selector.entity.device_class,
      multiple: selector.entity.multiple
    });
  }
  if (isNumberSelector(selector)) {
    return /* @__PURE__ */ jsx(NumberInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      control,
      errors,
      min: selector.number.min,
      max: selector.number.max,
      step: selector.number.step,
      unit: selector.number.unit_of_measurement,
      mode: selector.number.mode,
      defaultValue: input.default
    });
  }
  if (isTextSelector(selector)) {
    return /* @__PURE__ */ jsx(TextInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      register,
      errors,
      multiline: selector.text.multiline,
      type: selector.text.type
    });
  }
  if (isBooleanSelector(selector)) {
    return /* @__PURE__ */ jsx(BooleanInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      control,
      defaultValue: input.default
    });
  }
  if (isSelectSelector(selector)) {
    return /* @__PURE__ */ jsx(SelectInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      register,
      errors,
      options: selector.select.options,
      multiple: selector.select.multiple
    });
  }
  if (isNotificationSelector(selector)) {
    return /* @__PURE__ */ jsx(NotificationInput, {
      name: inputKey,
      label: input.name,
      description: input.description,
      register,
      errors
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-1.5",
    children: [/* @__PURE__ */ jsxs("label", {
      className: "block text-sm font-medium text-base-content",
      children: [input.name, /* @__PURE__ */ jsxs("span", {
        className: "text-xs text-warning ml-2",
        children: ["(unsupported: ", getSelectorType(selector), ")"]
      })]
    }), /* @__PURE__ */ jsx("input", {
      type: "text",
      className: "input input-bordered input-sm w-full bg-base-200 border-base-300",
      ...register(inputKey)
    }), input.description && /* @__PURE__ */ jsx("p", {
      className: "text-xs text-base-content/50",
      children: input.description
    })]
  });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: instances_$instanceId_edit,
  loader: loader$5,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const createSettingsSchema = (addonMode) => z.object({
  haUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  haToken: z.string(),
  // AppDaemon path is optional in add-on mode (auto-configured)
  // Providing a value overrides the default
  appdaemonPath: addonMode ? z.string().optional() : z.string().min(1, "AppDaemon apps folder path is required"),
  categories: z.string().optional()
});
function SettingsForm({ defaultValues, addonMode = false }) {
  const [showToken, setShowToken] = useState(false);
  const [categories, setCategories] = useState(defaultValues?.categories ?? []);
  const [newCategory, setNewCategory] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useRemixForm({
    resolver: zodResolver(createSettingsSchema(addonMode)),
    defaultValues: {
      haUrl: defaultValues?.haUrl ?? "",
      haToken: defaultValues?.haToken ?? "",
      appdaemonPath: defaultValues?.appdaemonPath ?? ""
    },
    submitConfig: {
      method: "POST"
    }
  });
  return /* @__PURE__ */ jsx(Form, { method: "post", onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-base-content border-b border-base-300 pb-2", children: "AppDaemon Configuration" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "appdaemonPath", className: "block text-sm font-medium text-base-content", children: "Apps Folder Path" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "appdaemonPath",
            placeholder: "/config/appdaemon/apps",
            className: `input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary font-mono text-sm ${errors.appdaemonPath ? "input-error" : ""}`,
            ...register("appdaemonPath")
          }
        ),
        errors.appdaemonPath ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: errors.appdaemonPath.message }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: addonMode ? "Default: /share/appdaemon/apps. Change only if using a custom path." : "Path to AppDaemon apps folder containing apps.yaml" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-base-content border-b border-base-300 pb-2", children: "Instance Categories" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: newCategory,
              onChange: (e) => setNewCategory(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory("");
                  }
                }
              },
              placeholder: "Add category...",
              className: "input input-bordered input-sm flex-1 bg-base-200 border-base-300 focus:border-primary"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-primary",
              onClick: () => {
                if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                  setCategories([...categories, newCategory.trim()]);
                  setNewCategory("");
                }
              },
              children: "Add"
            }
          )
        ] }),
        categories.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((cat) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm",
            children: [
              cat,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setCategories(categories.filter((c) => c !== cat)),
                  className: "hover:bg-primary/20 rounded-full p-0.5",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "h-3.5 w-3.5",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        }
                      )
                    }
                  )
                }
              )
            ]
          },
          cat
        )) }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "No categories defined. Add categories to organize your instances." }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "categories", value: JSON.stringify(categories) })
      ] })
    ] }),
    !addonMode && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-base-content border-b border-base-300 pb-2", children: [
        "Home Assistant Connection",
        /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-base-content/50 ml-2", children: "(optional)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "haUrl", className: "block text-sm font-medium text-base-content", children: "Home Assistant URL" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            id: "haUrl",
            placeholder: "http://homeassistant.local:8123",
            className: `input input-bordered input-sm w-full bg-base-200 border-base-300 focus:border-primary ${errors.haUrl ? "input-error" : ""}`,
            ...register("haUrl")
          }
        ),
        errors.haUrl ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: errors.haUrl.message }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "The URL of your Home Assistant instance" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "haToken", className: "block text-sm font-medium text-base-content", children: "Long-Lived Access Token" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: showToken ? "text" : "password",
              id: "haToken",
              placeholder: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
              className: `input input-bordered input-sm flex-1 font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${errors.haToken ? "input-error" : ""}`,
              ...register("haToken")
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-ghost",
              onClick: () => setShowToken(!showToken),
              title: showToken ? "Hide token" : "Show token",
              children: showToken ? /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-4 w-4",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    }
                  )
                }
              ) : /* @__PURE__ */ jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-4 w-4",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: [
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      }
                    )
                  ]
                }
              )
            }
          )
        ] }),
        errors.haToken ? /* @__PURE__ */ jsx("p", { className: "text-xs text-error", children: errors.haToken.message }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Create in Home Assistant: Profile → Long-Lived Access Tokens" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-base-200/50 border border-base-300", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
      /* @__PURE__ */ jsx("strong", { className: "text-base-content/80", children: "Note:" }),
      " ",
      addonMode ? "Categories are stored locally in your browser for organizing instances." : "Settings are stored locally in your browser. Home Assistant credentials are used to fetch entities for selectors."
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: "btn btn-primary btn-sm",
        disabled: isSubmitting,
        children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
          "Saving..."
        ] }) : "Save Settings"
      }
    ) })
  ] }) });
}
function meta$2({}) {
  return [{
    title: "Settings | AppDaemon Configurator"
  }, {
    name: "description",
    content: "Configure Home Assistant and AppDaemon settings"
  }];
}
async function loader$4({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const addonMode = isAddonMode();
  return {
    settings: settings2,
    addonMode
  };
}
async function action$3({
  request
}) {
  const formData = await request.formData();
  const haUrl = stripQuotes(formData.get("haUrl"));
  const haToken = stripQuotes(formData.get("haToken"));
  const appdaemonPath = stripQuotes(formData.get("appdaemonPath"));
  const categoriesRaw = formData.get("categories");
  let categories = [];
  try {
    categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];
  } catch {
    categories = [];
  }
  const settings2 = {
    haUrl,
    haToken,
    appdaemonPath,
    categories
  };
  const encodedSettings = Buffer.from(JSON.stringify(settings2)).toString("base64");
  return redirect("/", {
    headers: {
      "Set-Cookie": `app_settings=${encodedSettings}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    }
  });
}
const settings = UNSAFE_withComponentProps(function Settings({
  loaderData
}) {
  const {
    settings: settings2,
    addonMode
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-lg mx-auto px-4 py-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-6",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-semibold",
        children: "Settings"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-base-content/50 mt-1",
        children: addonMode ? "Configure categories and other options" : "Configure Home Assistant and AppDaemon connections"
      })]
    }), addonMode && /* @__PURE__ */ jsx("div", {
      className: "mb-4 p-3 rounded-lg border border-info/30 bg-info/5",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex items-start gap-2",
        children: [/* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-5 w-5 text-info flex-shrink-0 mt-0.5",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          })
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-base-content/80",
          children: "Running as Home Assistant add-on. Connection settings are automatically configured."
        })]
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "rounded-lg border border-base-300 bg-base-100 p-4",
      children: /* @__PURE__ */ jsx(SettingsForm, {
        defaultValues: settings2,
        addonMode
      })
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: settings,
  loader: loader$4,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function meta$1({
  data: data2
}) {
  const name = data2?.blueprint?.blueprint?.name ?? "Configure";
  return [{
    title: `${name} | AppDaemon Configurator`
  }, {
    name: "description",
    content: `Configure ${name} blueprint`
  }];
}
async function loader$3({
  params,
  request
}) {
  const {
    blueprintId
  } = params;
  if (!blueprintId) {
    throw new Response("Blueprint ID is required", {
      status: 400
    });
  }
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const blueprint = await getBlueprint(blueprintId, settings2?.appdaemonPath);
  if (!blueprint) {
    throw new Response("Blueprint not found", {
      status: 404
    });
  }
  const categories = settings2?.categories ?? [];
  return {
    blueprint,
    blueprintId,
    categories
  };
}
async function action$2({
  request,
  params
}) {
  const {
    blueprintId
  } = params;
  if (!blueprintId) {
    throw new Response("Blueprint ID is required", {
      status: 400
    });
  }
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const formData = await request.formData();
  const data2 = Object.fromEntries(formData);
  const {
    blueprintId: _,
    _instanceName,
    _category,
    _tags,
    ...values
  } = data2;
  stripQuotes(_instanceName) || blueprintId.replace(/-/g, "_");
  const category = stripQuotes(_category) || void 0;
  let tags = [];
  try {
    const tagsRaw = _tags;
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    tags = [];
  }
  const blueprint = await getBlueprint(blueprintId, settings2?.appdaemonPath);
  if (!blueprint) {
    throw new Response("Blueprint not found", {
      status: 404
    });
  }
  const flatInputs = flattenInputs(blueprint.input);
  const typedValues = {};
  for (const [key, value] of Object.entries(values)) {
    const inputDef = flatInputs[key];
    const strValue = stripQuotes(value);
    if (!inputDef?.selector) {
      typedValues[key] = strValue;
      continue;
    }
    const selector = inputDef.selector;
    if ("number" in selector) {
      typedValues[key] = Number(strValue);
    } else if ("boolean" in selector) {
      typedValues[key] = strValue === "true" || strValue === "on";
    } else {
      typedValues[key] = strValue;
    }
  }
  const existingInstances = await getAppInstances(settings2?.appdaemonPath || "");
  const existingIds = existingInstances.map((i) => i.id);
  const instanceId = _instanceName ? stripQuotes(_instanceName) : generateInstanceId(blueprintId, existingIds);
  if (_instanceName && existingIds.includes(instanceId)) {
    return {
      error: `Instance "${instanceId}" already exists. Please choose a different name.`
    };
  }
  const moduleName = blueprintId.replace(/-/g, "_");
  const className = toPascalCase(moduleName);
  try {
    await createAppInstance(settings2?.appdaemonPath || "", instanceId, moduleName, className, typedValues, blueprintId, category, tags);
    return {
      success: true,
      instanceId
    };
  } catch (error) {
    console.error("Failed to save instance:", error);
    return {
      error: `Failed to save instance: ${error.message}`
    };
  }
}
const configure_$blueprintId = UNSAFE_withComponentProps(function Configure({
  loaderData
}) {
  const {
    blueprint,
    blueprintId,
    categories
  } = loaderData;
  return /* @__PURE__ */ jsxs("div", {
    className: "max-w-2xl mx-auto px-4 py-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "mb-6",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-2 text-sm text-base-content/50 mb-2",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "hover:text-base-content",
          children: "Blueprints"
        }), /* @__PURE__ */ jsx("span", {
          children: "/"
        }), /* @__PURE__ */ jsx("span", {
          className: "text-base-content",
          children: blueprint.blueprint.name
        })]
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-xl font-semibold",
        children: blueprint.blueprint.name
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-base-content/50 mt-1",
        children: blueprint.blueprint.description
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "rounded-lg border border-base-300 bg-base-100 p-4",
      children: /* @__PURE__ */ jsx(ConfigureForm, {
        blueprint,
        blueprintId,
        availableCategories: categories
      })
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: configure_$blueprintId,
  loader: loader$3,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function YamlPreview({
  yaml,
  blueprintId,
  blueprintName,
  instanceName,
  config,
  hasAppdaemonPath,
  category,
  tags
}) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/instances/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          blueprintId,
          instanceName,
          config,
          category,
          tags
        })
      });
      const data2 = await response.json();
      if (!response.ok) {
        throw new Error(data2.error || "Failed to save instance");
      }
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/instances");
      }, 1500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium", children: "Generated Configuration" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/50", children: "Save to apps.yaml or copy manually" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/configure/${blueprintId}`,
            className: "btn btn-ghost btn-sm",
            children: "← Back"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCopy,
            className: `btn btn-sm ${copied ? "btn-success" : "btn-ghost"}`,
            children: copied ? "Copied!" : "Copy"
          }
        ),
        hasAppdaemonPath ? /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            disabled: saving || saveSuccess,
            className: `btn btn-sm ${saveSuccess ? "btn-success" : "btn-primary"}`,
            children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
              "Saving..."
            ] }) : saveSuccess ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-4 w-4",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M5 13l4 4L19 7"
                    }
                  )
                }
              ),
              "Saved!"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-4 w-4",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    }
                  )
                }
              ),
              "Save to apps.yaml"
            ] })
          }
        ) : /* @__PURE__ */ jsx(Link, { to: "/settings", className: "btn btn-sm btn-primary", children: "Configure Path" })
      ] })
    ] }),
    saveError && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg border border-error/30 bg-error/5 text-error text-sm", children: saveError }),
    !hasAppdaemonPath && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg border border-warning/30 bg-warning/5 text-warning text-sm", children: "Configure your AppDaemon apps folder path in Settings to save directly to apps.yaml." }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-b border-base-300 bg-base-300/50", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50 font-mono", children: "apps.yaml" }) }),
      /* @__PURE__ */ jsx("pre", { className: "p-4 overflow-x-auto", children: /* @__PURE__ */ jsx("code", { className: "text-sm font-mono text-base-content", children: yaml }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-base-200/50 border border-base-300", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium mb-2", children: "Next Steps" }),
      /* @__PURE__ */ jsx("ol", { className: "text-xs text-base-content/60 space-y-1 list-decimal list-inside", children: hasAppdaemonPath ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("li", { children: 'Click "Save to apps.yaml" to add this configuration automatically' }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Ensure ",
          /* @__PURE__ */ jsxs("code", { className: "bg-base-200 px-1 py-0.5 rounded", children: [
            blueprintId.replace(/-/g, "_"),
            ".py"
          ] }),
          " exists in your apps folder"
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Restart AppDaemon to load the configuration" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "Copy the configuration above to your AppDaemon ",
          /* @__PURE__ */ jsx("code", { className: "bg-base-200 px-1 py-0.5 rounded", children: "apps.yaml" })
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Ensure ",
          /* @__PURE__ */ jsxs("code", { className: "bg-base-200 px-1 py-0.5 rounded", children: [
            blueprintId.replace(/-/g, "_"),
            ".py"
          ] }),
          " exists in your apps folder"
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Restart AppDaemon to load the configuration" })
      ] }) })
    ] })
  ] });
}
function meta({}) {
  return [{
    title: "Preview | AppDaemon Configurator"
  }, {
    name: "description",
    content: "Preview generated apps.yaml configuration"
  }];
}
async function loader$2({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const previewData = parsePreviewCookie(cookieHeader);
  if (!previewData) {
    return redirect("/");
  }
  const settings2 = await getAppSettings(cookieHeader);
  const hasAppdaemonPath = isAddonMode() || !!settings2?.appdaemonPath;
  return {
    ...previewData,
    hasAppdaemonPath
  };
}
function parsePreviewCookie(cookieHeader) {
  const match = cookieHeader.match(/preview_data=([^;]+)/);
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
const preview = UNSAFE_withComponentProps(function Preview({
  loaderData
}) {
  const {
    yaml,
    blueprintId,
    blueprintName,
    instanceName,
    config,
    hasAppdaemonPath,
    category,
    tags
  } = loaderData;
  return /* @__PURE__ */ jsx("div", {
    className: "max-w-2xl mx-auto px-4 py-8",
    children: /* @__PURE__ */ jsx(YamlPreview, {
      yaml,
      blueprintId,
      blueprintName,
      instanceName,
      config,
      hasAppdaemonPath,
      category,
      tags
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: preview,
  loader: loader$2,
  meta
}, Symbol.toStringTag, { value: "Module" }));
class HomeAssistantClient {
  baseUrl;
  token;
  constructor(settings2) {
    this.baseUrl = settings2.url.replace(/\/$/, "").replace(/^["']|["']$/g, "");
    this.token = settings2.token.replace(/^["']|["']$/g, "").trim();
  }
  async fetch(path2) {
    const response = await fetch(`${this.baseUrl}/api/${path2}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Home Assistant API error: ${response.statusText}`);
    }
    return response.json();
  }
  async getStates() {
    return this.fetch("states");
  }
  async getEntities(domain) {
    const states = await this.getStates();
    if (!domain) {
      return states;
    }
    const domains = Array.isArray(domain) ? domain : [domain];
    return states.filter((entity) => {
      const entityDomain = entity.entity_id.split(".")[0];
      return domains.includes(entityDomain);
    });
  }
  async getNotificationServices() {
    return this.fetch("services");
  }
}
async function loader$1({
  request
}) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");
  const domains = domain ? domain.split(",") : void 0;
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const appSettings = await getAppSettings(cookieHeader);
  if (!appSettings) {
    return Response.json({
      error: "No settings found"
    }, {
      status: 401
    });
  }
  const haSettings = getHASettings(appSettings);
  if (!haSettings) {
    return Response.json({
      error: "No Home Assistant settings configured"
    }, {
      status: 401
    });
  }
  try {
    const client = new HomeAssistantClient(haSettings);
    const entities = await client.getEntities(domains);
    const simplified = entities.map((e) => ({
      value: e.entity_id,
      label: e.attributes.friendly_name || e.entity_id,
      domain: e.entity_id.split(".")[0]
    }));
    return Response.json({
      entities: simplified
    });
  } catch (error) {
    console.error("Failed to fetch entities:", error);
    return Response.json({
      error: "Failed to fetch entities from Home Assistant"
    }, {
      status: 500
    });
  }
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const appSettings = await getAppSettings(cookieHeader);
  if (!appSettings) {
    return Response.json({
      error: "No settings found"
    }, {
      status: 401
    });
  }
  const haSettings = getHASettings(appSettings);
  if (!haSettings) {
    return Response.json({
      error: "No Home Assistant settings configured"
    }, {
      status: 401
    });
  }
  try {
    const client = new HomeAssistantClient(haSettings);
    const servicesData = await client.getNotificationServices();
    const services = [];
    const notifyDomain = Array.isArray(servicesData) ? servicesData.find((item) => item.domain === "notify") : null;
    if (notifyDomain && notifyDomain.services) {
      for (const [serviceName, serviceData] of Object.entries(notifyDomain.services)) {
        const serviceId = `notify.${serviceName}`;
        let label = serviceData.name || serviceData.description;
        if (!label) {
          label = serviceName.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        }
        services.push({
          value: serviceId,
          label
        });
      }
    }
    services.sort((a, b) => a.label.localeCompare(b.label));
    return Response.json({
      services
    });
  } catch (error) {
    console.error("Failed to fetch notification services:", error);
    return Response.json({
      error: "Failed to fetch notification services from Home Assistant"
    }, {
      status: 500
    });
  }
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  if (!settings2?.appdaemonPath) {
    return Response.json({
      error: "AppDaemon path not configured. Please configure it in Settings."
    }, {
      status: 400
    });
  }
  try {
    const body = await request.json();
    const {
      blueprintId,
      config,
      instanceName,
      instanceId: providedInstanceId,
      category,
      tags
    } = body;
    if (!blueprintId) {
      return Response.json({
        error: "Blueprint ID is required"
      }, {
        status: 400
      });
    }
    const existingInstances = await getAppInstances(settings2.appdaemonPath);
    const existingIds = existingInstances.map((i) => i.id);
    const instanceId = instanceName || providedInstanceId || generateInstanceId(blueprintId, existingIds);
    if (existingIds.includes(instanceId)) {
      return Response.json({
        error: `Instance "${instanceId}" already exists. Please choose a different name.`
      }, {
        status: 400
      });
    }
    const moduleName = blueprintId.replace(/-/g, "_");
    const className = toPascalCase(moduleName);
    const instance = await createAppInstance(settings2.appdaemonPath, instanceId, moduleName, className, config, blueprintId, category, tags);
    return Response.json({
      success: true,
      instance,
      message: `Instance "${instanceId}" created successfully`
    });
  } catch (error) {
    console.error("Failed to save instance:", error);
    return Response.json({
      error: `Failed to save instance: ${error.message}`
    }, {
      status: 500
    });
  }
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
const FALLBACK_BLUEPRINTS_DIR = path.join(process.cwd(), "blueprints");
async function action({
  request
}) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const settings2 = await getAppSettings(cookieHeader);
  const appdaemonPath = settings2?.appdaemonPath || FALLBACK_BLUEPRINTS_DIR;
  try {
    await fs.mkdir(appdaemonPath, {
      recursive: true
    });
  } catch (err) {
    console.error("Failed to create appdaemon path:", err);
    return data({
      error: "Failed to access AppDaemon apps directory"
    }, {
      status: 500
    });
  }
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("Upload error:", err);
    return data({
      error: "Failed to process upload"
    }, {
      status: 400
    });
  }
  const file = formData.get("file");
  if (!file || file.size === 0) {
    return data({
      error: "No file provided"
    }, {
      status: 400
    });
  }
  if (!file.name.endsWith(".zip")) {
    return data({
      error: "Only .zip files are allowed"
    }, {
      status: 400
    });
  }
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    if (zipEntries.length === 0) {
      return data({
        error: "Empty zip file"
      }, {
        status: 400
      });
    }
    zip.extractAllTo(appdaemonPath, true);
    console.log(`Extracted blueprints to ${appdaemonPath}`);
    return data({
      success: true,
      message: "Blueprints uploaded successfully"
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return data({
      error: "Failed to extract zip file: " + (error instanceof Error ? error.message : String(error))
    }, {
      status: 500
    });
  }
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "./entry.client-uhfo54B2.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "./root-yBNjmven.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js"], "css": ["./root-0SFoweXq.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./home-vdVrHheh.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/instances._index": { "id": "routes/instances._index", "parentId": "root", "path": "instances", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./instances._index-Bgh3trjB.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/instances.$instanceId.edit": { "id": "routes/instances.$instanceId.edit", "parentId": "root", "path": "instances/:instanceId/edit", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./instances._instanceId.edit-xKLhW0Ls.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js", "./NotificationInput-BS9H4_Gc.js", "./index-DGVGBDgr.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings": { "id": "routes/settings", "parentId": "root", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./settings-CrAtVo83.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js", "./index-DGVGBDgr.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/configure.$blueprintId": { "id": "routes/configure.$blueprintId", "parentId": "root", "path": "configure/:blueprintId", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./configure._blueprintId-CxKD9oTm.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js", "./index-DGVGBDgr.js", "./NotificationInput-BS9H4_Gc.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/preview": { "id": "routes/preview", "parentId": "root", "path": "preview", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./preview-7yHgs6_c.js", "imports": ["./chunk-JZWAC4HX-bs4pZpVQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.entities": { "id": "routes/api.entities", "parentId": "root", "path": "api/entities", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./api.entities-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.notify-services": { "id": "routes/api.notify-services", "parentId": "root", "path": "api/notify-services", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./api.notify-services-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.instances.save": { "id": "routes/api.instances.save", "parentId": "root", "path": "api/instances/save", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./api.instances.save-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.upload-blueprints": { "id": "routes/api.upload-blueprints", "parentId": "root", "path": "api/upload-blueprints", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "./api.upload-blueprints-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "./manifest-155123d0.js", "version": "155123d0", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "./";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/instances._index": {
    id: "routes/instances._index",
    parentId: "root",
    path: "instances",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/instances.$instanceId.edit": {
    id: "routes/instances.$instanceId.edit",
    parentId: "root",
    path: "instances/:instanceId/edit",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/configure.$blueprintId": {
    id: "routes/configure.$blueprintId",
    parentId: "root",
    path: "configure/:blueprintId",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/preview": {
    id: "routes/preview",
    parentId: "root",
    path: "preview",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.entities": {
    id: "routes/api.entities",
    parentId: "root",
    path: "api/entities",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/api.notify-services": {
    id: "routes/api.notify-services",
    parentId: "root",
    path: "api/notify-services",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/api.instances.save": {
    id: "routes/api.instances.save",
    parentId: "root",
    path: "api/instances/save",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/api.upload-blueprints": {
    id: "routes/api.upload-blueprints",
    parentId: "root",
    path: "api/upload-blueprints",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
