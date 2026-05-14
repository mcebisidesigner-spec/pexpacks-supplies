import type { ImgHTMLAttributes } from "react";
import { brandLogoPaths, type BrandLogoVariant } from "@/lib/brand-assets";

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  variant?: BrandLogoVariant;
};

export function Logo({ variant = "default", alt = "", ...props }: LogoProps) {
  return <img src={brandLogoPaths[variant]} alt={alt} width={219} height={86} {...props} />;
}
