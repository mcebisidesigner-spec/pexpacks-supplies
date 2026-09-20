import Link from "next/link";
import { footerNavLinks } from "@/data/navigation";

export function FooterNav() {
  return (
    <nav className="flex items-center justify-start lg:justify-end flex-wrap gap-y-2.5 gap-x-5 sm:gap-x-0 w-full" aria-label="Footer navigation">
      {footerNavLinks.map((link, index) => (
        <span key={link.label} className="inline-flex items-center">
          <Link
            href={link.href}
            className="relative !text-white font-sans text-sm sm:text-base font-extrabold leading-none tracking-normal no-underline transition-colors duration-200 hover:!text-pex-keppel focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12"
            data-conversion-event={`footer_${link.label.toLowerCase().replaceAll(" ", "_")}`}
          >
            {link.label}
          </Link>
          {index < footerNavLinks.length - 1 && (
            <span className="hidden sm:inline-block mx-3.5 text-white/35 text-base font-normal select-none" aria-hidden="true">
              |
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
