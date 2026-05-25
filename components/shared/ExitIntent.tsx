"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./ExitIntent.module.css";

const STORAGE_KEY = "pex-exit-intent-dismissed";

export function ExitIntent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    let timer: ReturnType<typeof setTimeout>;
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      timer = setTimeout(() => {
        setShow(false);
      }, 60000);
      setShow(true);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={dismiss}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={dismiss} aria-label="Close">
          &times;
        </button>
        <div className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h2 className={styles.title}>Don&rsquo;t forget your pack!</h2>
        <p className={styles.text}>
          Find your school, pick the grade, and get the exact stationery pack
          delivered before school opens.
        </p>
        <div className={styles.actions}>
          <Button href="/schools" variant="white" size="lg" onClick={dismiss}>
            Find Your School Pack
          </Button>
          <Button href="/office" variant="primary" size="lg" onClick={dismiss}>
            View Office Packs
          </Button>
        </div>
        <p className={styles.muted}>
          No spam. Just one-click access to your pack.
        </p>
      </div>
    </div>
  );
}
