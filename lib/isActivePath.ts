export function isActivePath(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/schools") {
    return pathname === "/schools" || pathname.startsWith("/schools/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
