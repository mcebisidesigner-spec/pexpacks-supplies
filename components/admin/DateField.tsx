"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DateFieldMode = "date" | "datetime-local";

export interface DateFieldProps {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  required?: boolean;
  min?: string;
  max?: string;
  mode?: DateFieldMode;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTime(value?: string) {
  const match = value?.match(/T(\d{2}):(\d{2})/);
  return { hour: match?.[1] ?? "09", minute: match?.[2] ?? "00" };
}

function clamp(value: string, min: number, max: number) {
  const parsed = Number(value);
  return pad(
    Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : min)),
  );
}

function formatValue(value: string, mode: DateFieldMode) {
  const date = parseDate(value);
  if (!date) return "";
  const formatted = new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  return mode === "datetime-local"
    ? `${formatted}, ${parseTime(value).hour}:${parseTime(value).minute}`
    : formatted;
}

export function DateField({
  name = "date",
  id,
  value: controlledValue,
  defaultValue = "",
  onChange,
  className = "",
  placeholder = "Select date",
  ariaLabel,
  required = false,
  min,
  max,
  mode = "date",
}: DateFieldProps) {
  const generatedId = useId();
  const triggerId = id ?? `admin-date-${generatedId.replaceAll(":", "")}`;
  const dialogId = `${triggerId}-calendar`;
  const rootRef = useRef<HTMLDivElement>(null);

  const initialVal =
    controlledValue !== undefined ? controlledValue : defaultValue;
  const [internalValue, setInternalValue] = useState(initialVal);
  const currentValue =
    controlledValue !== undefined ? controlledValue : internalValue;

  const initialDate = parseDate(currentValue);
  const initialTime = parseTime(currentValue);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(initialDate);
  const [viewMonth, setViewMonth] = useState(
    initialDate ??
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
      const parsed = parseDate(controlledValue);
      setDraft(parsed);
      if (parsed) setViewMonth(parsed);
      const time = parseTime(controlledValue);
      setHour(time.hour);
      setMinute(time.minute);
    }
  }, [controlledValue]);

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const dates: Date[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevMonthDays - i));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    const remaining = (7 - (dates.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    return dates;
  }, [viewMonth]);

  const openCalendar = () => {
    const selected = parseDate(currentValue);
    setDraft(selected);
    if (selected) setViewMonth(selected);
    const time = parseTime(currentValue);
    setHour(time.hour);
    setMinute(time.minute);
    setOpen((current) => !current);
  };

  const handleSelectDate = (date: Date) => {
    setDraft(date);
    const dateValue = toDateValue(date);
    if (mode === "date") {
      setInternalValue(dateValue);
      onChange?.(dateValue);
      setOpen(false);
    }
  };

  const apply = () => {
    if (!draft) return;
    const dateValue = toDateValue(draft);
    const finalVal =
      mode === "datetime-local"
        ? `${dateValue}T${clamp(hour, 0, 23)}:${clamp(minute, 0, 59)}`
        : dateValue;
    setInternalValue(finalVal);
    onChange?.(finalVal);
    setOpen(false);
  };

  const clear = () => {
    setInternalValue("");
    setDraft(null);
    onChange?.("");
    setOpen(false);
  };

  const selectToday = () => {
    const today = new Date();
    setDraft(today);
    setViewMonth(today);
    const dateValue = toDateValue(today);
    if (mode === "date") {
      setInternalValue(dateValue);
      onChange?.(dateValue);
      setOpen(false);
    }
  };

  const isDisabled = (date: Date) => {
    const candidate = toDateValue(date);
    return Boolean(
      (min && candidate < min.slice(0, 10)) ||
        (max && candidate > max.slice(0, 10)),
    );
  };

  return (
    <div className="relative w-full" ref={rootRef}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />
      ) : null}
      <button
        id={triggerId}
        type="button"
        className={cn(
          "flex h-11 min-h-11 w-full items-center gap-3 rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 text-left font-inherit text-sm font-medium text-[var(--db-text-primary)] outline-none transition-all duration-150 cursor-pointer hover:border-[var(--db-text-subtle)] focus-visible:border-[var(--db-brand)] focus-visible:ring-4 focus-visible:ring-[var(--db-brand-subtle)]",
          currentValue ? "text-[var(--db-text-primary)] font-semibold" : "text-[var(--db-text-muted)] font-medium",
          className,
        )}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={openCalendar}
      >
        <CalendarDays
          aria-hidden="true"
          className="w-4.5 h-4.5 shrink-0 text-emerald-500"
        />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs sm:text-[13.5px]">
          {currentValue ? formatValue(currentValue, mode) : placeholder}
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[9999999] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
          aria-hidden="false"
        >
          <div
            id={dialogId}
            className="relative w-[min(340px,calc(100vw-32px))] max-w-full p-4 border border-emerald-500/50 rounded-xl bg-[#132238] shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.25)] box-border animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? "Choose date"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/80 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              <span>
                <strong className="text-emerald-400 font-extrabold">
                  Pexpacks
                </strong>{" "}
                Calendar
              </span>
              <button
                type="button"
                className="grid place-items-center w-6 h-6 rounded bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Close calendar"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-3 text-white text-sm font-bold">
              <button
                type="button"
                className="grid place-items-center w-7 h-7 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                aria-label="Previous month"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <strong>
                {new Intl.DateTimeFormat("en-ZA", {
                  month: "long",
                  year: "numeric",
                }).format(viewMonth)}
              </strong>
              <button
                type="button"
                className="grid place-items-center w-7 h-7 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                aria-label="Next month"
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
            <div
              className="grid grid-cols-7 gap-1 mb-1.5 text-center text-[10.5px] font-bold uppercase text-slate-400 tracking-wider"
              aria-hidden="true"
            >
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1" role="grid">
              {days.map((date) => {
                const dateValue = toDateValue(date);
                const selected = draft
                  ? dateValue === toDateValue(draft)
                  : false;
                const today = dateValue === toDateValue(new Date());
                const outside = date.getMonth() !== viewMonth.getMonth();
                return (
                  <button
                    key={dateValue}
                    type="button"
                    role="gridcell"
                    className={cn(
                      "h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer text-slate-200 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed",
                      outside && "text-slate-500",
                      today && "ring-1 ring-emerald-400 text-emerald-400",
                      selected &&
                        "bg-emerald-500 text-white font-bold hover:bg-emerald-600",
                    )}
                    disabled={isDisabled(date)}
                    aria-selected={selected}
                    onClick={() => handleSelectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            {mode === "datetime-local" ? (
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-700/80 text-xs font-bold text-slate-300">
                <span>Time</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(event) => setHour(event.target.value)}
                  aria-label="Hour"
                  className="w-14 h-8 px-2 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-mono outline-none focus:border-emerald-500"
                />
                <strong>:</strong>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(event) => setMinute(event.target.value)}
                  aria-label="Minute"
                  className="w-14 h-8 px-2 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-700/80">
              <button
                type="button"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer bg-transparent border-0 p-1"
                onClick={selectToday}
              >
                Today
              </button>
              {!required ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 hover:underline cursor-pointer bg-transparent border-0 p-1"
                  onClick={clear}
                >
                  Clear
                </button>
              ) : null}
              {mode === "datetime-local" ? (
                <button
                  type="button"
                  className="ml-auto px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={apply}
                  disabled={!draft}
                >
                  Apply
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
