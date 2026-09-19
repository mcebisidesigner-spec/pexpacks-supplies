"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { buildWhatsAppHref } from "@/data/contact";
import {
  trackPexActionSelected,
  trackPexHumanHandoff,
  trackPexIntentResolved,
  trackPexRequestFailed,
  trackWhatsAppClicked,
} from "@/lib/analytics";
import type { PexChatResponse } from "@/lib/chat/pex";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { cn } from "@/lib/utils";

const CHATBOT_LOGO = "/images/chatbot.webp";
const STARTER_LINKS = [
  {
    id: "find-school",
    label: "Find my school",
    href: "/schools",
  },
  {
    id: "upload-list",
    label: "Upload a list",
    href: "/upload-a-list",
  },
  {
    id: "track-order",
    label: "Track an order",
    href: "/track",
  },
] as const;

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; response: PexChatResponse };

function starterLinksForPath(pathname: string | null) {
  if (pathname?.startsWith("/checkout")) {
    return [
      {
        id: "checkout-help",
        label: "Checkout help",
        href: "/checkout",
      },
      { id: "open-tray", label: "Open my tray", href: "/checkout" },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: "/blog/what-is-pexcover-book-covering",
      },
    ];
  }
  if (pathname?.startsWith("/schools")) {
    return [
      {
        id: "find-pack",
        label: "Find my grade pack",
        href: "/schools",
      },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: "/blog/what-is-pexcover-book-covering",
      },
      {
        id: "upload-list",
        label: "Upload a list",
        href: "/upload-a-list",
      },
    ];
  }
  if (pathname?.startsWith("/track-order") || pathname?.startsWith("/track")) {
    return [
      {
        id: "track-order",
        label: "Track an order",
        href: "/track",
      },
      {
        id: "delivery",
        label: "Delivery help",
        href: "/track",
      },
      {
        id: "talk-to-team",
        label: "Talk to Pexpacks",
        href: "/contact",
      },
    ];
  }
  if (pathname?.startsWith("/order") || pathname?.startsWith("/upload-a-list")) {
    return [
      {
        id: "upload-list",
        label: "Upload a list",
        href: "/upload-a-list",
      },
      {
        id: "find-school",
        label: "Find my school",
        href: "/schools",
      },
      {
        id: "pexcover",
        label: "About Pexcover",
        href: "/blog/what-is-pexcover-book-covering",
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
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openTray = usePackTrayStore((state) => state.openTray);
  const inputRef = useRef<HTMLInputElement>(null);

  const sourcePath = pathname ?? "";
  const whatsappHref = buildWhatsAppHref(
    "Hi Pexpacks, I need help with my stationery pack.",
  );

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

      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        text: message,
      };
      const history = [...messages, userMessage].slice(-12).map((entry) => ({
        role: entry.role,
        content: entry.role === "user" ? entry.text : entry.response.text,
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
            context: { pathname: window.location.pathname },
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
        setMessages((current) => [
          ...current,
          { id: newId(), role: "assistant", response: reply },
        ]);
      } catch {
        setError(
          "Bro Pex could not respond just now. Please try again or contact the Pexpacks team.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[1000] font-sans transition-[opacity,transform,visibility] duration-300",
        isFooterVisible &&
          "pointer-events-none invisible translate-y-6 opacity-0",
      )}
      aria-hidden={isFooterVisible}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask Bro Pex Assistant"
          className="flex items-center gap-3 rounded-full border border-white/15 bg-brand-navy py-2 pl-2 pr-5 text-left !text-white shadow-[0_14px_30px_rgba(13,31,56,0.24)] transition hover:-translate-y-0.5 hover:bg-[#203755] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          <Avatar size="h-11 w-11" />
          <span className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">Ask Bro Pex</span>
            <span className="text-xs text-slate-300">Help with your pack</span>
          </span>
        </button>
      ) : (
        <section
          className="flex h-[min(640px,calc(100dvh-32px))] w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-surface shadow-[0_24px_70px_rgba(15,35,61,0.24)]"
          aria-label="Bro Pex Assistant"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-brand-navy px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar size="h-10 w-10" />
              <div>
                <h2 className="m-0 text-sm font-semibold leading-tight">
                  Ask Bro Pex
                </h2>
                <p className="m-0 mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
                  Ready to help
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask Bro Pex Assistant"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f4f7f8] p-4 sm:p-5"
            aria-live="polite"
          >
            <AssistantMessage>
              <p className="m-0 font-semibold text-ink">
                What would you like to do?
              </p>
              <p className="mb-0 mt-1">
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

            {messages.map((message) =>
              message.role === "user" ? (
                <div
                  key={message.id}
                  className="ml-auto max-w-[82%] rounded-[18px_18px_5px_18px] bg-brand-teal px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm"
                >
                  {message.text}
                </div>
              ) : (
                <div key={message.id} className="flex items-start gap-2.5">
                  <Avatar size="mt-0.5 h-8 w-8" />
                  <div className="min-w-0 max-w-[85%]">
                    <AssistantMessage>
                      <p className="m-0">{message.response.text}</p>
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
                      {message.response.handoffRecommended && whatsappHref && (
                        <a
                          href={whatsappHref}
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
                          className="mt-2.5 inline-flex font-semibold text-whatsapp-dark underline decoration-whatsapp/40 underline-offset-2 transition hover:decoration-whatsapp"
                        >
                          Talk to Pexpacks on WhatsApp
                        </a>
                      )}
                    </AssistantMessage>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex items-center gap-2.5">
                <Avatar size="h-8 w-8" />
                <div className="flex gap-1 rounded-[18px_18px_18px_4px] border border-line bg-surface px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-field border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800"
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={submit}
            className="shrink-0 border-t border-slate-200 bg-white p-3.5"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-1.5 pl-3.5 pr-1.5 shadow-inner focus-within:border-brand-teal focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-teal/15">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1200}
                placeholder="Ask Bro Pex about your order..."
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-accent text-white shadow-sm transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          </form>

          {whatsappHref && (
            <footer className="flex shrink-0 items-center justify-center border-t border-slate-200 bg-white px-4 py-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppClicked({
                    sourcePath,
                    label: "pex_footer_handoff",
                  });
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-whatsapp-dark transition hover:text-whatsapp hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Chat with us on WhatsApp
              </a>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px_18px_18px_5px] border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-text-muted shadow-sm">
      {children}
    </div>
  );
}

function Avatar({ size }: { size: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-teal",
        size,
      )}
    >
      <Image
        src={CHATBOT_LOGO}
        alt="Bro Pex"
        width={44}
        height={44}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

function StarterLinks({
  links,
  onNavigate,
}: {
  links: ReadonlyArray<{ id: string; label: string; href: string }>;
  onNavigate: (linkId: string, destination: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-xs leading-relaxed">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          onClick={() => onNavigate(link.id, link.href)}
          className="font-semibold text-brand-teal underline decoration-brand-teal/40 underline-offset-2 transition hover:text-brand-teal-dark hover:decoration-brand-teal"
        >
          {link.label}
        </Link>
      ))}
    </div>
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
  const hasLinks =
    actions.length > 0 ||
    knowledgeCards.length > 0 ||
    response.schoolCards.length > 0 ||
    response.packCards.length > 0 ||
    response.productCards.length > 0;
  if (!hasLinks) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2 text-xs leading-relaxed">
      {actions.map((action) => (
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
      {knowledgeCards.map((card) => (
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
    </div>
  );
}
