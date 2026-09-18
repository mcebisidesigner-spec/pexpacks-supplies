"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminNavGroup } from "@/lib/admin/navigation";
import { brandLogoPaths } from "@/lib/brand-assets";
import { createClient } from "@/lib/supabase/client";
import { ORDERED_NAV_ITEMS } from "./Sidebar";

type NotificationCounts = {
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  awaiting_fulfilment: number;
  pending_schools: number;
  procurement_outstanding: number;
  open_tasks: number;
};

const EMPTY_NOTIFICATION_COUNTS: NotificationCounts = {
  orders_today: 0,
  pending_payments: 0,
  failed_payments: 0,
  awaiting_fulfilment: 0,
  pending_schools: 0,
  procurement_outstanding: 0,
  open_tasks: 0,
};

function isActiveRoute(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "LM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AdminShell({
  userName,
  userEmail,
  userRoles = [],
  avatarUrl,
  children,
}: {
  groups: AdminNavGroup[];
  userName: string;
  userEmail: string;
  userRoles?: string[];
  avatarUrl: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] =
    useState<NotificationCounts>(EMPTY_NOTIFICATION_COUNTS);
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayName = userName && userName !== "Admin" ? userName : userEmail;
  const userInitials = getInitials(displayName);

  const isSuperUser =
    userRoles.includes("super_admin") ||
    userEmail.toLowerCase() === "mcebisimhayise@gmail.com" ||
    userEmail.toLowerCase() === "pexpacks@gmail.com";

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const isDocActive =
        pathname.startsWith("/admin/documents") ||
        pathname.startsWith("/admin/quotations") ||
        pathname.startsWith("/admin/letters");
      return { Documents: isDocActive };
    },
  );

  useEffect(() => {
    if (
      pathname.startsWith("/admin/documents") ||
      pathname.startsWith("/admin/quotations") ||
      pathname.startsWith("/admin/letters")
    ) {
      setExpandedGroups((prev) => ({ ...prev, Documents: true }));
    }
  }, [pathname]);

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  const visibleNavItems = useMemo(() => {
    return ORDERED_NAV_ITEMS.filter((item) => {
      if (item.href === "/admin/settings") {
        return isSuperUser;
      }
      return true;
    });
  }, [isSuperUser]);

  const notificationItems = useMemo(
    () =>
      [
        {
          label: "Orders today",
          value: notificationCounts.orders_today,
          href: "/admin/orders",
        },
        {
          label: "Pending payments",
          value: notificationCounts.pending_payments,
          href: "/admin/payments",
        },
        {
          label: "Failed payments",
          value: notificationCounts.failed_payments,
          href: "/admin/payments",
        },
        {
          label: "Awaiting fulfilment",
          value: notificationCounts.awaiting_fulfilment,
          href: "/admin/fulfilment",
        },
        {
          label: "Pending schools",
          value: notificationCounts.pending_schools,
          href: "/admin/schools",
        },
        {
          label: "Procurement outstanding",
          value: notificationCounts.procurement_outstanding,
          href: "/admin/procurement",
        },
        {
          label: "Open tasks",
          value: notificationCounts.open_tasks,
          href: "/admin/tasks",
        },
      ].filter((item) => item.value > 0),
    [notificationCounts],
  );

  const notificationTotal = notificationItems.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  // Search items flattened across top-level and children
  const searchableNav = useMemo(() => {
    const flatItems: Array<{ label: string; href: string; icon: LucideIcon }> =
      [];
    for (const item of visibleNavItems) {
      flatItems.push({ label: item.label, href: item.href, icon: item.icon });
      if (item.children) {
        for (const child of item.children) {
          flatItems.push({
            label: child.label,
            href: child.href,
            icon: child.icon,
          });
        }
      }
    }
    return flatItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [visibleNavItems, searchQuery]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target))
        setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target))
        setSearchOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target))
        setNotificationOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/admin/notifications", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as Partial<NotificationCounts>;
        if (!cancelled) {
          setNotificationCounts({
            orders_today: Number(data.orders_today ?? 0),
            pending_payments: Number(data.pending_payments ?? 0),
            failed_payments: Number(data.failed_payments ?? 0),
            awaiting_fulfilment: Number(data.awaiting_fulfilment ?? 0),
            pending_schools: Number(data.pending_schools ?? 0),
            procurement_outstanding: Number(data.procurement_outstanding ?? 0),
            open_tasks: Number(data.open_tasks ?? 0),
          });
        }
      } catch (err) {
        console.error("[admin-shell] notifications failed:", err);
      }
    }

    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="admin-dark flex w-full min-h-screen m-0 p-0 bg-slate-950 box-border text-slate-100">
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/70 z-50 transition-opacity duration-200 pointer-events-none opacity-0 lg:hidden",
          open && "opacity-100 pointer-events-auto",
        )}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* ===================================================
          EXACT TRUE-COPY SIDEBAR
          =================================================== */}
      <aside
        id="admin-sidebar"
        className={cn(
          "sticky top-0 left-0 z-60 flex w-64 min-w-[256px] h-screen flex-shrink-0 flex-col bg-slate-900 border-r border-slate-800 box-border transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "max-lg:fixed max-lg:-translate-x-full max-lg:shadow-[12px_0_36px_rgba(0,0,0,0.7)]",
          open && "max-lg:translate-x-0",
        )}
        aria-label="Admin navigation"
      >
        {/* 1. Brand Logo Header */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-5 pt-6 pb-5 border-0 bg-transparent cursor-pointer no-underline text-left"
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className="flex flex-col leading-tight">
              <Image
                src={brandLogoPaths.white}
                alt="Pexpacks"
                width={140}
                height={32}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </span>
          </button>

          {profileOpen && (
            <div
              className="absolute top-[calc(100%-6px)] left-3 right-3 w-auto bg-slate-950 border border-slate-800 rounded-xl shadow-[0_20px_48px_rgba(0,0,0,0.75),0_0_20px_rgba(0,0,0,0.5)] z-[999] p-2 box-border"
              role="menu"
            >
              <div className="flex items-center gap-2.5 p-2 pb-2.5 border-b border-slate-800 mb-1.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={36} height={36} />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs font-bold text-slate-100 leading-tight truncate max-w-[155px]">
                    {displayName}
                  </strong>
                  <div className="text-[10px] text-slate-400 leading-snug truncate max-w-[155px] mt-0.5">
                    {userEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold cursor-pointer transition-colors hover:bg-rose-500/25 hover:border-rose-500/40 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={15} />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>

        {/* 2. Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 pb-4 flex flex-col gap-0.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.800)_transparent]">
          {visibleNavItems.map((item) => {
            const NavIcon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive = hasChildren
              ? item.children!.some((child) =>
                  isActiveRoute(child.href, pathname, child.exact),
                )
              : false;
            const active =
              isActiveRoute(item.href, pathname, item.exact) || isChildActive;
            const isExpanded = expandedGroups[item.label] ?? false;

            if (hasChildren) {
              return (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "relative flex items-center gap-3 w-full min-h-[42px] px-3.5 rounded-lg bg-transparent text-slate-300 font-sans text-sm font-medium no-underline text-left border border-transparent cursor-pointer transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:-outline-offset-2",
                      active &&
                        "bg-emerald-500/15 text-emerald-400 font-semibold border-l-[3px] border-emerald-500 rounded-l-xs hover:bg-emerald-500/20 hover:text-emerald-300",
                    )}
                    aria-expanded={isExpanded}
                  >
                    <NavIcon
                      size={17}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-emerald-400" : "text-slate-400",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span
                      className={cn(
                        "ml-auto flex items-center justify-center text-slate-400 transition-transform duration-180",
                        isExpanded && "rotate-180 text-emerald-400",
                      )}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-0.5 ml-5 pl-2 border-l border-slate-800 mt-0.5 mb-1">
                      {item.children!.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isActiveRoute(
                          subItem.href,
                          pathname,
                          subItem.exact,
                        );
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "relative flex items-center gap-2.5 w-full min-h-[36px] px-3 rounded-lg bg-transparent text-slate-400 font-sans text-[13px] font-medium no-underline text-left border border-transparent cursor-pointer transition-colors hover:bg-slate-800 hover:text-white",
                              subActive &&
                                "bg-emerald-500/15 text-emerald-400 font-semibold border-l-2 border-emerald-500 rounded-l-xs hover:bg-emerald-500/20 hover:text-emerald-300",
                            )}
                            aria-current={subActive ? "page" : undefined}
                          >
                            <SubIcon
                              size={15}
                              className={cn(
                                "shrink-0 transition-colors",
                                subActive
                                  ? "text-emerald-400"
                                  : "text-slate-400",
                              )}
                              aria-hidden="true"
                            />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 w-full min-h-[42px] px-3.5 rounded-lg bg-transparent text-slate-300 font-sans text-sm font-medium no-underline text-left border border-transparent cursor-pointer transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:-outline-offset-2",
                  active &&
                    "bg-emerald-500/15 text-emerald-400 font-semibold border-l-[3px] border-emerald-500 rounded-l-xs hover:bg-emerald-500/20 hover:text-emerald-300",
                )}
                aria-current={active ? "page" : undefined}
              >
                <NavIcon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-emerald-400" : "text-slate-400",
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ===================================================
          MAIN CONTENT AREA
          =================================================== */}
      <div className="flex flex-col min-w-0 max-w-full flex-1 bg-slate-950 box-border overflow-x-hidden">
        <header className="sticky top-0 z-45 flex min-h-[64px] items-center justify-between gap-4 px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 backdrop-blur-md">
          <button
            type="button"
            className="hidden max-lg:flex items-center justify-center w-9 h-9 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 cursor-pointer hover:bg-slate-800 hover:text-white transition-colors shrink-0"
            onClick={() => setOpen((val) => !val)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Universal Search Bar */}
          <div className="relative w-[min(460px,50vw)] max-sm:flex-1" ref={searchRef}>
            <form
              className="relative flex h-10 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchableNav.length > 0) {
                  router.push(searchableNav[0].href);
                  setSearchOpen(false);
                }
              }}
            >
              <Search
                size={15}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search schools, orders, products, suppliers..."
                autoComplete="off"
                className="w-full h-10 pl-9.5 pr-14 py-0 border border-slate-800 rounded-lg bg-slate-900 text-slate-100 text-xs sm:text-[13px] outline-none transition-colors focus:border-emerald-500 focus:bg-slate-950 placeholder:text-slate-500"
              />
              <kbd className="absolute right-2.5 hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded select-none pointer-events-none">
                Ctrl K
              </kbd>
            </form>

            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-slate-950 border border-slate-800 rounded-lg shadow-[0_16px_36px_rgba(0,0,0,0.6)] max-h-[280px] overflow-y-auto z-50 p-1.5 flex flex-col gap-0.5">
                {searchableNav.length ? (
                  searchableNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-300 no-underline text-xs hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Icon size={14} className="shrink-0 text-slate-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="m-0 p-2 text-xs text-slate-400">
                    No matching pages
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Top Actions: Notification Bell + Discussion Drawer + Global CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                className="relative flex items-center justify-center w-9.5 h-9.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer no-underline transition-colors hover:bg-slate-800 hover:border-slate-700 hover:text-white"
                onClick={() => setNotificationOpen((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell size={16} />
                {notificationTotal > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold border-2 border-slate-900">
                    {notificationTotal > 99 ? "99+" : notificationTotal}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] right-0 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-[0_20px_48px_rgba(0,0,0,0.6)] z-50 overflow-hidden p-2 flex flex-col gap-1"
                  role="menu"
                >
                  <strong className="block px-2.5 pt-2 pb-2.5 border-b border-slate-800 text-slate-100 text-xs font-extrabold">
                    Operational alerts
                  </strong>
                  {notificationItems.length ? (
                    notificationItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-slate-300 text-xs no-underline hover:bg-slate-900 hover:text-white transition-colors"
                      >
                        <span>{item.label}</span>
                        <strong className="text-slate-100 text-xs">
                          {item.value}
                        </strong>
                      </Link>
                    ))
                  ) : (
                    <p className="m-0 px-2.5 py-3 text-slate-400 text-xs">
                      No open alerts
                    </p>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/admin/tasks"
              className="relative flex items-center justify-center w-9.5 h-9.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer no-underline transition-colors hover:bg-slate-800 hover:border-slate-700 hover:text-white"
              aria-label="Messages"
            >
              <MessageSquare size={16} />
            </Link>
          </div>
        </header>

        <main id="admin-content" className="p-4 sm:p-6 flex-1 min-w-0 w-full max-w-full box-border">
          {children}
        </main>
      </div>
    </div>
  );
}
