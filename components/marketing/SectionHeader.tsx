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
    <div className={cn("max-w-4xl mb-8 md:mb-10", className)}>
      {eyebrow ? (
        <p className="m-0 mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={headingId}
        className={cn(
          "m-0 max-w-4xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance",
          headingId && "scroll-mt-24 md:scroll-mt-28"
        )}
      >
        {title}
      </h2>
      {text ? (
        <p className="mt-4 max-w-3xl text-slate-600 text-base md:text-lg leading-relaxed font-normal">
          {text}
        </p>
      ) : null}
    </div>
  );
}
