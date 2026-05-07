export function isActivePath(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/school") {
    return pathname === "/school" || pathname.startsWith("/schools") || pathname.startsWith("/school-packs");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
