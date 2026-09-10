"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import styles from "./AdminDropdown.module.css";

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
      className={`${pill ? styles.wrapperPill : styles.wrapper} ${className || ""}`}
    >
      {name && <input type="hidden" name={name} value={String(value)} />}

      <button
        id={id}
        type="button"
        className={pill ? styles.triggerPill : styles.triggerField}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayLabel}
        data-open={isOpen ? "true" : "false"}
      >
        <span className={styles.triggerLabel}>{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || "Options"}
          className={`${styles.menu} ${searchable ? styles.menuSearchable : ""} ${
            align === "right" ? styles.menuRight : ""
          } ${openUpwards ? styles.menuTop : ""}`}
        >
          {searchable && (
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <Search
                  size={14}
                  className={styles.searchIcon}
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
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
                    className={styles.searchClear}
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

          <div className={styles.optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isSelected ? "true" : "false"}
                    className={styles.optionItem}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className={styles.checkIcon}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {footerAction && (
            <div className={styles.footerContainer}>
              <button
                type="button"
                className={styles.footerActionButton}
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

