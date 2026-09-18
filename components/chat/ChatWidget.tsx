"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackCtaClicked, trackWhatsAppClicked } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SUPPORT_PHONE = "27780036048";
const CHATBOT_LOGO = "/images/chatbot.webp";

const ESCALATION_PATTERNS = [
  /how\s+mu(?:ch|sh|st)/i,
  /\bhow\s+expensive\b/i,
  /\bprice\b/i,
  /\bpricing\b/i,
  /\bcost\b/i,
  /\bcosts\b/i,
  /\bquote\b/i,
  /\bquotation\b/i,
  /\brate\b/i,
  /\bamount\b/i,
  /\bdiscount\b/i,
  /\bbulk\b/i,
  /\bcustom list\b/i,
  /\bschool list\b/i,
  /\bunlisted\b/i,
  /\bnot listed\b/i,
  /\bsend.*list\b/i,
  /\bupload.*list\b/i,
  /\bspecial order\b/i,
  /\bwholesale\b/i,
];

interface CommerceAction {
  id: string;
  title: string;
  desc: string;
  href: string;
  badge: string;
  icon: "pack" | "track" | "upload" | "happypay";
}

function getCommerceActions(text: string): CommerceAction[] {
  const actions: CommerceAction[] = [];
  const lower = text.toLowerCase();

  if (/schools|find.*pack|packs finder|catalogue/i.test(lower)) {
    actions.push({
      id: "browse-packs",
      title: "Browse School Packs",
      desc: "Find teacher-approved stationery packs by grade",
      href: "/schools",
      badge: "Browse",
      icon: "pack",
    });
  }

  if (/track-order|track.*order|courier|paxi|delivery status/i.test(lower)) {
    actions.push({
      id: "track-order",
      title: "Track Order Status",
      desc: "Live courier & Paxi counter parcel lookup",
      href: "/track-order",
      badge: "Track",
      icon: "track",
    });
  }

  if (/upload.*list|custom.*list|send.*list|not listed/i.test(lower)) {
    actions.push({
      id: "upload-list",
      title: "Upload Stationery List",
      desc: "We pack your stationery with 100% list match guarantee",
      href: "/order",
      badge: "Upload",
      icon: "upload",
    });
  }

  if (/happy\s*pay|pay.*later|instalment/i.test(lower)) {
    actions.push({
      id: "happy-pay",
      title: "Happy Pay (Pay in 2)",
      desc: "0% interest: 50% today & 50% in 30 days",
      href: "/happy-pay",
      badge: "Details",
      icon: "happypay",
    });
  }

  return actions;
}

function renderFormattedContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} style={{ height: 6 }} />;
    }

    const isBullet =
      trimmed.startsWith("•") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ");
    const content = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : line;

    // Parse **bold** fragments
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    const renderedParts = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={partIdx} style={{ color: "#0f172a", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div
          key={lineIdx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
            margin: "3px 0",
          }}
        >
          <span style={{ color: "#147f78", fontWeight: 700, lineHeight: 1.3 }}>
            •
          </span>
          <span style={{ flex: 1, lineHeight: 1.45 }}>{renderedParts}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} style={{ margin: "0 0 6px 0", lineHeight: 1.45 }}>
        {renderedParts}
      </p>
    );
  });
}

function getMessageText(message: {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (typeof message.content === "string" && message.content.length > 0) {
    return message.content;
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (p): p is { type: "text"; text: string } =>
          p.type === "text" && typeof p.text === "string",
      )
      .map((p) => p.text)
      .join("");
  }
  return "";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  // Hide over footer for both Desktop and Mobile devices
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsFooterVisible(visible);
        if (visible) {
          setIsOpen(false);
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 40px 0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const latestUserMessage = useMemo(() => {
    const userMsg = [...messages].reverse().find((m) => m.role === "user");
    return userMsg ? getMessageText(userMsg).trim() : "";
  }, [messages]);

  const needsHumanHelp = useMemo(() => {
    if (!latestUserMessage) return false;
    return ESCALATION_PATTERNS.some((pattern) => pattern.test(latestUserMessage));
  }, [latestUserMessage]);

  function getWhatsAppUrl(message?: string) {
    const context =
      message ||
      latestUserMessage ||
      "I am browsing the Pexpacks website and need some assistance.";

    const text = [
      "Hi Pexpacks 👋",
      "",
      "I was chatting with Pex and would like some help.",
      "",
      `My question: ${context}`,
    ].join("\n");

    return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`;
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const textToSend = input.trim();
    setInput("");
    void sendMessage({ text: textToSend });
  }

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[1000] font-sans transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isFooterVisible && "opacity-0 translate-y-6 pointer-events-none invisible !opacity-0 !translate-y-6 !pointer-events-none !invisible"
      )}
      aria-hidden={isFooterVisible}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask Pex Assistant"
          className="flex items-center gap-3 rounded-full bg-[#17324d] py-2 pr-5 pl-2 text-white shadow-[0_12px_40px_rgba(15,23,42,0.24)] border-0 cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,23,42,0.32)] active:translate-y-0"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#147f78] text-white shrink-0 overflow-hidden">
            <Image
              src={CHATBOT_LOGO}
              alt="Pex"
              width={44}
              height={44}
              className="w-full h-full object-cover rounded-full block"
              priority
            />
          </span>

          <span className="flex flex-col">
            <span className="text-sm font-semibold leading-[1.25] text-white">Ask Pex</span>
            <span className="text-[11px] text-slate-300 leading-[1.2]">I&apos;m here to help</span>
          </span>
        </button>
      ) : (
        <section className="flex flex-col w-[390px] max-w-[calc(100vw-24px)] h-[600px] max-h-[calc(100vh-36px)] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] animate-[chatSlideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]" aria-label="Pex Assistant">
          {/* Header */}
          <header className="flex items-center justify-between bg-[#17324d] py-3.5 px-4 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-full bg-[#147f78] shrink-0">
                <Image
                  src={CHATBOT_LOGO}
                  alt="Pex"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover rounded-full block"
                />
              </div>

              <div>
                <h3 className="m-0 text-sm font-semibold text-white leading-tight">Ask Pex</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-[11px] text-slate-300">Online · replies instantly</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask Pex Assistant"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent border-0 text-slate-300 cursor-pointer transition-colors hover:bg-white/12 hover:text-white"
            >
              <CloseIcon size={18} />
            </button>
          </header>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 flex flex-col gap-3.5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
            {/* Always show welcome greeting as the opening message */}
            <div className="flex w-full justify-start items-start gap-2.5">
              <AssistantAvatar />

              <div className="max-w-[82%] py-2.5 px-3.5 text-[13.5px] leading-[1.45] rounded-[18px_18px_18px_4px] border border-slate-200 bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] break-words [&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0">
                <p className="font-semibold text-slate-900 mb-1">Hi there 👋</p>
                <p>I&apos;m Pex your assistant, at your service.</p>
              </div>
            </div>

            {messages.map((message) => {
              const isUser = message.role === "user";
              const text = getMessageText(message);

              if (!text && !isUser) return null;

              const commerceActions = !isUser ? getCommerceActions(text) : [];

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    isUser ? "justify-end" : "justify-start items-start gap-2.5"
                  )}
                >
                  {!isUser && <AssistantAvatar />}

                  <div className={isUser ? "max-w-[82%] py-2.5 px-3.5 text-[13.5px] leading-[1.45] rounded-[18px_18px_4px_18px] bg-[#147f78] text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] break-words whitespace-pre-wrap" : "max-w-[82%] py-2.5 px-3.5 text-[13.5px] leading-[1.45] rounded-[18px_18px_18px_4px] border border-slate-200 bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] break-words [&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0"}>
                    {isUser ? text : renderFormattedContent(text)}

                    {/* Contextual Commerce Action Cards */}
                    {commerceActions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {commerceActions.map((act) => (
                          <Link
                            key={act.id}
                            href={act.href}
                            onClick={() => {
                              trackCtaClicked({
                                sourcePath:
                                  typeof window !== "undefined"
                                    ? window.location.pathname
                                    : "",
                                destination: act.href,
                                label: `Chat: ${act.title}`,
                              });
                              setIsOpen(false);
                            }}
                            className="flex items-center justify-between gap-2.5 rounded-[14px] border border-slate-200 bg-slate-50 py-2.5 px-3 transition-all duration-150 no-underline cursor-pointer hover:border-[#147f78] hover:bg-teal-50/50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,127,120,0.08)]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#147f78] text-white">
                                <ActionIcon type={act.icon} size={16} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[12.5px] font-semibold text-slate-900 leading-snug">
                                  {act.title}
                                </span>
                                <span className="text-[11px] text-slate-500 leading-tight">
                                  {act.desc}
                                </span>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[11.5px] font-semibold text-[#147f78] shrink-0">
                              {act.badge} &rarr;
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex w-full justify-start items-start gap-2.5">
                <AssistantAvatar />
                <div className="flex items-center gap-1 py-2.5 px-3.5 rounded-[18px_18px_18px_4px] border border-slate-200 bg-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-[typingPulse_1.2s_infinite_ease-in-out]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-[typingPulse_1.2s_infinite_ease-in-out] [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-[typingPulse_1.2s_infinite_ease-in-out] [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex w-full justify-start items-start gap-2.5">
                <AssistantAvatar />
                <div
                  className="max-w-[82%] py-2.5 px-3.5 text-[13.5px] leading-[1.45] rounded-[18px_18px_18px_4px] border border-red-200 bg-red-50 text-red-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] break-words"
                >
                  <p className="m-0 text-red-800">
                    I&apos;m having trouble connecting right now. Please feel free to tap below to chat with our team on WhatsApp!
                  </p>
                </div>
              </div>
            )}

            {/* Smart human-support escalation card */}
            {needsHumanHelp && (
              <div className="ml-[42px] rounded-[18px] border border-green-200 bg-green-50/70 p-3.5 flex flex-col gap-2.5 shadow-[0_1px_3px_rgba(34,197,94,0.08)]">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <WhatsAppIcon size={18} />
                  </div>

                  <div>
                    <p className="m-0 text-[13.5px] font-semibold text-slate-900">Need pricing or custom help?</p>
                    <p className="m-0 mt-1 text-[11.5px] leading-relaxed text-slate-600">
                      Our team can help with quotations, special pricing, custom lists, and
                      requests that need human care.
                    </p>
                  </div>
                </div>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackWhatsAppClicked({
                      sourcePath:
                        typeof window !== "undefined"
                          ? window.location.pathname
                          : "",
                      label: "chat_assistant_escalation_card",
                    });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 px-3.5 text-[12.5px] font-semibold text-white no-underline transition-all hover:brightness-95 hover:-translate-y-0.5"
                >
                  <WhatsAppIcon size={18} />
                  Chat with us on WhatsApp
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleFormSubmit} className="border-t border-slate-200 bg-white py-2.5 px-3 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-1 pr-1.5 pl-3 transition-all focus-within:border-[#147f78] focus-within:ring-2 focus-within:ring-[#147f78]/20">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Pex anything..."
                className="flex-1 min-w-0 border-0 bg-transparent py-2 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#ff6b57] text-white border-0 cursor-pointer transition-all hover:not-disabled:brightness-95 hover:not-disabled:scale-105 disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <SendIcon size={16} />
              </button>
            </div>
          </form>

          {/* Permanent WhatsApp fallback */}
          <footer className="flex items-center justify-between border-t border-slate-200 bg-white py-2 px-4 text-[11.5px] shrink-0">
            <span className="text-slate-500">Prefer a real person?</span>

            <a
              href={getWhatsAppUrl(
                "I am browsing the Pexpacks website and need some assistance.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsAppClicked({
                  sourcePath:
                    typeof window !== "undefined" ? window.location.pathname : "",
                  label: "chat_assistant_footer",
                });
              }}
              className="flex items-center gap-1.5 font-semibold text-emerald-700 no-underline hover:underline transition-all"
            >
              <WhatsAppIcon size={14} />
              Chat with us on WhatsApp
            </a>
          </footer>
        </section>
      )}
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#147f78] overflow-hidden mt-0.5">
      <Image
        src={CHATBOT_LOGO}
        alt="Pex"
        width={32}
        height={32}
        className="w-full h-full object-cover rounded-full block"
      />
    </div>
  );
}

function ActionIcon({
  type,
  size = 16,
}: {
  type: "pack" | "track" | "upload" | "happypay";
  size?: number;
}) {
  if (type === "pack") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    );
  }
  if (type === "track") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10h2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    );
  }
  if (type === "happypay") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.813 3.179 0 5.766-2.587 5.766-5.766-.001-3.18-2.588-5.766-5.766-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.745 0-3.376-.45-4.802-1.236l-5.198 1.364 1.391-5.076c-.878-1.488-1.391-3.218-1.391-5.052 0-5.518 4.482-10 10-10s10 4.482 10 10z" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

