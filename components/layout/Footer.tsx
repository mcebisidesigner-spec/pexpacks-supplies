import Link from "next/link";
import { Camera, ChevronDown, Globe2, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import {
  hasWhatsAppNumber,
  orderWhatsAppHref,
  phoneNumber,
} from "@/data/contact";
import { officialSocialLinks } from "@/data/social";
import { FooterNav } from "./FooterNav";

export type FooterContent = {
  company?: {
    site_name?: string;
    support_email?: string;
    support_phone?: string;
    site_url?: string;
  };
  footer?: {
    about_text?: string;
    copyright_text?: string;
  };
};

function telHref(value: string) {
  const digits = value.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
  return `tel:+${intl}`;
}

const socialLinks = [
  {
    label: "Visit Pexpacks on Facebook",
    href: officialSocialLinks.facebook,
    icon: "facebook",
  },
  {
    label: "Visit Pexpacks on Instagram",
    href: officialSocialLinks.instagram,
    icon: "instagram",
  },
  ...(hasWhatsAppNumber
    ? [
        {
          label: "Chat to Pexpacks on WhatsApp",
          href: orderWhatsAppHref,
          icon: "whatsapp",
        } as const,
      ]
    : []),
] as const;

const FOOTER_EMAIL = "helpme@pexpacks.co.za";

const policyGroups = [
  {
    title: "LEGAL",
    links: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Email Disclaimer", href: "/email-disclaimer" },
      { label: "Cookie Policy", href: "/cookie-notice" },
      { label: "PAIA Manual", href: "/paia-manual" },
    ],
  },
  {
    title: "CUSTOMER SUPPORT",
    links: [
      { label: "Delivery Policy", href: "/delivery-policy" },
      { label: "Returns & Refunds Policy", href: "/returns-refunds-policy" },
      { label: "Social Media Guidelines", href: "/social-media-guidelines" },
      { label: "Contact / Complaints", href: "/contact" },
    ],
  },
  {
    title: "BUSINESS PARTNERS",
    links: [
      { label: "School Partnership Terms", href: "/school-partnership-terms" },
      { label: "Supplier Terms", href: "/supplier-terms" },
      { label: "Campaign Terms", href: "/campaign-terms" },
    ],
  },
] as const;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return value;
}

function SocialIcon({ icon }: { icon: (typeof socialLinks)[number]["icon"] }) {
  const iconClassName = "size-4 sm:size-[18px]";

  if (icon === "instagram") return <Camera className={iconClassName} strokeWidth={2} aria-hidden="true" />;
  if (icon === "whatsapp") return <MessageCircle className={iconClassName} strokeWidth={2} aria-hidden="true" />;
  return <Globe2 className={iconClassName} strokeWidth={2} aria-hidden="true" />;
}

export function Footer({ company }: FooterContent) {
  const currentYear = new Date().getFullYear();
  const siteName = company?.site_name || "Pexpacks";
  const email = FOOTER_EMAIL;
  const emailHref = `mailto:${email}`;
  const phone = company?.support_phone || phoneNumber;
  const phoneHrefLocal = phone ? telHref(phone) : "#";

  return (
    <footer className="bg-pex-navy text-white" id="site-footer">
      <div className="w-full max-w-[1280px] mx-auto py-[38px] px-4 sm:px-6 lg:py-11 lg:px-[clamp(24px,4vw,56px)] pb-[34px] lg:pb-9">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,1fr)_auto] gap-5 sm:gap-6 lg:gap-8 items-start">
          <div className="flex items-start justify-between gap-4 sm:gap-[18px] w-full min-w-0 m-0 p-0">
            <Link
              href="/"
              className="inline-flex items-start leading-none w-fit m-0 p-0"
              aria-label={`${siteName} home`}
            >
              <Logo variant="white" className="block w-[clamp(88px,20vw,106px)] lg:w-[124px] h-auto m-0 p-0" />
            </Link>
          </div>

          <div className="grid gap-4 lg:gap-4 justify-items-start lg:justify-items-end min-w-0 w-full">
            <FooterNav />

            <div className="flex items-start sm:items-center gap-3 sm:gap-[clamp(12px,2.5vw,24px)] flex-wrap justify-start lg:justify-end w-full">
              <address
                className="flex items-center flex-wrap gap-2 m-0 text-white not-italic"
                aria-label={`${siteName} contact details`}
              >
                {phone ? (
                  <>
                    <a href={phoneHrefLocal} className="relative text-pex-keppel text-sm sm:text-base font-bold leading-[1.25] tracking-normal no-underline break-all sm:break-normal transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12">
                      {formatPhoneNumber(phone)}
                    </a>
                    <span className="text-pex-keppel opacity-50 text-base font-medium leading-none" aria-hidden="true">
                      |
                    </span>
                  </>
                ) : null}
                <a href={emailHref} className="relative text-pex-keppel text-sm sm:text-base font-bold leading-[1.25] tracking-normal no-underline break-all sm:break-normal transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12">
                  {email}
                </a>
              </address>

              <details
                className="w-full max-w-full lg:max-w-[760px] text-left lg:text-right group/policy"
                suppressHydrationWarning
              >
                <summary className="relative inline-flex items-center justify-start lg:justify-end gap-2.5 max-w-full cursor-pointer text-white text-xs sm:text-sm font-normal leading-[1.3] list-none transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full [&::-webkit-details-marker]:hidden after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12">
                  <span className="min-w-0 overflow-wrap-anywhere">{siteName} policies &amp; information:</span>
                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open/policy:rotate-180" aria-hidden="true" />
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-[18px] mt-4 sm:mt-[18px] p-4 sm:p-[18px] text-left bg-white/[0.06] border border-white/[0.12] rounded-[14px] sm:rounded-[18px]">
                  {policyGroups.map((group) => (
                    <section className="min-w-0 [&_h2]:m-0 [&_h2]:mb-2.5 [&_h2]:text-white [&_h2]:text-xs [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-[0.02em] [&_h2]:leading-[1.2] [&_ul]:grid [&_ul]:gap-2 [&_ul]:m-0 [&_ul]:p-0 [&_ul]:list-none" key={group.title}>
                      <h2>{group.title}</h2>
                      <ul>
                        {group.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                            className="footer-legal-link relative !text-white text-[11px] font-medium leading-[1.3] transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        <hr className="border-none h-[1px] bg-white/[0.14] my-6 sm:my-[30px] mb-5" />

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-[18px]">
          <p className="min-w-0 m-0 text-white text-[11px] sm:text-xs font-semibold leading-[1.3]">
            &copy; {currentYear} Pexpacks (Pty) Ltd. All rights reserved.
            Design:{"  "}
            <a
              href="https://mcebisih.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative !text-pex-keppel font-extrabold no-underline transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12"
            >
              McebisiH
            </a>
          </p>

          <div className="flex items-center justify-end">
            <nav className="flex items-center justify-end gap-1 sm:gap-2" aria-label="Social media">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-pex-keppel transition-all duration-200 hover:text-pex-coral hover:-translate-y-px hover:scale-105 focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12"
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon icon={link.icon} />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
