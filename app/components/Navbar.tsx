import { Link, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  addonMode?: boolean;
}

export function Navbar({ addonMode = false }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/configure");
    }
    if (path === "/instances") {
      return location.pathname === "/instances" || location.pathname.startsWith("/instances/");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-base-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>AppDaemon Config</span>
            {addonMode && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary uppercase tracking-wide">
                Add-on
              </span>
            )}
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive("/") && !isActive("/settings") && !isActive("/instances")
                  ? "bg-base-200 text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              Blueprints
            </Link>
            <Link
              to="/instances"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive("/instances")
                  ? "bg-base-200 text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              Instances
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive("/settings")
                  ? "bg-base-200 text-base-content"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
