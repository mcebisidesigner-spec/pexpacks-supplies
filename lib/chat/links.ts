export const PEX_ROUTES = {
  schools: "/schools",
  uploadList: "/upload-a-list",
  track: "/track",
  checkout: "/checkout",
  partner: "/partnership",
  contact: "/contact",
  faq: "/faq",
  pexcover: "/pexcover",
} as const;

type PexActionLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const STATIC_PEX_PATHS = new Set<string>(Object.values(PEX_ROUTES));

export function isPexHref(href?: string | null): href is string {
  if (!href || href === "#") return false;

  try {
    const url = new URL(href, "https://pexpacks.local");
    if (url.origin !== "https://pexpacks.local") return false;

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return (
      STATIC_PEX_PATHS.has(pathname) ||
      /^\/schools\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)
    );
  } catch {
    return false;
  }
}

export function sanitizePexActions(
  actions: readonly PexActionLink[],
  limit = 3,
): PexActionLink[] {
  const seen = new Set<string>();

  return actions
    .filter((action) => {
      if (!isPexHref(action.href) || seen.has(action.href)) return false;
      seen.add(action.href);
      return true;
    })
    .slice(0, limit);
}