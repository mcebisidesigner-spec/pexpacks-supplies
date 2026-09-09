import Image, { type ImageProps } from "next/image";
import { brandLogoPaths, type BrandLogoVariant } from "@/lib/brand-assets";

type LogoProps = Omit<ImageProps, "src" | "alt"> & {
  variant?: BrandLogoVariant;
  alt?: string;
};

export function Logo({
  variant = "default",
  alt = "Pexpacks",
  width,
  height,
  ...props
}: LogoProps) {
  const isIcon = variant === "icon";
  const defaultWidth = isIcon ? 51 : 219;
  const defaultHeight = 86;

  return (
    <Image
      src={brandLogoPaths[variant]}
      alt={alt}
      width={width ?? defaultWidth}
      height={height ?? defaultHeight}
      {...props}
    />
  );
}
