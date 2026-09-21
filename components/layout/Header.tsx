"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { HeaderActiveLink } from "./HeaderActiveLink";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderScrollWrapper } from "./HeaderScrollWrapper";
import { mainNavLinks } from "@/data/navigation";
import { HeaderAccountControls } from "./HeaderAccountControls";
import { TrackPackIcon } from "@/components/ui/icons";
import { AnnouncementBar } from "./AnnouncementBar";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  announcement?: {
    id?: string;
    enabled: boolean;
    text: string;
    badge?: string;
    linkUrl?: string | null;
    linkLabel?: string | null;
  };
}

export function Header({ announcement }: HeaderProps = {}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [adminUser, setAdminUser] = useState<{
    name: string;
    username: string;
  } | null>(null);
  const [adminUserLoading, setAdminUserLoading] = useState(isAdmin);

  useEffect(() => {
    if (!isAdmin) {
      setAdminUser(null);
      setAdminUserLoading(false);
      return;
    }

    let cancelled = false;
    setAdminUserLoading(true);

    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (data?.user) {
        const meta = data.user.user_metadata ?? {};
        setAdminUser({
          name: meta.full_name || meta.name || data.user.email || "Admin",
          username:
            meta.username ||
            meta.user_name ||
            data.user.email?.split("@")[0] ||
            "admin",
        });
      }
      setAdminUserLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return (
    <HeaderScrollWrapper>
      <div
        className={cn(
          "relative z-[2] h-[68px] sm:h-[70px] lg:h-[110px] w-full max-w-none mx-auto px-4 sm:px-[clamp(16px,4vw,28px)] lg:px-[clamp(32px,3.6vw,56px)] flex items-center justify-between lg:grid lg:grid-cols-[0.75fr_auto_1.25fr]",
          isAdmin && "lg:grid-cols-[1fr_auto]"
        )}
      >
        <div className="inline-flex items-center gap-2 sm:gap-3 lg:gap-3.5 justify-self-start min-w-0 shrink-0">
          <Link className="inline-flex items-center w-fit [&_img]:w-[92px] sm:[&_img]:w-[clamp(92px,24vw,106px)] lg:[&_img]:w-[116px] [&_img]:h-auto [&_img]:block" href="/" aria-label="Pexpacks home" data-mobile-menu-close>
            <Logo loading="eager" />
          </Link>
          {isAdmin && (
            <span className="font-sans text-[17px] font-extrabold leading-none tracking-normal text-pex-navy whitespace-nowrap overflow-hidden text-ellipsis max-w-[min(280px,38vw)]">
              {adminUserLoading ? "Admin" : adminUser?.name ?? "Admin"}
            </span>
          )}
        </div>
        {!isAdmin && (
          <nav className="hidden lg:flex items-baseline justify-center mx-auto gap-[28px]" aria-label="Primary navigation">
            {mainNavLinks.map((link) => (
              <HeaderActiveLink href={link.href} label={link.label} key={link.href} />
            ))}
          </nav>
        )}
        <div className="hidden lg:inline-flex items-center justify-self-end gap-4">
          <HeaderAccountControls
            variant="desktop"
            adminUser={adminUser}
            adminUserLoading={adminUserLoading}
          />
          {!isAdmin && (
            <Link
              className="min-h-[40px] h-[40px] pl-4 pr-1.5 rounded-full inline-flex items-center justify-center gap-2 bg-pex-navy text-white font-sans text-sm font-bold leading-none shadow-[0_4px_14px_rgba(26,42,64,0.10)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_18px_rgba(26,42,64,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:brightness-100 group"
              href="/track-order"
              data-conversion-event="header_track_pack"
            >
              <span className="text-white whitespace-nowrap">Track Your Pack</span>
              <span className="w-7 h-7 rounded-full bg-pex-coral text-white inline-grid place-items-center shrink-0 transition-transform duration-200 group-hover:scale-105 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.9]" aria-hidden="true">
                <TrackPackIcon />
              </span>
            </Link>
          )}
        </div>
        <div className="flex lg:hidden items-center justify-end gap-1 sm:gap-1.5 shrink-0">
          <HeaderAccountControls
            variant="mobile"
            adminUser={adminUser}
            adminUserLoading={adminUserLoading}
          />
          {!isAdmin && <HeaderMenu />}
        </div>
      </div>
      {!isAdmin && announcement?.enabled && (
        <AnnouncementBar
          key={announcement.id || "storefront-announcement-bar"}
          id={announcement.id}
          text={announcement.text}
          badge={announcement.badge}
          linkUrl={announcement.linkUrl}
          linkLabel={announcement.linkLabel}
        />
      )}
    </HeaderScrollWrapper>
  );
}

