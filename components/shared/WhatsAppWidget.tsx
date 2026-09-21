"use client";

import { MessageCircle, X } from "lucide-react";
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
            <X className="size-5" strokeWidth={2} aria-hidden="true" />
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
            <MessageCircle className="size-[18px]" strokeWidth={2} aria-hidden="true" />
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
          <X className="size-[22px]" strokeWidth={2} aria-hidden="true" />
        ) : (
          <MessageCircle className="size-[26px]" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
