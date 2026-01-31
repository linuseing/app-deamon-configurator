import { useEffect, useState, useRef } from "react";
import type { BaseInputProps } from "./types";

interface EntityInputProps extends BaseInputProps {
  domain?: string | string[];
  deviceClass?: string | string[];
  multiple?: boolean;
}

export function EntityInput({
  name,
  label,
  description,
  domain,
  required,
  register,
  errors,
}: EntityInputProps) {
  const domainHint = Array.isArray(domain) ? domain.join(", ") : domain;
  const error = errors?.[name];

  const [entities, setEntities] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const { ref: inputRef, ...restRegister } = register(name, { required });

  const buildFetchUrl = () => {
    const params = new URLSearchParams();
    if (domain) {
      const domains = Array.isArray(domain) ? domain : [domain];
      params.append("domain", domains.join(","));
    }
    return `/api/entities?${params.toString()}`;
  };

  const fetchEntities = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const url = buildFetchUrl();
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.entities) {
          setEntities(data.entities);
          setSuggestions(data.entities);
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
      const filtered = entities.filter((s) =>
        s.value.toLowerCase().includes(filter.toLowerCase()) ||
        s.label.toLowerCase().includes(filter.toLowerCase())
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
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const selectSuggestion = (suggestion: { value: string; label: string }) => {
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
          placeholder={domainHint ? `${domainHint}.entity_id` : "entity_id"}
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
            if (!hasFetched) {
              fetchEntities();
            }
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            restRegister.onBlur(e);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            fetchEntities();
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={`btn btn-sm btn-ghost ml-1 ${isLoading ? "loading" : ""}`}
          title="Refresh entities from Home Assistant"
        >
          {!isLoading ? (
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
              <li
                key={s.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`px-3 py-2 text-sm cursor-pointer flex flex-col ${index === selectedIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"
                  }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="font-medium">{s.label}</span>
                <span className={`text-xs font-mono ${index === selectedIndex ? "text-primary-content/70" : "text-base-content/50"
                  }`}>{s.value}</span>
              </li>
            ))}
          </ul>
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
