"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { HeaderOrderIcon } from "@/components/order/HeaderOrderIcon";
import { TrackPackIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export type AdminUser = {
  name: string;
  username: string;
};

type HeaderAccountControlsProps = {
  variant: "desktop" | "mobile";
  adminUser: AdminUser | null;
  adminUserLoading: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function HeaderAccountControls({
  variant,
  adminUser,
  adminUserLoading,
}: HeaderAccountControlsProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (isAdmin) {
    const user = adminUser;

    return (
      <div ref={wrapRef} className="relative inline-flex items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          className="relative w-[38px] h-[38px] xl:w-[42px] xl:h-[42px] border-0 rounded-full p-0 bg-transparent cursor-pointer inline-grid place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel focus-visible:ring-offset-2 group"
          onClick={() => setOpen((v) => !v)}
          aria-label={
            user ? `Account menu for ${user.name}` : "Open account menu"
          }
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {user && !adminUserLoading ? (
            <span className="w-[30px] h-[30px] xl:w-[34px] xl:h-[34px] rounded-full bg-pex-keppel text-white inline-grid place-items-center font-sans text-sm font-extrabold leading-none tracking-normal select-none transition-[filter] duration-180 group-hover:brightness-110">
              {getInitials(user.name)}
            </span>
          ) : (
            <span className="w-[30px] h-[30px] xl:w-[34px] xl:h-[34px] rounded-full bg-pex-bg-soft text-pex-navy inline-grid place-items-center [&_svg]:w-5 [&_svg]:h-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg]:stroke-round">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
              </svg>
            </span>
          )}
        </button>

        {open && user ? (
          <div className="absolute top-[calc(100%+10px)] right-0 z-[120] min-w-[224px] bg-white border border-pex-border rounded-[18px] shadow-dropdown p-1.5 animate-[dropdownIn_160ms_ease-out] motion-reduce:animate-none" role="menu">
            <div className="px-3 pt-2.5 pb-2">
              <div className="font-sans text-[15px] font-extrabold leading-[1.2] tracking-normal text-pex-navy overflow-hidden text-ellipsis whitespace-nowrap">
                {user.name}
              </div>
              <div className="mt-0.5 text-[13px] text-pex-muted overflow-hidden text-ellipsis whitespace-nowrap">
                @{user.username}
              </div>
            </div>
            <div className="h-[1px] bg-pex-border my-1.5" role="separator" />
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-0 rounded-xl bg-transparent text-pex-navy font-sans text-sm font-bold leading-none tracking-normal cursor-pointer text-left transition-colors duration-160 hover:bg-destructive/10 hover:text-destructive disabled:opacity-60 disabled:cursor-default [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:stroke-round"
              role="menuitem"
              onClick={() => startLogoutTransition(() => logoutAction())}
              disabled={isLoggingOut}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "desktop") {
    return (
      <div className="relative inline-flex items-center gap-0.5 sm:gap-1">
        <HeaderOrderIcon />
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-1 sm:gap-1.5">
      <Tooltip content="Track Your Pack" position="bottom">
        <Link
          href="/track-order"
          className="w-10 h-10 min-w-10 min-h-10 rounded-full inline-grid place-items-center bg-transparent text-pex-navy hover:text-pex-keppel cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-coral focus-visible:ring-offset-2 [&_svg]:w-[25px] [&_svg]:h-[25px]"
          aria-label="Track Your Pack"
        >
          <TrackPackIcon aria-hidden="true" />
        </Link>
      </Tooltip>
      <HeaderOrderIcon />
    </div>
  );
}
