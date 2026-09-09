import { siteUrl } from "@/lib/seo";

const brandLogoVersion = "20260909";

export const brandLogoPaths = {
  default: `/images/logo.svg?v=${brandLogoVersion}`,
  white: `/images/logo-white.svg?v=${brandLogoVersion}`,
  icon: `/images/logo-icon.svg?v=${brandLogoVersion}`,
  iconPng: `/images/logo.png?v=${brandLogoVersion}`,
} as const;

export type BrandLogoVariant = keyof typeof brandLogoPaths;

export const brandLogoUrls = {
  default: `${siteUrl}${brandLogoPaths.default}`,
  white: `${siteUrl}${brandLogoPaths.white}`,
  icon: `${siteUrl}${brandLogoPaths.icon}`,
  iconPng: `${siteUrl}${brandLogoPaths.iconPng}`,
} as const;
