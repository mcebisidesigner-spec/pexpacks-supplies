"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export interface AdminDropdownProps<T extends string | number> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  pill?: boolean;
  name?: string;
  id?: string;
  align?: "left" | "right";
  ariaLabel?: string;
  openUpwards?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  footerAction?: {
    label: string;
    value?: T;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export function AdminDropdown<T extends string | number>({
  value,
  options,
  onChange,
  className,
  pill = false,
  name,
  id,
  align = "left",
  ariaLabel,
  openUpwards = false,
  searchable = false,
  searchPlaceholder,
  placeholder,
  footerAction,
}: AdminDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input on open, and reset query on close
  useEffect(() => {
    if (isOpen) {
      if (searchable) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 40);
        return () => clearTimeout(timer);
      }
    } else {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption
    ? selectedOption.label
    : value
      ? String(value)
      : placeholder || "Select option";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none",
        pill ? "inline-block w-auto" : "block w-full",
        className,
      )}
    >
      {name && <input type="hidden" name={name} value={String(value)} />}

      <button
        id={id}
        type="button"
        className={cn(
          pill
            ? "inline-flex items-center gap-2 bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,rgba(51,65,85,0.85))] rounded-full px-3.5 py-1.5 text-white text-xs font-semibold cursor-pointer outline-none transition-all shadow-xs hover:bg-[#0d1524] hover:border-slate-400/60 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/25 data-[open=true]:border-emerald-500 data-[open=true]:ring-2 data-[open=true]:ring-emerald-500/25 data-[open=true]:bg-[#0b121e]"
            : "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 font-inherit text-sm font-medium text-[var(--db-text-primary)] cursor-pointer outline-none transition-all duration-150 hover:border-[var(--db-text-subtle)] hover:bg-[var(--db-surface-hover)] focus-visible:border-[var(--db-brand)] focus-visible:ring-4 focus-visible:ring-[var(--db-brand-subtle)] data-[open=true]:border-[var(--db-brand)] data-[open=true]:ring-4 data-[open=true]:ring-[var(--db-brand-subtle)] data-[open=true]:bg-[var(--db-surface-hover)]",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayLabel}
        data-open={isOpen ? "true" : "false"}
      >
        <span className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis text-inherit">
          {displayLabel}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-slate-400 shrink-0 ml-auto transition-transform transition-colors duration-160",
            isOpen && "rotate-180 text-emerald-500",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || "Options"}
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full min-w-full max-h-70 overflow-y-auto rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface)] p-1.5 shadow-[var(--db-shadow-elevated)] animate-in fade-in duration-150 box-border",
            searchable && "flex flex-col max-h-85 overflow-hidden p-0",
            align === "right" && "left-auto right-0",
            openUpwards && "top-auto bottom-[calc(100%+6px)]",
          )}
        >
          {searchable && (
            <div className="p-2 bg-[#090e17] border-b border-slate-700/85 shrink-0">
              <div className="relative flex items-center w-full">
                <Search
                  size={14}
                  className="absolute left-2.5 text-slate-400 pointer-events-none shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="searchInput w-full h-8.5 pl-8 pr-7 bg-slate-900/95 border border-slate-700/85 rounded-md text-white font-inherit text-[12.5px] outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
                  placeholder={searchPlaceholder || "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (filteredOptions.length > 0) {
                        onChange(filteredOptions[0].value);
                        setIsOpen(false);
                      } else if (footerAction) {
                        setIsOpen(false);
                        footerAction.onClick();
                      }
                    }
                  }}
                  aria-label={searchPlaceholder || "Search options"}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-2 inline-flex items-center justify-center w-4.5 h-4.5 border-0 bg-white/10 text-slate-400 rounded-full cursor-pointer p-0 transition-colors hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-1 flex flex-col gap-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isSelected ? "true" : "false"}
                    className={cn(
                      "flex items-center justify-between gap-4 w-full px-3 py-2 rounded-md text-slate-300 text-[13px] font-medium cursor-pointer transition-colors select-none",
                      !isSelected && "hover:bg-white/8 hover:text-white",
                      isSelected &&
                        "bg-emerald-500/18 text-emerald-500 font-semibold hover:bg-emerald-500/26 hover:text-emerald-400",
                    )}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap text-inherit">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className="text-emerald-500 shrink-0 ml-auto"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400 text-[12.5px] italic">
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {footerAction && (
            <div className="p-1 bg-[#090e17] border-t border-slate-700/85 shrink-0">
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 border-0 rounded-md bg-transparent text-emerald-500 font-inherit text-[12.5px] font-semibold cursor-pointer outline-none transition-colors text-left hover:bg-emerald-500/14 hover:text-emerald-400"
                onClick={() => {
                  setIsOpen(false);
                  footerAction.onClick();
                }}
              >
                {footerAction.icon || <Plus size={14} />}
                <span>
                  {searchQuery.trim() &&
                  !options.some(
                    (o) =>
                      o.label.toLowerCase() === searchQuery.trim().toLowerCase(),
                  )
                    ? `+ Add "${searchQuery.trim()}"...`
                    : footerAction.label}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
