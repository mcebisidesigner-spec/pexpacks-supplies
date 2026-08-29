"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import styles from "./AdminSelect.module.css";

export interface AdminSelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> {
  label?: string;
  error?: string;
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
}

interface AdminOption {
  value: string;
  label: string;
  disabled: boolean;
}

function extractOptions(children: React.ReactNode): AdminOption[] {
  const options: AdminOption[] = [];
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(
        child,
      )
    )
      return;
    const value = child.props.value;
    if (value === undefined || value === null) return;
    const inner = child.props.children;
    options.push({
      value: String(value),
      label:
        inner === null || inner === undefined ? String(value) : String(inner),
      disabled: Boolean(child.props.disabled),
    });
  });
  return options;
}

export const AdminSelect = React.forwardRef<HTMLDivElement, AdminSelectProps>(
  function AdminSelect(
    { label, error, className, id, children, value, onChange, disabled },
    ref,
  ) {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const options = useMemo(() => extractOptions(children), [children]);

    const current =
      options.find((opt) => opt.value === String(value ?? "")) || undefined;

    useEffect(() => {
      function handlePointerDown(ev: MouseEvent | TouchEvent) {
        if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
          setOpen(false);
        }
      }
      function handleKeyDown(ev: KeyboardEvent) {
        if (ev.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    const handleSelect = (opt: AdminOption) => {
      setOpen(false);
      if (opt.disabled) return;
      if (String(opt.value) !== String(value ?? "")) {
        onChange?.({ target: { value: opt.value } });
      }
    };

    return (
      <div className={styles.wrapper} ref={ref}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectContainer} ref={rootRef}>
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={clsx(
              styles.select,
              styles.selectButton,
              { [styles.hasError]: Boolean(error), [styles.open]: open },
              className,
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className={styles.selectedLabel}>
              {current ? current.label : "Select..."}
            </span>
            <span className={styles.arrowIcon}>
              <ChevronDown size={14} />
            </span>
          </button>

          {open ? (
            <ul className={styles.menu} role="listbox">
              {options.map((opt) => {
                const isActive = opt.value === String(value ?? "");
                return (
                  <li key={opt.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={clsx(styles.menuItem, {
                        [styles.menuItemActive]: isActive,
                      })}
                    >
                      <span className={styles.menuLabel}>{opt.label}</span>
                      {isActive ? (
                        <span className={styles.menuCheck}>
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

AdminSelect.displayName = "AdminSelect";
