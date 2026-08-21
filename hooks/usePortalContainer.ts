import { useEffect, useRef } from "react";
import { initDomRemovalGuard } from "@/lib/dom-guard";

/**
 * Creates a stable DOM container element appended to document.body.
 * Used as a portal target to avoid the removeChild error that occurs
 * when createPortal targets document.body directly and React tries
 * to clean up during unmount/navigation.
 */
export function usePortalContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initDomRemovalGuard();

    const el = document.createElement("div");
    el.setAttribute("data-portal", "");
    document.body.appendChild(el);
    containerRef.current = el;

    return () => {
      try {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        } else if (el && typeof el.remove === "function") {
          el.remove();
        }
      } catch {
        // Safe fallback for unmount DOM node cleanup
      }
      containerRef.current = null;
    };
  }, []);

  return containerRef;
}
