"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackCtaClicked, trackWhatsAppClicked } from "@/lib/analytics";
import styles from "./ChatWidget.module.css";

const SUPPORT_PHONE = "27780036048";
const CHATBOT_LOGO = "/images/chatbot.webp";

const ESCALATION_PATTERNS = [
  /\bprice\b/i,
  /\bpricing\b/i,
  /\bcost\b/i,
  /\bquote\b/i,
  /\bquotation\b/i,
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
      className={`${styles.widgetContainer} ${
        isFooterVisible ? styles.hiddenOverFooter : ""
      }`}
      aria-hidden={isFooterVisible}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask Pex Assistant"
          className={styles.launcherBtn}
        >
          <span className={styles.launcherIconBadge}>
            <Image
              src={CHATBOT_LOGO}
              alt="Pex"
              width={44}
              height={44}
              className={styles.chatbotAvatarImg}
              priority
            />
          </span>

          <span className={styles.launcherText}>
            <span className={styles.launcherTitle}>Ask Pex</span>
            <span className={styles.launcherSubtitle}>I&apos;m here to help</span>
          </span>
        </button>
      ) : (
        <section className={styles.chatWindow} aria-label="Pex Assistant">
          {/* Header */}
          <header className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.logoWrapper}>
                <Image
                  src={CHATBOT_LOGO}
                  alt="Pex"
                  width={36}
                  height={36}
                  className={styles.chatbotAvatarImg}
                />
              </div>

              <div>
                <h3 className={styles.headerTitle}>Ask Pex</h3>
                <div className={styles.statusIndicator}>
                  <span className={styles.statusDot} />
                  <span className={styles.statusText}>Online · replies instantly</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask Pex Assistant"
              className={styles.closeBtn}
            >
              <CloseIcon size={18} />
            </button>
          </header>

          {/* Conversation */}
          <div className={styles.conversationBody}>
            {/* Always show welcome greeting as the opening message */}
            <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
              <AssistantAvatar />

              <div className={styles.assistantBubble}>
                <p className={styles.welcomeHeading}>Hi there 👋</p>
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
                  className={`${styles.messageRow} ${
                    isUser ? styles.messageRowUser : styles.messageRowAssistant
                  }`}
                >
                  {!isUser && <AssistantAvatar />}

                  <div className={isUser ? styles.userBubble : styles.assistantBubble}>
                    {isUser ? text : renderFormattedContent(text)}

                    {/* Contextual Commerce Action Cards */}
                    {commerceActions.length > 0 && (
                      <div className={styles.commerceCardContainer}>
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
                            className={styles.commerceCard}
                          >
                            <div className={styles.commerceCardLeft}>
                              <div className={styles.commerceCardIcon}>
                                <ActionIcon type={act.icon} size={16} />
                              </div>
                              <div className={styles.commerceCardTexts}>
                                <span className={styles.commerceCardTitle}>
                                  {act.title}
                                </span>
                                <span className={styles.commerceCardDesc}>
                                  {act.desc}
                                </span>
                              </div>
                            </div>
                            <span className={styles.commerceCardAction}>
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
              <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                <AssistantAvatar />
                <div className={styles.typingContainer}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            {error && (
              <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                <AssistantAvatar />
                <div
                  className={styles.assistantBubble}
                  style={{
                    borderColor: "#fecaca",
                    backgroundColor: "#fef2f2",
                  }}
                >
                  <p style={{ color: "#991b1b", margin: 0 }}>
                    I&apos;m having trouble connecting right now. Please feel free to tap below to chat with our team on WhatsApp!
                  </p>
                </div>
              </div>
            )}

            {/* Smart human-support escalation card */}
            {needsHumanHelp && (
              <div className={styles.escalationCard}>
                <div className={styles.escalationHeader}>
                  <div className={styles.whatsappBadge}>
                    <WhatsAppIcon size={18} />
                  </div>

                  <div>
                    <p className={styles.escalationTitle}>Need pricing or custom help?</p>
                    <p className={styles.escalationSubtitle}>
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
                  className={styles.escalationBtn}
                >
                  <WhatsAppIcon size={18} />
                  Chat with us on WhatsApp
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleFormSubmit} className={styles.chatInputForm}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Pex anything..."
                className={styles.chatInput}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={styles.sendBtn}
              >
                <SendIcon size={16} />
              </button>
            </div>
          </form>

          {/* Permanent WhatsApp fallback */}
          <footer className={styles.chatFooter}>
            <span className={styles.footerPrompt}>Prefer a real person?</span>

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
              className={styles.footerWhatsAppLink}
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
    <div className={styles.assistantAvatar}>
      <Image
        src={CHATBOT_LOGO}
        alt="Pex"
        width={32}
        height={32}
        className={styles.chatbotAvatarImg}
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
