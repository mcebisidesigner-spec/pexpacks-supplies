"use client";

import type { SelectHTMLAttributes } from "react";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./Input.module.css";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
} | string;

type SelectChangeEvent = {
  target: {
    value: string;
    name?: string;
  };
  currentTarget: {
    value: string;
    name?: string;
  };
};

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "defaultValue" | "value" | "size" | "multiple"
> & {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (event: SelectChangeEvent) => void;
  onValueChange?: (value: string) => void;
};

function normaliseOption(option: SelectOption) {
  return typeof option === "string"
    ? { value: option, label: option, disabled: false }
    : { disabled: false, ...option };
}

export default function Select({ 
  label, 
  id, 
  name,
  options = [], 
  value, 
  defaultValue = "",
  onChange, 
  onValueChange,
  error,
  placeholder = "Select an option",
  className = '',
  disabled,
  required,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  title,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const errorId = `${selectId}-error`;
  const normalisedOptions = options.map(normaliseOption);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = normalisedOptions.find((option) => option.value === selectedValue);
  const hasSelection = Boolean(selectedOption);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  useEffect(() => {
    if (isControlled) {
      return;
    }

    const form = wrapperRef.current?.closest("form");
    if (!form) {
      return;
    }

    function handleReset() {
      setInternalValue(defaultValue);
      setOpen(false);
    }

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultValue, isControlled]);

  function commitValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    });
    setOpen(false);
  }

  function moveSelection(direction: 1 | -1) {
    const enabledOptions = normalisedOptions.filter((option) => !option.disabled);
    if (!enabledOptions.length) {
      return;
    }
    const currentIndex = enabledOptions.findIndex((option) => option.value === selectedValue);
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (currentIndex + direction + enabledOptions.length) % enabledOptions.length;
    commitValue(enabledOptions[nextIndex].value);
    setOpen(true);
  }

  return (
    <div className={clsx(styles.wrapper, className)} ref={wrapperRef}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.selectWrap}>
        {name ? (
          <input
            type="hidden"
            name={name}
            value={selectedValue ?? ""}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        ) : null}
        <button
          id={selectId}
          type="button"
          className={clsx(styles.select, styles.selectButton, open && styles.selectButtonOpen, !hasSelection && styles.selectPlaceholder)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel ?? (label ? undefined : placeholder)}
          aria-describedby={ariaDescribedBy}
          title={title}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveSelection(1);
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveSelection(-1);
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((current) => !current);
            }
          }}
        >
          <span>{selectedOption?.label ?? placeholder}</span>
        </button>
        
        <span className={styles.selectChevron} aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>

        {open ? (
          <div id={listboxId} className={styles.selectMenu} role="listbox">
            {normalisedOptions.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  className={clsx(styles.selectOption, selected && styles.selectOptionSelected)}
                  onClick={() => commitValue(option.value)}
                >
                  <span>{option.label}</span>
                  {selected ? <span aria-hidden="true">Selected</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      
      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
