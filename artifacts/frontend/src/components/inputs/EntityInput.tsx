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
  multiple,
  register,
  errors,
  setValue,
  defaultValue,
}: EntityInputProps & { setValue?: any; defaultValue?: unknown }) {
  const domainHint = Array.isArray(domain) ? domain.join(", ") : domain;
  const error = errors?.[name];

  const { ref: inputRef, onChange: rhfOnChange, onBlur: rhfOnBlur, ...restRegister } = register(name, { required });

  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (multiple && Array.isArray(defaultValue)) {
      return defaultValue as string[];
    }
    return [];
  });

  const [filter, setFilter] = useState("");

  const [entities, setEntities] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Register the field manually if using multiple and we skipped the standard input registration
  useEffect(() => {
    if (multiple && register) {
      register(name, { required });
    }
  }, [multiple, register, name, required]);

  const buildFetchUrl = () => {
    const params = new URLSearchParams();
    if (domain) {
      const domains = Array.isArray(domain) ? domain : [domain];
      params.append("domain", domains.join(","));
    }
    return `./api/entities?${params.toString()}`;
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
      const filtered = entities.filter((s) => {
        if (multiple && selectedValues.includes(s.value)) return false;
        return (
          s.value.toLowerCase().includes(filter.toLowerCase()) ||
          s.label.toLowerCase().includes(filter.toLowerCase())
        );
      });
      setSuggestions(filtered);
    }
  }, [filter, entities, selectedValues, multiple]);

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

  const updateFormValue = (newValue: string | string[]) => {
    if (setValue) {
      setValue(name, newValue, { shouldValidate: true, shouldDirty: true });
    }
  };

  const selectSuggestion = (suggestion: { value: string; label: string }) => {
    if (multiple) {
      const newValues = [...selectedValues, suggestion.value];
      setSelectedValues(newValues);
      setFilter("");
      updateFormValue(newValues);

      const input = document.getElementById(name) as HTMLInputElement;
      if (input) {
        input.value = "";
        input.focus();
      }
    } else {
      const input = document.getElementById(name) as HTMLInputElement;
      if (input) {
        input.value = suggestion.value;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
        setFilter(suggestion.value);
      }
    }

    if (!multiple) {
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  };

  const removeValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    updateFormValue(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (multiple && e.key === "Backspace" && filter === "" && selectedValues.length > 0) {
      removeValue(selectedValues[selectedValues.length - 1]);
      return;
    }

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

      <div className={`flex flex-wrap items-center gap-1 p-1 bg-base-200 border border-base-300 rounded-lg focus-within:border-primary ${error ? "border-error" : ""}`}>
        {multiple && selectedValues.map(val => (
          <span key={val} className="badge badge-primary badge-sm gap-1">
            {val}
            <button type="button" onClick={() => removeValue(val)} className="btn btn-ghost btn-xs w-4 h-4 min-h-0 p-0 rounded-full text-primary-content hover:bg-primary-focus">
              ×
            </button>
          </span>
        ))}

        <div className="flex-1 flex relative min-w-[150px]">
          <input
            type="text"
            id={name}
            autoComplete="off"
            placeholder={multiple && selectedValues.length > 0 ? "" : (domainHint ? `${domainHint}.entity_id` : "entity_id")}
            // Bind register for single, but avoid for multiple search input 
            {...(!multiple ? restRegister : {})}
            name={multiple ? `${name}_search` : name}
            ref={(e) => {
              if (!multiple) inputRef(e);
            }}
            className={`input input-ghost input-sm flex-1 font-mono text-sm focus:outline-none w-full p-0 h-auto min-h-[1.5rem]`}
            onChange={(e) => {
              if (!multiple) {
                rhfOnChange(e);
              }
              setFilter(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={(e) => {
              if (!multiple) {
                rhfOnBlur(e);
              }
              setTimeout(() => setShowSuggestions(false), 200);
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
          />

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              fetchEntities();
              const input = document.getElementById(name) as HTMLInputElement;
              if (input) input.focus();
              setShowSuggestions(true);
            }}
            className={`btn btn-sm btn-ghost btn-square min-h-0 h-6 w-6 absolute right-0 top-0 ${isLoading ? "loading" : ""}`}
            title="Refresh entities"
          >
            {!isLoading && (
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-lg"
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
