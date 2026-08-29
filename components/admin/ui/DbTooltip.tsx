"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./DbTooltip.module.css";

const GAP = 9;
const EDGE = 10;

export function DbTooltipHost() {
  const [tip, setTip] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const [ready, setReady] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
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
    const left = Math.min(
      Math.max(EDGE, rect.left + rect.width / 2 - meas.width / 2),
      Math.max(EDGE, window.innerWidth - meas.width - EDGE),
    );
    const below = rect.bottom + GAP + meas.height <= window.innerHeight - EDGE;
    const top = below ? rect.bottom + GAP : rect.top - meas.height - GAP;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    setPlacement(below ? "bottom" : "top");
    setReady(true);
  }, [tip]);

  useEffect(() => {
    const hasTooltip = (node: EventTarget | null): Element | null => {
      if (!(node instanceof Element)) return null;
      return node.closest?.("[data-db-tooltip]") ?? null;
    };

    const show = (el: Element) => {
      const text = el.getAttribute("data-db-tooltip");
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

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return tip ? (
    <div
      ref={tipRef}
      role="tooltip"
      className={`${styles.tooltip} ${ready ? styles.visible : ""}`}
    >
      <span
        className={`${styles.caret} ${
          placement === "top" ? styles.caretTop : styles.caretBottom
        }`}
      />
      {tip}
    </div>
  ) : null;
}
