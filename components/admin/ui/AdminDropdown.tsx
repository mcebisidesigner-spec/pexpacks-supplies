"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
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
}: AdminDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : String(value);

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
          className={`${styles.menu} ${align === "right" ? styles.menuRight : ""} ${
            openUpwards ? styles.menuTop : ""
          }`}
        >
          {options.map((opt) => {
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
          })}
        </div>
      )}
    </div>
  );
}
