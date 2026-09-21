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
        "group relative py-1.5 font-sans text-[18px] font-extrabold leading-none tracking-normal whitespace-nowrap !text-pex-navy transition-all duration-200 hover:!text-pex-keppel hover:-translate-y-px after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-pex-keppel after:transition-[width] after:duration-300 after:ease-out hover:after:w-full",
        active && "!text-pex-keppel after:w-full"
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

