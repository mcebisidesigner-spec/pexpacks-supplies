"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressSuggestion } from "@/app/api/address-autocomplete/route";
import { cn } from "@/lib/utils";

export type AddressAutocompleteProps = {
  onSelectAddress: (address: {
    address: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    fullAddress: string;
  }) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
};

export function AddressAutocomplete({
  onSelectAddress,
  initialValue = "",
  placeholder = "Start typing your address (e.g. 42 Main Road, Sandton)...",
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (hasSelected || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/address-autocomplete?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const list: AddressSuggestion[] = data.suggestions || [];
          setSuggestions(list);
          setIsOpen(list.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, hasSelected]);

  const handleSelect = (s: AddressSuggestion) => {
    setHasSelected(true);
    setQuery(s.fullAddress || s.mainText);
    setIsOpen(false);
    setSuggestions([]);

    onSelectAddress({
      address: s.address,
      suburb: s.suburb,
      city: s.city,
      province: s.province,
      postalCode: s.postalCode,
      fullAddress: s.fullAddress,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <label
        htmlFor="address-auto-search"
        className="flex items-center justify-between text-sm font-extrabold text-pex-navy mb-1.5"
      >
        <span className="flex items-center gap-2">
          <span>Search delivery address</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-pex-keppel/10 text-pex-keppel border border-pex-keppel/25">
            Auto-search
          </span>
        </span>
        {hasSelected && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Address details filled
          </span>
        )}
      </label>

      <div className="relative w-full flex items-center">
        {/* Location Pin Icon */}
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-pex-keppel flex items-center justify-center">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <input
          id="address-auto-search"
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasSelected(false);
          }}
          onFocus={() => {
            if (suggestions.length > 0 && !hasSelected) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[52px] sm:min-h-[56px] pl-11 pr-11 py-2.5 rounded-2xl border-2 border-slate-200/90 hover:border-pex-keppel/60 focus:border-pex-keppel focus:ring-4 focus:ring-pex-keppel/15 outline-none bg-white text-pex-navy text-sm sm:text-base font-semibold transition-all duration-200 shadow-[0_2px_6px_rgba(26,42,64,0.03)] placeholder:text-pex-navy/40 placeholder:font-normal"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="address-suggestions-list"
          role="combobox"
        />

        {/* Loading Spinner / Clear button */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-pex-keppel border-t-transparent rounded-full animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
                setHasSelected(false);
                inputRef.current?.focus();
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Clear address search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Auto-predictions Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="address-suggestions-list"
          role="listbox"
          className="absolute z-50 inset-x-0 top-[calc(100%+6px)] max-h-64 overflow-y-auto bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_rgba(26,42,64,0.16)] p-1.5 m-0 list-none animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-150",
                  isSelected
                    ? "bg-pex-keppel/10 text-pex-navy"
                    : "hover:bg-slate-50 text-slate-800"
                )}
              >
                <span className="mt-0.5 text-pex-keppel shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-bold text-pex-navy leading-tight truncate">
                    {item.mainText}
                  </p>
                  {item.secondaryText && (
                    <p className="m-0 mt-0.5 text-xs text-slate-500 font-medium leading-snug truncate">
                      {item.secondaryText}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
