import Image, { type ImageProps } from "next/image";
import { brandLogoPaths, type BrandLogoVariant } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type LogoProps = Omit<ImageProps, "src" | "alt"> & {
  variant?: BrandLogoVariant;
  alt?: string;
};

export function Logo({
  variant = "default",
  alt = "Pexpacks",
  width,
  height,
  unoptimized = true,
  className,
  style,
  ...props
}: LogoProps) {
  const isIcon = variant === "icon";
  const defaultWidth = isIcon ? 51 : 219;
  const defaultHeight = 86;
  const w = width ?? defaultWidth;
  const h = height ?? defaultHeight;

  return (
    <Image
      src={brandLogoPaths[variant]}
      alt={alt}
      width={w}
      height={h}
      unoptimized={unoptimized}
      className={cn(isIcon ? "aspect-[51/86]" : "aspect-[219/86]", className)}
      style={{
        aspectRatio: `${w} / ${h}`,
        ...style,
      }}
      {...props}
    />
  );
}
