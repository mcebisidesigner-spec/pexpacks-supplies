import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  headingId?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  text,
  headingId,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-[760px] mb-8 md:mb-[34px]", className)}>
      {eyebrow ? (
        <p className="m-0 mb-2 text-primary font-bold text-xs md:text-sm tracking-[0.08em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={headingId}
        className={cn(
          "m-0 text-primary font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-extrabold leading-[1.05] tracking-tight",
          headingId && "scroll-mt-24 md:scroll-mt-28"
        )}
      >
        {title}
      </h2>
      {text ? (
        <p className="mt-3.5 text-muted-foreground text-base md:text-lg leading-relaxed font-normal">
          {text}
        </p>
      ) : null}
    </div>
  );
}
