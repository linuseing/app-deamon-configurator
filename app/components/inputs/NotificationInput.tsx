import { useFetcher } from "react-router";
import { useEffect, useState, useRef } from "react";
import type { BaseInputProps } from "./types";

interface NotificationInputProps extends BaseInputProps {}

interface NotificationService {
  value: string;
  label: string;
}

export function NotificationInput({
  name,
  label,
  description,
  required,
  register,
  errors,
}: NotificationInputProps) {
  const error = errors?.[name];

  const fetcher = useFetcher<{ services?: NotificationService[]; error?: string }>();
  const [suggestions, setSuggestions] = useState<NotificationService[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const { ref: inputRef, ...restRegister } = register(name, { required });

  // Update suggestions when data loads
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.services) {
        setSuggestions(fetcher.data.services);
        // Show suggestions if we just fetched (user had focused the field)
        if (hasFetched) {
          setShowSuggestions(true);
        }
      } else if (fetcher.data.error) {
        console.error("Error fetching notification services:", fetcher.data.error);
        setSuggestions([]);
      }
    }
  }, [fetcher.data, hasFetched]);

  const filteredSuggestions = filter
    ? suggestions.filter((s) =>
        s.value.toLowerCase().includes(filter.toLowerCase()) ||
        s.label.toLowerCase().includes(filter.toLowerCase())
      )
    : suggestions;

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSuggestions.length, filter]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const selectSuggestion = (suggestion: NotificationService) => {
    const input = document.getElementById(name) as HTMLInputElement;
    if (input) {
      input.value = suggestion.value;
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      setFilter(suggestion.value);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowSuggestions(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="space-y-1.5 relative">
      <label htmlFor={name} className="block text-sm font-medium text-base-content">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <div className="flex relative">
        <input
          type="text"
          id={name}
          autoComplete="off"
          placeholder="notify.mobile_app_phone"
          className={`input input-bordered input-sm flex-1 font-mono text-sm bg-base-200 border-base-300 focus:border-primary ${error ? "input-error" : ""}`}
          {...restRegister}
          ref={(e) => {
            inputRef(e);
          }}
          onChange={(e) => {
            restRegister.onChange(e);
            setFilter(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Fetch data on first focus
            if (!hasFetched && fetcher.state === "idle") {
              setHasFetched(true);
              fetcher.load("/api/notify-services");
            }
            // Show suggestions when focused if we have data
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            restRegister.onBlur(e);
            // Delay hiding so clicks on options register
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            fetcher.load("/api/notify-services");
          }}
          className={`btn btn-sm btn-ghost ml-1 ${fetcher.state !== "idle" ? "loading" : ""}`}
          title="Refresh notification services from Home Assistant"
        >
          {!fetcher.state || fetcher.state === "idle" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : null}
        </button>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul 
            ref={listRef}
            className="absolute z-50 top-full left-0 right-12 mt-1 max-h-60 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-lg"
          >
            {filteredSuggestions.map((s, index) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={s.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`px-3 py-2 text-sm cursor-pointer flex flex-col ${
                  index === selectedIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur on input
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="font-medium">{s.label}</span>
                <span className={`text-xs font-mono ${
                  index === selectedIndex ? "text-primary-content/70" : "text-base-content/50"
                }`}>{s.value}</span>
              </li>
            ))}
          </ul>
        )}
        {showSuggestions && fetcher.state === "idle" && fetcher.data && !fetcher.data.error && suggestions.length === 0 && (
          <div className="absolute z-50 top-full left-0 right-12 mt-1 p-3 bg-base-100 border border-base-300 rounded-lg shadow-lg text-sm text-base-content/60">
            No notification services found
          </div>
        )}
        {fetcher.data?.error && (
          <div className="absolute z-50 top-full left-0 right-12 mt-1 p-3 bg-error/10 border border-error rounded-lg shadow-lg text-sm text-error">
            {fetcher.data.error}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-error">{error.message as string || "This field is required"}</p>
      )}
      {description && !error && (
        <p className="text-xs text-base-content/50">{description}</p>
      )}
    </div>
  );
}
