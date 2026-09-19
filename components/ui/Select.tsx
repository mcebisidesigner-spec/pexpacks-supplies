"use client";

import type { SelectHTMLAttributes } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption =
  | {
      value: string;
      label: string;
      disabled?: boolean;
    }
  | string;

export type SelectChangeEvent = {
  target: {
    value: string;
    name?: string;
  };
  currentTarget: {
    value: string;
    name?: string;
  };
};

export type SelectProps = Omit<
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
  className = "",
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
  const selectedOption = normalisedOptions.find(
    (option) => option.value === selectedValue
  );
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
    const currentIndex = enabledOptions.findIndex(
      (option) => option.value === selectedValue
    );
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (currentIndex + direction + enabledOptions.length) %
          enabledOptions.length;
    commitValue(enabledOptions[nextIndex].value);
    setOpen(true);
  }

  return (
    <div className={cn("grid gap-2 text-left", className)} ref={wrapperRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[var(--form-label-color,#1a2a40)] text-sm font-extrabold leading-tight tracking-tight select-none"
        >
          {label}
        </label>
      )}

      <div className="relative grid">
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
          className={cn(
            "w-full min-h-[50px] sm:min-h-[54px] rounded-[18px] border border-[var(--form-control-border,#e1e7ea)] px-4 pr-11 bg-[var(--form-control-bg,#ffffff)] text-[var(--form-control-color,#1a2a40)] font-sans text-sm sm:text-[15px] flex items-center justify-between text-left cursor-pointer transition-all duration-150 hover:border-[rgba(26,42,64,0.18)] focus:outline-none focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-4 focus:ring-[rgba(26,122,119,0.12)] disabled:cursor-not-allowed disabled:opacity-60",
            open &&
              "border-[var(--pex-keppel,#1a7a77)] ring-4 ring-[rgba(26,122,119,0.12)]",
            !hasSelection && "text-[rgba(77,90,93,0.48)]",
            error &&
              "border-[var(--color-danger,#b91c1c)] focus:border-[var(--color-danger,#b91c1c)] ring-4 ring-[rgba(185,28,28,0.1)]"
          )}
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
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedOption?.label ?? placeholder}
          </span>
        </button>

        <span
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--pex-text-muted,#4d5a5d)] transition-transform duration-200",
            open && "rotate-180 text-[var(--pex-keppel,#1a7a77)]"
          )}
          aria-hidden="true"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>

        {open ? (
          <div
            id={listboxId}
            className="absolute z-[200] top-[calc(100%+8px)] left-0 right-0 grid gap-1.5 max-h-[min(320px,56vh)] overflow-auto p-2 border border-[rgba(9,119,113,0.16)] rounded-[14px] bg-gradient-to-b from-[rgba(239,250,249,0.96)] to-[rgba(255,255,255,0.98)] shadow-[0_18px_42px_rgba(15,35,58,0.14)] backdrop-blur-sm"
            role="listbox"
          >
            {normalisedOptions.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  className={cn(
                    "flex items-center justify-between gap-3 w-full min-h-[44px] rounded-xl px-3.5 py-2.5 bg-transparent text-[var(--pex-text,#172326)] font-bold text-sm sm:text-[15px] text-left cursor-pointer transition-all duration-150 hover:bg-[rgba(224,244,244,0.74)] hover:border-[rgba(9,119,113,0.24)] focus-visible:outline-none focus-visible:bg-[rgba(224,244,244,0.74)] disabled:opacity-50 disabled:cursor-not-allowed",
                    selected &&
                      "bg-[rgba(26,122,119,0.1)] text-[var(--pex-keppel,#1a7a77)] shadow-[inset_4px_0_0_var(--pex-keppel,#1a7a77)] border border-[rgba(9,119,113,0.28)]"
                  )}
                  onClick={() => commitValue(option.value)}
                >
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {option.label}
                  </span>
                  {selected ? (
                    <span
                      className="rounded-full px-2 py-0.5 bg-[rgba(9,119,113,0.1)] text-[var(--pex-keppel,#1a7a77)] text-[0.72rem] font-bold"
                      aria-hidden="true"
                    >
                      Selected
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {error && (
        <span
          id={errorId}
          className="m-0 text-[var(--color-danger,#b91c1c)] text-xs sm:text-[13px] font-extrabold leading-normal"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
