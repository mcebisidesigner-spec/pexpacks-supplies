"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppHref } from "@/data/contact";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import styles from "./WhatsAppWidget.module.css";

export function WhatsAppWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap({
    isOpen,
    dialogRef: popupRef,
    onClose: () => setIsOpen(false),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    function handleScroll() {
      const scrolled = window.scrollY > 400;
      setIsScrolled(scrolled);
      if (scrolled && !hasAnimated) {
        setHasAnimated(true);
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted, hasAnimated]);

  useEffect(() => {
    if (!mounted) return;

    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const footerVisible = entry.isIntersecting;
        setIsFooterVisible(footerVisible);

        if (footerVisible) {
          setIsOpen(false);
        }
      },
      { threshold: 0.02 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  const waUrl = buildWhatsAppHref(
    "Hi Pexpacks, I need some help with my stationery pack."
  );
  if (!waUrl) return null;

  const show = isScrolled && !isFooterVisible;

  return (
    <div
      className={[
        styles.widgetContainer,
        show ? styles.visible : styles.hidden,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!show}
    >
      <div
        ref={popupRef}
        className={[styles.chatPopup, isOpen ? styles.open : ""]
          .filter(Boolean)
          .join(" ")}
        tabIndex={-1}
      >
        <div className={styles.popupHeader}>
          <div className={styles.headerInfo}>
            <strong>Pexpacks Support</strong>
            <span>Typically replies in a few minutes</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className={styles.popupBody}>
          <div className={styles.chatBubble}>
            Hi there! Need help finding your school list or placing an order?
          </div>
        </div>
        <div className={styles.popupFooter}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.startChatBtn}
            onClick={() => setIsOpen(false)}
          >
            <WhatsAppIcon size={18} />
            Start Chat
          </a>
        </div>
      </div>

      <button
        className={[
          styles.fab,
          hasAnimated ? styles.heartbeat : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp Support"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <WhatsAppIcon size={26} />
        )}
      </button>
    </div>
  );
}

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
