"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  MessageCircle,
  School,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { buildWhatsAppHref } from "@/data/contact";
import {
  trackPexActionSelected,
  trackPexFeedback,
  trackPexHumanHandoff,
  trackPexIntentResolved,
  trackPexRequestFailed,
  trackWhatsAppClicked,
} from "@/lib/analytics";
import type { PexChatResponse } from "@/lib/chat/pex";
import type { ActiveSession, PexEntities } from "@/lib/chat/request";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { isPexHref, PEX_ROUTES } from "@/lib/chat/links";

const CHATBOT_LOGO = "/images/chatbot.webp";
const STARTER_LINKS = [
  {
    id: "find-school",
    label: "Find my school",
    href: PEX_ROUTES.schools,
  },
  {
    id: "upload-list",
    label: "Upload a list",
    href: PEX_ROUTES.uploadList,
  },
  {
    id: "track-order",
    label: "Track an order",
    href: PEX_ROUTES.track,
  },
] as const;

type ChatMessage =
  | { id: string; role: "user"; text: string; pending?: boolean }
  | { id: string; role: "assistant"; response: PexChatResponse };

type ChatCardAction = {
  label: string;
  url: string;
  href?: string;
};

type ChatCard = {
  id?: string;
  title: string;
  badge?: string;
  price?: string;
  description: string;
  actions?: ChatCardAction[];
};

function starterLinksForPath(pathname: string | null) {
  if (pathname?.startsWith("/checkout")) {
    return [
      {
        id: "checkout-help",
        label: "Checkout help",
        href: PEX_ROUTES.checkout,
      },
      { id: "open-tray", label: "Open my tray", href: PEX_ROUTES.checkout },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: PEX_ROUTES.pexcover,
      },
    ];
  }
  if (pathname?.startsWith("/schools")) {
    return [
      {
        id: "find-pack",
        label: "Find my grade pack",
        href: PEX_ROUTES.schools,
      },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: PEX_ROUTES.pexcover,
      },
      {
        id: "upload-list",
        label: "Upload a list",
        href: PEX_ROUTES.uploadList,
      },
    ];
  }
  if (pathname?.startsWith("/track-order") || pathname?.startsWith("/track")) {
    return [
      {
        id: "track-order",
        label: "Track an order",
        href: PEX_ROUTES.track,
      },
      {
        id: "delivery",
        label: "Delivery help",
        href: PEX_ROUTES.track,
      },
      {
        id: "talk-to-team",
        label: "Talk to Pexpacks",
        href: PEX_ROUTES.contact,
      },
    ];
  }
  if (pathname?.startsWith("/order") || pathname?.startsWith("/upload-a-list")) {
    return [
      {
        id: "upload-list",
        label: "Upload a list",
        href: PEX_ROUTES.uploadList,
      },
      {
        id: "find-school",
        label: "Find my school",
        href: PEX_ROUTES.schools,
      },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: PEX_ROUTES.pexcover,
      },
    ];
  }
  return STARTER_LINKS;
}
function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatWidget() {
  const pathname = usePathname();
  const starterLinks = starterLinksForPath(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEntities, setSessionEntities] = useState<PexEntities>({});
  const [greetingGiven, setGreetingGiven] = useState(false);
  const [contextSummary, setContextSummary] = useState<string | undefined>(undefined);
  const [activeSession, setActiveSession] = useState<ActiveSession | undefined>(undefined);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<string, "helpful" | "not_helpful">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openTray = usePackTrayStore((state) => state.openTray);
  const inputRef = useRef<HTMLInputElement>(null);

  const sourcePath = pathname ?? "";
  const whatsappHref = buildWhatsAppHref(
    "Hi Pexpacks, I need help with my stationery pack.",
  );

  /* Disappear on header (top of page within 120px) */
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderVisible(window.scrollY < 120);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Disappear on footer */
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
        if (entry.isIntersecting) setIsOpen(false);
      },
      { threshold: 0.02, rootMargin: "0px 0px 40px 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  /* Disappear on mobile toggle menu tray */
  useEffect(() => {
    const checkMenu = () => {
      const open = document.body.classList.contains("menu-open");
      setIsMenuOpen(open);
      if (open) setIsOpen(false);
    };
    checkMenu();
    const observer = new MutationObserver(checkMenu);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || isLoading) return;

      const userMsgId = newId();
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        text: message,
        pending: true,
      };
      const history = [...messages, userMessage].slice(-12).map((entry) => ({
        role: entry.role,
        content: entry.role === "user" ? entry.text : (entry.response.text || entry.response.reply || ""),
      }));

      setInput("");
      setError(null);
      setMessages((current) => [...current, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            context: {
              pathname: window.location.pathname,
              greetingGiven,
              entities: sessionEntities,
              contextSummary,
              activeSession: {
                ...activeSession,
                turnsCount: (activeSession?.turnsCount ?? 0) + 1,
                greetingDelivered: greetingGiven || activeSession?.greetingDelivered || false,
                knownEntities: {
                  ...activeSession?.knownEntities,
                  grade: sessionEntities.grade,
                  schoolName: sessionEntities.school,
                  deliveryMethod: sessionEntities.deliveryMethod,
                  deliveryLocation: sessionEntities.deliveryLocation,
                  serviceAddons: sessionEntities.pexcover ? ["pexcover"] : (activeSession?.knownEntities?.serviceAddons ?? []),
                },
              },
            },
          }),
        });
        const data: unknown = await response.json();
        if (
          !response.ok ||
          !data ||
          typeof data !== "object" ||
          !("intent" in data)
        ) {
          trackPexRequestFailed({
            sourcePath: window.location.pathname,
            status: response.status,
          });
          throw new Error("Pex request failed");
        }

        const reply = data as PexChatResponse;
        trackPexIntentResolved({
          intent: reply.intent,
          sourcePath: window.location.pathname,
        });

        if (reply.entities) {
          setSessionEntities((prev) => ({ ...prev, ...reply.entities }));
        }
        if (reply.activeSession) {
          setActiveSession(reply.activeSession);
          if (reply.activeSession.knownEntities) {
            setSessionEntities((prev) => ({
              ...prev,
              school: reply.activeSession?.knownEntities?.schoolName ?? prev.school,
              grade: reply.activeSession?.knownEntities?.grade ?? prev.grade,
              deliveryMethod: reply.activeSession?.knownEntities?.deliveryMethod ?? prev.deliveryMethod,
              deliveryLocation: reply.activeSession?.knownEntities?.deliveryLocation ?? prev.deliveryLocation,
              pexcover: reply.activeSession?.knownEntities?.serviceAddons?.includes("pexcover") ?? prev.pexcover,
            }));
          }
        }
        if (reply.contextSummary) {
          setContextSummary(reply.contextSummary);
        }
        setGreetingGiven(true);

        setMessages((current) => [
          ...current.map((m) => (m.id === userMsgId ? { ...m, pending: false } : m)),
          { id: newId(), role: "assistant", response: reply },
        ]);
      } catch {
        setMessages((current) =>
          current.map((m) => (m.id === userMsgId ? { ...m, pending: false } : m))
        );
        setError(
          "Pex could not respond just now. Please try again or contact the Pexpacks team.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, greetingGiven, sessionEntities, contextSummary, activeSession],
  );

  const handleFeedback = useCallback((messageId: string, feedback: "helpful" | "not_helpful", intent: string) => {
    setFeedbackByMessage((current) => ({ ...current, [messageId]: feedback }));
    trackPexFeedback({ feedback, intent, sourcePath: window.location.pathname });
  }, []);

  const handleQuickReply = (queryText: string) => {
    // Dynamic Keyboard & Input Dismissal on mobile
    inputRef.current?.blur();
    void sendMessage(queryText);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const isWidgetHidden = isHeaderVisible || isFooterVisible || isMenuOpen;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[1000] font-sans transition-[opacity,transform,visibility] duration-300 sm:bottom-6 sm:right-6",
        isWidgetHidden &&
          "pointer-events-none invisible translate-y-6 opacity-0",
      )}
      aria-hidden={isWidgetHidden}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask Pex Assistant"
          className="group relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-brand-navy p-1.5 pr-3.5 text-left !text-white shadow-[0_10px_24px_rgba(13,31,56,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#203755] hover:shadow-[0_14px_28px_rgba(13,31,56,0.36)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal active:scale-95"
          title="Ask Pex"
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-teal/20 ring-2 ring-brand-teal/60">
            <Avatar size="h-full w-full" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold font-heading text-white whitespace-nowrap">
            Ask Pex
          </span>
        </button>
      ) : (
        <section
          className="flex h-[min(580px,calc(100dvh-32px))] sm:h-[600px] w-[min(380px,calc(100vw-24px))] sm:w-[380px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(15,35,61,0.22)]"
          aria-label="Pex Assistant"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-brand-navy via-[#1f344e] to-brand-navy px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-teal/20 ring-2 ring-brand-teal/50 overflow-hidden">
                  <Avatar size="h-full w-full" />
                </span>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" aria-hidden="true" />
              </div>
              <h2 className="m-0 text-sm font-heading font-extrabold tracking-tight text-white">
                Ask Pex
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask Pex Assistant"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-200 transition-all duration-150 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal active:scale-95 border border-white/10"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/70 p-3 sm:p-3.5 scroll-smooth"
            aria-live="polite"
          >
            <AssistantMessage>
              <p className="m-0 font-heading font-bold text-ink text-sm sm:text-[14px]">
                What would you like to do?
              </p>
              <p className="mb-0 mt-1 text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                Find a school pack, upload a list, track an order, or get
                checkout guidance.
              </p>
            </AssistantMessage>
            <StarterLinks
              links={starterLinks}
              onNavigate={(linkId, destination) => {
                trackPexActionSelected({
                  actionId: linkId,
                  destination,
                  sourcePath: window.location.pathname,
                });
                setIsOpen(false);
              }}
            />

            {Object.keys(sessionEntities).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-2 text-xs border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Context:</span>
                {sessionEntities.school && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 font-semibold text-teal-800 border border-teal-200/60">
                    <School className="size-3" aria-hidden="true" />
                    {sessionEntities.school}
                  </span>
                )}
                {sessionEntities.grade && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 font-semibold text-sky-800 border border-sky-200/60">
                    <BookOpen className="size-3" aria-hidden="true" />
                    {sessionEntities.grade}
                  </span>
                )}
                {sessionEntities.pexcover && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 border border-amber-200/60">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Pexcover added
                  </span>
                )}
                {sessionEntities.deliveryMethod && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 border border-emerald-200/60">
                    <Truck className="size-3" aria-hidden="true" />
                    {sessionEntities.deliveryMethod === "courier" ? "Home courier" : sessionEntities.deliveryMethod.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {messages.map((message) =>
              message.role === "user" ? (
                <div
                  key={message.id}
                  className={cn(
                    "ml-auto max-w-[85%] rounded-[18px_18px_4px_18px] bg-gradient-to-r from-brand-teal to-brand-teal-dark px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed text-white shadow-[0_2px_8px_rgba(26,122,119,0.25)] flex items-center justify-between gap-2 transition-all",
                    message.pending && "opacity-85 shadow-none"
                  )}
                >
                  <span className="font-medium">{message.text}</span>
                  {message.pending && (
                    <span
                      className="inline-block h-2 w-2 shrink-0 animate-ping rounded-full bg-teal-200"
                      title="Sending..."
                      aria-label="Sending message..."
                    />
                  )}
                </div>
              ) : (
                <div key={message.id} className="flex items-start gap-2">
                  <Avatar size="mt-0.5 h-7 w-7" />
                  <div className="min-w-0 max-w-[88%]">
                    <AssistantMessage>
                      <p className="m-0 leading-relaxed">{message.response.text || message.response.reply}</p>

                      {/* Structured Response Cards */}
                      {message.response.cards && message.response.cards.length > 0 && (
                        <div className="mt-2.5 flex flex-col gap-2">
                          {message.response.cards.map((card: ChatCard, idx: number) => (
                            <div key={card.id || `card-${idx}`} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs transition-colors hover:bg-slate-50">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="m-0 text-xs font-bold font-heading text-ink">{card.title}</h4>
                                {card.badge && (
                                  <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold text-brand-teal border border-brand-teal/20">
                                    {card.badge}
                                  </span>
                                )}
                              </div>
                              {card.price && (
                                <p className="mt-1 text-xs font-bold text-brand-teal">{card.price}</p>
                              )}
                              <p className="mt-1 text-xs text-slate-600 m-0 leading-relaxed">{card.description}</p>
                              {card.actions && card.actions.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                                  {card.actions.filter((act: ChatCardAction) => isPexHref(act.url || act.href)).map((act: ChatCardAction, i: number) => (
                                    <Link
                                      key={i}
                                      href={(act.url || act.href || "#") as import("next/link").LinkProps["href"]}
                                      onClick={() => setIsOpen(false)}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal underline decoration-brand-teal/30 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
                                    >
                                      {act.label} <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <InlineReplyLinks
                        actions={message.response.actions}
                        knowledgeCards={message.response.knowledgeCards}
                        response={message.response}
                        onNavigate={(actionId, destination) => {
                          trackPexActionSelected({
                            actionId,
                            destination,
                            sourcePath: window.location.pathname,
                          });
                          if (actionId === "open-tray") {
                            openTray();
                          }
                          setIsOpen(false);
                        }}
                      />

                      {/* Interactive Quick Reply Chips */}
                      {message.response.quickReplies && message.response.quickReplies.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Suggested quick options">
                          {message.response.quickReplies.map((qr) => (
                            <button
                              key={qr.id}
                              type="button"
                              onClick={() => handleQuickReply(qr.query || qr.message || qr.label)}
                              className="inline-flex items-center rounded-lg border border-brand-teal/25 bg-brand-teal/5 px-2.5 py-1 text-left text-xs font-semibold text-brand-teal transition-all duration-150 hover:bg-brand-teal hover:text-white hover:border-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/35 active:scale-95"
                            >
                              {qr.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {message.response.handoffRecommended && (
                        <a
                          href={
                            whatsappHref ||
                            `https://wa.me/27780036048?text=${encodeURIComponent("Hi Pexpacks, I'm asking about an order inquiry.")}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackPexHumanHandoff({
                              sourcePath: window.location.pathname,
                            });
                            trackWhatsAppClicked({
                              sourcePath: window.location.pathname,
                              label: "pex_human_handoff",
                            });
                          }}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-whatsapp-dark underline decoration-whatsapp/40 underline-offset-2 transition hover:decoration-whatsapp"
                        >
                          <WhatsAppIcon className="size-3.5 text-[#25D366]" />
                          Talk to Pexpacks on WhatsApp
                        </a>
                      )}
                    </AssistantMessage>
                    <div className="mt-1.5 flex items-center gap-2 px-1 text-[11px] text-slate-400 font-medium">
                      {feedbackByMessage[message.id] ? (
                        <span className="text-brand-teal font-semibold flex items-center gap-1">
                          <Check size={12} /> Thanks for the feedback!
                        </span>
                      ) : (
                        <>
                          <span>Helpful?</span>
                          <button
                            type="button"
                            onClick={() => handleFeedback(message.id, "helpful", message.response.intent)}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-slate-600 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal"
                            aria-label="Mark this Pex reply as helpful"
                          >
                            <ThumbsUp className="size-3" aria-hidden="true" />
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(message.id, "not_helpful", message.response.intent)}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                            aria-label="Mark this Pex reply as not helpful"
                          >
                            <ThumbsDown className="size-3" aria-hidden="true" />
                            Not quite
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex items-center gap-2.5">
                <Avatar size="h-7 w-7" />
                <div className="flex gap-1.5 rounded-[18px_18px_18px_4px] border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-teal" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-teal [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-teal [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800"
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={submit}
            className="shrink-0 border-t border-slate-100 bg-white p-2.5 sm:p-3"
          >
            <div className="flex min-h-[44px] items-center gap-2 rounded-[14px] border border-slate-300 bg-white py-1 pl-3.5 pr-1.5 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20">
              <input
                id="bro-pex-chat-input"
                name="chatMessage"
                type="text"
                autoComplete="off"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1200}
                placeholder="Ask Pex about your order..."
                className="min-w-0 flex-1 appearance-none border-0 !border-transparent bg-transparent px-0 py-2 text-[13px] leading-5 text-ink !outline-none !ring-0 placeholder:text-slate-500 focus:!border-0 focus:!border-transparent focus:!outline-none focus:!ring-0 focus-visible:!border-0 focus-visible:!border-transparent focus-visible:!outline-none focus-visible:!ring-0"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white transition-all duration-150",
                  input.trim() && !isLoading
                    ? "bg-brand-accent hover:bg-brand-accent-hover shadow-xs active:scale-95 cursor-pointer"
                    : "bg-[#ffa396] cursor-not-allowed shadow-none"
                )}
              >
                <Send size={16} aria-hidden="true" className="translate-x-px text-white stroke-white" />
              </button>
            </div>
          </form>

          {/* Persistent WhatsApp & Human Handoff Bridge */}
          <footer className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-white px-3 py-1.5 text-xs">
            <a
              href={
                whatsappHref ||
                "https://wa.me/27780036048?text=Hi%20Pexpacks%2C%20I%20need%20help%20with%20my%20stationery%20pack."
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsAppClicked({
                  sourcePath,
                  label: "pex_docked_handoff",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-2.5 py-1 text-[11px] font-semibold text-[#075E54] border border-[#25D366]/20 transition-all hover:bg-[#25D366]/20 hover:border-[#25D366]/30 active:scale-95"
            >
              <WhatsAppIcon className="size-3.5 text-[#25D366]" />
              Chat on WhatsApp
            </a>
          </footer>
        </section>
      )}
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-700 shadow-[0_2px_8px_rgba(26,42,64,0.04)]">
      {children}
    </div>
  );
}

function Avatar({ size }: { size: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-teal/20",
        size,
      )}
    >
      <Image
        src={CHATBOT_LOGO}
        alt="Pex"
        width={44}
        height={44}
        className="h-full w-full object-cover aspect-square"
      />
    </span>
  );
}

function getStarterIcon(id: string) {
  switch (id) {
    case "find-school":
    case "find-pack":
      return <School className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    case "upload-list":
      return <Upload className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    case "track-order":
    case "delivery":
      return <Truck className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    case "checkout-help":
    case "open-tray":
      return <ShoppingCart className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    case "pexcover":
      return <ShieldCheck className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    case "talk-to-team":
      return <MessageCircle className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
    default:
      return <Sparkles className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />;
  }
}

function StarterLinks({
  links,
  onNavigate,
}: {
  links: ReadonlyArray<{ id: string; label: string; href: string }>;
  onNavigate: (linkId: string, destination: string) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Popular Pex links">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          onClick={() => onNavigate(link.id, link.href)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-pex-navy shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/35 active:scale-95"
        >
          {getStarterIcon(link.id)}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function InlineReplyLinks({
  actions,
  knowledgeCards,
  response,
  onNavigate,
}: {
  actions: PexChatResponse["actions"];
  knowledgeCards: PexChatResponse["knowledgeCards"];
  response: PexChatResponse;
  onNavigate: (actionId: string, destination: string) => void;
}) {
  const safeActions = actions.filter((action) => isPexHref(action.href));
  const safeKnowledgeCards = knowledgeCards.filter((card) => isPexHref(card.href));

  const hasLinks =
    safeActions.length > 0 ||
    safeKnowledgeCards.length > 0 ||
    response.schoolCards.length > 0 ||
    response.packCards.length > 0 ||
    response.productCards.length > 0;
  if (!hasLinks) return null;

  return (
    <nav className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-snug" aria-label="Relevant Pex links">
      {safeActions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          onClick={(event) => {
            if (action.id === "open-tray") event.preventDefault();
            onNavigate(action.id, action.href);
          }}
          className="font-semibold text-brand-teal underline decoration-brand-teal/40 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
        >
          {action.label}
        </Link>
      ))}
      {safeKnowledgeCards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          onClick={() => onNavigate("pex_knowledge_link", card.href)}
          className="font-semibold text-brand-teal underline decoration-brand-teal/40 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
        >
          {card.question}
        </Link>
      ))}
      {response.schoolCards.map((school) => (
        <Link
          key={school.id}
          href={`/schools/${school.slug}`}
          onClick={() =>
            onNavigate("pex_school_link", `/schools/${school.slug}`)
          }
          className="font-semibold text-brand-teal underline decoration-brand-teal/40 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
        >
          {school.name}
        </Link>
      ))}
      {response.packCards.map((pack) => (
        <span key={pack.id} className="inline-flex flex-wrap gap-x-2">
          <Link
            href={pack.href}
            onClick={() => onNavigate("pex_pack_link", pack.href)}
            className="font-semibold text-brand-teal underline decoration-brand-teal/40 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
          >
            {pack.title} (R {pack.price.toFixed(2)})
          </Link>
        </span>
      ))}
      {response.productCards.map((product) => (
        <span key={product.id} className="text-text-muted">
          {product.name} - R {product.price.toFixed(2)}
        </span>
      ))}
    </nav>
  );
}
