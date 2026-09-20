"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
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
  onChange?: (value: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  error?: string;
};

export const AddressAutocomplete = React.forwardRef<
  HTMLInputElement,
  AddressAutocompleteProps
>(function AddressAutocomplete(
  {
    onSelectAddress,
    onChange,
    initialValue = "",
    placeholder = "Start typing your address (e.g. 19 Anemone Road, Primrose)...",
    className,
    error,
  },
  ref
) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(Boolean(initialValue));

  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  // Sync with initialValue if changed externally
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== query) {
      setQuery(initialValue);
      if (initialValue.trim().length > 0) {
        setHasSelected(true);
      }
    }
  }, [initialValue]);

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
    const full = s.fullAddress || s.mainText;
    setHasSelected(true);
    setQuery(full);
    setIsOpen(false);
    setSuggestions([]);

    onChange?.(full);

    onSelectAddress({
      address: s.address,
      suburb: s.suburb,
      city: s.city,
      province: s.province,
      postalCode: s.postalCode,
      fullAddress: full,
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
        className="flex items-center justify-between text-sm font-extrabold text-[var(--pex-navy)] mb-1.5"
      >
        <span className="flex items-center gap-2">
          <span>Delivery address</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#0B5C50] text-white shadow-sm tracking-wide">
            Auto-search
          </span>
        </span>
        {hasSelected && query.trim().length > 0 && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Address selected
          </span>
        )}
      </label>

      <div className="relative w-full flex items-center">
        {/* Location Pin Icon */}
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-emerald-700 flex items-center justify-center">
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
          ref={internalInputRef}
          type="search"
          autoComplete="street-address"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setHasSelected(false);
            onChange?.(val);
          }}
          onFocus={() => {
            if (suggestions.length > 0 && !hasSelected) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full min-h-[52px] sm:min-h-[56px] pl-11 pr-11 py-2.5 rounded-2xl border-2 outline-none bg-white text-[var(--pex-navy)] text-sm sm:text-base font-semibold transition-all duration-200 shadow-[0_2px_6px_rgba(26,42,64,0.03)] placeholder:text-[var(--pex-navy)]/40 placeholder:font-normal",
            error
              ? "border-[var(--pex-coral)] focus:border-[var(--pex-coral)] focus:ring-4 focus:ring-[var(--pex-coral)]/15"
              : "border-slate-200/90 hover:border-emerald-600/60 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
          )}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="address-suggestions-list"
          role="combobox"
        />

        {/* Loading Spinner / Clear button */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
                setHasSelected(false);
                onChange?.("");
                internalInputRef.current?.focus();
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

      {error ? (
        <p className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">
          {error}
        </p>
      ) : (
        <p className="text-xs text-[var(--pex-muted)] mt-1.5">
          Start typing to search your street address in South Africa, or enter it manually.
        </p>
      )}

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
                    ? "bg-teal-50 text-[var(--pex-navy)] font-semibold border-l-4 border-[#0B5C50]"
                    : "hover:bg-slate-50 text-slate-800"
                )}
              >
                <span className="mt-0.5 text-emerald-700 shrink-0">
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
                  <p className="m-0 text-sm font-bold text-[var(--pex-navy)] leading-tight truncate">
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
});
