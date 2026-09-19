"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/isActivePath";
import { cn } from "@/lib/utils";

type HeaderActiveLinkProps = {
  href: string;
  label: string;
};

function LinkPendingStatus() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-pex-coral origin-left animate-[navPending_0.8s_ease-in-out_infinite_alternate]"
      aria-hidden="true"
    />
  ) : null;
}

export function HeaderActiveLink({ href, label }: HeaderActiveLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(href, pathname);

  return (
    <Link
      className={cn(
        "relative text-pex-navy border-b-2 border-transparent py-1.5 font-sans text-base xl:text-[17px] font-extrabold leading-none tracking-[0.02em] whitespace-nowrap transition-colors duration-200 hover:text-pex-keppel hover:border-pex-keppel",
        active && "text-pex-keppel border-pex-keppel"
      )}
      href={href}
      aria-current={active ? "page" : undefined}
      data-conversion-event={`header_${label.toLowerCase().replaceAll(" ", "_")}`}
    >
      {label}
      <LinkPendingStatus />
    </Link>
  );
}

