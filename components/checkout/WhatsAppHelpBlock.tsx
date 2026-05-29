import styles from "@/app/checkout/Checkout.module.css";

type WhatsAppHelpBlockProps = {
  href: string;
};

export function WhatsAppHelpBlock({ href }: WhatsAppHelpBlockProps) {
  if (!href) return null;

  return (
    <a
      className={styles.supportLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Reach PexPacks on WhatsApp for checkout help"
    >
      <span>
        <strong>Do you need Help?</strong>
        <small>Reach us on WhatsApp</small>
      </span>
      <i aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M20 11.7a8 8 0 0 1-11.7 7.1L4 20l1.2-4.1A8 8 0 1 1 20 11.7Z" />
          <path d="M9.2 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .5.1.6.5l.7 1.7c.1.3.1.5-.1.7l-.4.5c-.2.2-.2.4 0 .7.4.8 1.3 1.7 2.2 2.1.3.2.5.2.7 0l.6-.7c.2-.2.4-.3.7-.2l1.6.8c.4.2.5.4.4.7-.1.7-.8 1.4-1.5 1.5-1.3.2-3.3-.7-5-2.4-1.8-1.8-2.8-4-2.5-5.2 0-.2.1-.4.2-.5Z" />
        </svg>
      </i>
    </a>
  );
}
