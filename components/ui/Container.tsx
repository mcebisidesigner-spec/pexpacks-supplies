import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "main";
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "w-full max-w-[1280px] mx-auto px-[clamp(16px,4vw,24px)] md:px-[clamp(24px,5vw,40px)] lg:px-[clamp(40px,5vw,64px)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
