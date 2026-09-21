"use client";

import { Check, ChevronDown } from "lucide-react";
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
          className="text-pex-navy text-sm font-extrabold leading-tight tracking-tight select-none"
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
            "w-full h-11 min-h-11 rounded-xl border border-pex-border px-4 pr-11 bg-white text-pex-navy font-sans text-sm sm:text-[15px] flex items-center justify-between text-left cursor-pointer transition-all duration-150 hover:border-pex-navy/20 focus:outline-none focus:border-pex-keppel focus:ring-4 focus:ring-pex-keppel/15 disabled:cursor-not-allowed disabled:opacity-60",
            open &&
              "border-pex-keppel ring-4 ring-pex-keppel/15",
            !hasSelection && "text-pex-muted/50",
            error &&
              "border-destructive focus:border-destructive ring-4 ring-destructive/10"
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
            "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-pex-muted transition-transform duration-200",
            open && "rotate-180 text-pex-keppel"
          )}
          aria-hidden="true"
        >
          <ChevronDown className="size-full" strokeWidth={2} aria-hidden="true" />
        </span>

        {open ? (
          <div
            id={listboxId}
            className="absolute z-[200] top-[calc(100%+8px)] left-0 right-0 grid gap-1.5 max-h-[min(320px,56vh)] overflow-auto p-2 border border-pex-keppel/20 rounded-[14px] bg-gradient-to-b from-white/95 to-white shadow-dropdown backdrop-blur-sm"
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
                    "flex items-center justify-between gap-3 w-full min-h-[44px] rounded-xl px-3.5 py-2.5 bg-transparent text-foreground font-bold text-sm sm:text-[15px] text-left cursor-pointer transition-all duration-150 hover:bg-pex-keppel/10 hover:border-pex-keppel/20 focus-visible:outline-none focus-visible:bg-pex-keppel/10 disabled:opacity-50 disabled:cursor-not-allowed",
                    selected &&
                      "bg-pex-keppel/10 text-pex-keppel shadow-[inset_4px_0_0_var(--color-pex-keppel)] border border-pex-keppel/30"
                  )}
                  onClick={() => commitValue(option.value)}
                >
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {option.label}
                  </span>
                  {selected ? (
                    <span
                      className="rounded-full px-2 py-0.5 bg-pex-keppel/10 text-pex-keppel text-[0.72rem] font-bold"
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
          className="m-0 text-destructive text-xs sm:text-[13px] font-extrabold leading-normal"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
