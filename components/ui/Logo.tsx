import Image, { type ImageProps } from "next/image";
import { brandLogoPaths, type BrandLogoVariant } from "@/lib/brand-assets";

type LogoProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  variant?: BrandLogoVariant;
  alt?: string;
};

export function Logo({ variant = "default", alt = "", ...props }: LogoProps) {
  return (
    <Image
      src={brandLogoPaths[variant]}
      alt={alt}
      width={219}
      height={86}
      {...props}
    />
  );
}
