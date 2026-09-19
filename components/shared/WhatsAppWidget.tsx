"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppHref } from "@/data/contact";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import { cn } from "@/lib/utils";

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
      className={cn(
        "fixed z-[80] right-[max(14px,env(safe-area-inset-right))] sm:right-[18px] bottom-[max(14px,env(safe-area-inset-bottom))] sm:bottom-[18px] flex flex-col items-end pointer-events-none transition-all duration-350 ease-out",
        show
          ? "opacity-100 translate-y-0 visible pointer-events-auto"
          : "opacity-0 translate-y-5 invisible pointer-events-none"
      )}
      aria-hidden={!show}
    >
      <div
        ref={popupRef}
        className={cn(
          "absolute bottom-[68px] right-0 w-[min(292px,calc(100vw-28px))] sm:w-[min(300px,calc(100vw-32px))] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-5 pointer-events-none"
        )}
        tabIndex={-1}
      >
        <div className="bg-[#128C7E] text-white p-4 flex justify-between items-start">
          <div className="flex flex-col [&_strong]:text-base [&_strong]:font-semibold [&_span]:text-xs [&_span]:opacity-90 [&_span]:mt-1">
            <strong>Pexpacks Support</strong>
            <span>Typically replies in a few minutes</span>
          </div>
          <button
            className="bg-transparent border-0 text-white cursor-pointer p-1 opacity-80 transition-opacity hover:opacity-100"
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
        <div className="py-5 px-4 bg-[#efeae2] relative">
          <div className="bg-white py-3 px-4 rounded-[8px_8px_8px_0] text-sm leading-snug text-[#333333] relative shadow-[0_1px_2px_rgba(0,0,0,0.1)] inline-block max-w-[90%] before:content-[''] before:absolute before:-left-2 before:top-0 before:w-0 before:h-0 before:border-t-[8px] before:border-t-white before:border-l-[8px] before:border-l-transparent">
            Hi there! Need help finding your school list or placing an order?
          </div>
        </div>
        <div className="p-4 bg-white flex justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white no-underline font-semibold text-sm py-2.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all w-full hover:brightness-110 hover:bg-[#128C7E] hover:-translate-y-0.5"
            onClick={() => setIsOpen(false)}
          >
            <WhatsAppIcon size={18} />
            Start Chat
          </a>
        </div>
      </div>

      <button
        className={cn(
          "w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-[#25D366] text-white border-0 shadow-[0_12px_24px_rgba(26,42,64,0.18)] cursor-pointer flex items-center justify-center pointer-events-auto transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,42,64,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-4 active:translate-y-0",
          hasAnimated && "animate-[heartbeat_1s_ease-in-out]"
        )}
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

