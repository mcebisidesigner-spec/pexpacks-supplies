"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./DateField.module.css";

type DateFieldMode = "date" | "datetime-local";

interface DateFieldProps {
  name: string;
  id?: string;
  defaultValue?: string;
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
  name,
  id,
  defaultValue = "",
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
  const initialDate = parseDate(defaultValue);
  const initialTime = parseTime(defaultValue);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState<Date | null>(initialDate);
  const [viewMonth, setViewMonth] = useState(
    initialDate ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);

  const [alignRight, setAlignRight] = useState(false);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        setAlignRight(rect.left + 340 > window.innerWidth);
      }
    };
    updatePosition();

    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    return Array.from(
      { length: 42 },
      (_, index) => new Date(year, month, 1 - firstWeekday + index),
    );
  }, [viewMonth]);

  const openCalendar = () => {
    const selected = parseDate(value);
    setDraft(selected);
    if (selected) setViewMonth(selected);
    const time = parseTime(value);
    setHour(time.hour);
    setMinute(time.minute);
    setOpen((current) => !current);
  };

  const apply = () => {
    if (!draft) return;
    const dateValue = toDateValue(draft);
    setValue(
      mode === "datetime-local"
        ? `${dateValue}T${clamp(hour, 0, 23)}:${clamp(minute, 0, 59)}`
        : dateValue,
    );
    setOpen(false);
  };

  const clear = () => {
    setValue("");
    setDraft(null);
    setOpen(false);
  };

  const selectToday = () => {
    const today = new Date();
    setDraft(today);
    setViewMonth(today);
  };

  const isDisabled = (date: Date) => {
    const candidate = toDateValue(date);
    return Boolean(
      (min && candidate < min.slice(0, 10)) ||
      (max && candidate > max.slice(0, 10)),
    );
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        id={triggerId}
        type="button"
        className={`${styles.trigger} ${value ? styles.hasValue : ""} ${className}`}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={openCalendar}
      >
        <CalendarDays aria-hidden="true" />
        <span>{value ? formatValue(value, mode) : placeholder}</span>
      </button>

      {open ? (
        <div
          id={dialogId}
          className={`${styles.popover} ${alignRight ? styles.alignRight : ""}`}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel ?? "Choose date"}
        >
          <div className={styles.brandRow}>
            <span>
              <strong>Pexpacks</strong> Calendar
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close calendar"
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <div className={styles.monthRow}>
            <button
              type="button"
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
              <ChevronLeft aria-hidden="true" />
            </button>
            <strong>
              {new Intl.DateTimeFormat("en-ZA", {
                month: "long",
                year: "numeric",
              }).format(viewMonth)}
            </strong>
            <button
              type="button"
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
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className={styles.grid} role="grid">
            {days.map((date) => {
              const dateValue = toDateValue(date);
              const selected = draft ? dateValue === toDateValue(draft) : false;
              const today = dateValue === toDateValue(new Date());
              const outside = date.getMonth() !== viewMonth.getMonth();
              return (
                <button
                  key={dateValue}
                  type="button"
                  role="gridcell"
                  className={`${outside ? styles.outside : ""} ${today ? styles.today : ""} ${selected ? styles.selected : ""}`}
                  disabled={isDisabled(date)}
                  aria-selected={selected}
                  onClick={() => {
                    setDraft(date);
                    if (outside) setViewMonth(date);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {mode === "datetime-local" ? (
            <div className={styles.timeRow}>
              <span>Time</span>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(event) => setHour(event.target.value)}
                aria-label="Hour"
              />
              <strong>:</strong>
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(event) => setMinute(event.target.value)}
                aria-label="Minute"
              />
            </div>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.textButton}
              onClick={selectToday}
            >
              Today
            </button>
            {!required ? (
              <button
                type="button"
                className={styles.textButton}
                onClick={clear}
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              className={styles.applyButton}
              onClick={apply}
              disabled={!draft}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
