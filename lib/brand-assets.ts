import { siteUrl } from "@/lib/seo";

const brandLogoVersion = "20260514";

export const brandLogoPaths = {
  default: `/images/logo.svg?v=${brandLogoVersion}`,
  white: `/images/logo-white.svg?v=${brandLogoVersion}`,
} as const;

export type BrandLogoVariant = keyof typeof brandLogoPaths;

export const brandLogoUrls = {
  default: `${siteUrl}${brandLogoPaths.default}`,
  white: `${siteUrl}${brandLogoPaths.white}`,
} as const;
