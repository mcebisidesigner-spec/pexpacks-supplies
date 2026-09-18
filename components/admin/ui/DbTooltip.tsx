"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GAP = 9;
const EDGE = 10;

export function DbTooltipHost() {
  const [tip, setTip] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const [ready, setReady] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (!tip) {
      setReady(false);
      return;
    }
    const node = tipRef.current;
    const el = targetRef.current;
    if (!node || !el) return;

    const rect = el.getBoundingClientRect();
    const meas = node.getBoundingClientRect();
    const targetCenterX = rect.left + rect.width / 2;

    const left = Math.min(
      Math.max(EDGE, targetCenterX - meas.width / 2),
      Math.max(EDGE, window.innerWidth - meas.width - EDGE),
    );

    const below = rect.bottom + GAP + meas.height <= window.innerHeight - EDGE;
    const top = below
      ? rect.bottom + GAP
      : Math.max(EDGE, rect.top - meas.height - GAP);

    node.style.left = `${left}px`;
    node.style.top = `${top}px`;

    if (caretRef.current) {
      const caretOffset = Math.min(
        Math.max(12, targetCenterX - left),
        meas.width - 12,
      );
      caretRef.current.style.left = `${caretOffset}px`;
    }

    setPlacement(below ? "bottom" : "top");
    setReady(true);
  }, [tip]);

  useEffect(() => {
    const sanitizeTitles = (root: ParentNode = document) => {
      try {
        const titledEls = root.querySelectorAll?.("[title]");
        titledEls?.forEach((el) => {
          const raw = el.getAttribute("title");
          if (raw && raw.trim()) {
            el.setAttribute("data-db-tooltip", raw.trim());
            el.removeAttribute("title");
          }
        });
      } catch {
        // Safe failover
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          m.attributeName === "title" &&
          m.target instanceof Element
        ) {
          const raw = m.target.getAttribute("title");
          if (raw && raw.trim()) {
            m.target.setAttribute("data-db-tooltip", raw.trim());
            m.target.removeAttribute("title");
          }
        } else if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              sanitizeTitles(node);
            }
          });
        }
      }
    });

    const extractTooltipText = (el: Element): string | null => {
      const dbTip = el.getAttribute("data-db-tooltip");
      if (dbTip && dbTip.trim()) return dbTip.trim();

      const genericTip = el.getAttribute("data-tooltip");
      if (genericTip && genericTip.trim()) return genericTip.trim();

      const rawTitle = el.getAttribute("title");
      if (rawTitle && rawTitle.trim()) {
        const cleaned = rawTitle.trim();
        el.setAttribute("data-db-tooltip", cleaned);
        el.removeAttribute("title");
        return cleaned;
      }

      return null;
    };

    const hasTooltip = (node: EventTarget | null): Element | null => {
      if (!(node instanceof Element)) return null;
      return (
        node.closest?.("[data-db-tooltip], [data-tooltip], [title]") ?? null
      );
    };

    const show = (el: Element) => {
      const text = extractTooltipText(el);
      if (!text) return;
      targetRef.current = el;
      setTip(text);
    };

    const hide = () => {
      targetRef.current = null;
      setTip(null);
    };

    const onMouseOver = (ev: MouseEvent) => {
      const el = hasTooltip(ev.target);
      if (el) {
        if (el !== targetRef.current) show(el);
        return;
      }
      if (targetRef.current) hide();
    };

    const onMouseOut = (ev: MouseEvent) => {
      const from = hasTooltip(ev.target);
      const to = ev.relatedTarget ? hasTooltip(ev.relatedTarget) : null;
      if (from && to === from) return;
      if (to) {
        if (to !== targetRef.current) show(to);
        return;
      }
      hide();
    };

    const onFocusIn = (ev: FocusEvent) => {
      const el = hasTooltip(ev.target);
      if (el) show(el);
    };

    const onFocusOut = (ev: FocusEvent) => {
      const next = ev.relatedTarget ? hasTooltip(ev.relatedTarget) : null;
      if (!next) hide();
    };

    const install = () => {
      sanitizeTitles();
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["title"],
      });
      document.addEventListener("mouseover", onMouseOver, true);
      document.addEventListener("mouseout", onMouseOut, true);
      document.addEventListener("focusin", onFocusIn, true);
      document.addEventListener("focusout", onFocusOut, true);
    };

    const idle = window.setTimeout(install, 500);

    return () => {
      window.clearTimeout(idle);
      observer.disconnect();
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("mouseout", onMouseOut, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
    };
  }, []);

  const renderTipContent = (text: string) => {
    if (text.includes(" — ")) {
      const [title, hint] = text.split(" — ");
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--db-text-primary,#f8fafc)] font-semibold text-[11.5px]">
            {title}
          </span>
          <span className="text-emerald-400 text-[10.5px] font-medium tracking-wide opacity-95">
            {hint}
          </span>
        </div>
      );
    }
    return (
      <span className="text-[var(--db-text-primary,#f8fafc)] font-semibold text-[11.5px]">
        {text}
      </span>
    );
  };

  return tip ? (
    <div
      ref={tipRef}
      role="tooltip"
      className={cn(
        "fixed z-[99999] pointer-events-none box-border max-w-[320px] px-2.5 py-1.5 bg-[#0c1322]/96 border border-emerald-500/40 rounded-md text-[var(--db-text-primary,#f8fafc)] font-inherit text-xs leading-tight font-medium tracking-wide whitespace-normal shadow-[0_12px_30px_-4px_rgba(2,6,23,0.85),0_0_14px_rgba(16,185,129,0.18)] backdrop-blur-md opacity-0 invisible translate-y-1 scale-95 transition-all duration-150",
        ready && "opacity-100 visible translate-y-0 scale-100",
      )}
    >
      <span
        ref={caretRef}
        className={cn(
          "absolute w-[7px] h-[7px] -translate-x-1/2 rotate-45 bg-[#0c1322] box-border",
          placement === "top"
            ? "-bottom-1 border-t-0 border-l-0 border-r border-b border-emerald-500/40"
            : "-top-1 border-b-0 border-r-0 border-l border-t border-emerald-500/40",
        )}
      />
      {renderTipContent(tip)}
    </div>
  ) : null;
}
