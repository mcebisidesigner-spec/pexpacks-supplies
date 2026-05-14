import { siteUrl } from "@/lib/seo";

export const brandLogoPaths = {
  default: "/images/logo.svg",
  white: "/images/logo-white.svg",
} as const;

export type BrandLogoVariant = keyof typeof brandLogoPaths;

export const brandLogoUrls = {
  default: `${siteUrl}${brandLogoPaths.default}`,
  white: `${siteUrl}${brandLogoPaths.white}`,
} as const;
