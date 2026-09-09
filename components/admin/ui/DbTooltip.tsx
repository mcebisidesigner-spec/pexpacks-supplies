"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./DbTooltip.module.css";

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
    // Convert native title to data-db-tooltip across a node tree to eliminate default OS tooltips
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

    // Observe dynamic elements to seamlessly intercept any newly added title attributes
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

    // Defer mounting until the hydration pass has fully settled. Stripping
    // `title` attributes (or reacting to React's own DOM writes) while React is
    // still hydrating makes React see different attributes than it rendered,
    // which produces hydration-mismatch errors for every button involved.
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
        <div className={styles.tipContentGroup}>
          <span className={styles.tipTitle}>{title}</span>
          <span className={styles.tipHint}>{hint}</span>
        </div>
      );
    }
    return <span className={styles.tipTitle}>{text}</span>;
  };

  return tip ? (
    <div
      ref={tipRef}
      role="tooltip"
      className={`${styles.tooltip} ${ready ? styles.visible : ""}`}
    >
      <span
        ref={caretRef}
        className={`${styles.caret} ${
          placement === "top" ? styles.caretBottom : styles.caretTop
        }`}
      />
      {renderTipContent(tip)}
    </div>
  ) : null;
}
