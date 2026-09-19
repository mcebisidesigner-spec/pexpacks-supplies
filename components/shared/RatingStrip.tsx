import { cn } from "@/lib/utils";

type RatingStripProps = {
  text?: string;
  className?: string;
};

export function RatingStrip({
  text = "Equipping every learner for greatness.",
  className,
}: RatingStripProps) {
  return (
    <div className={cn("mt-5 flex items-center justify-center gap-2", className)}>
      <span className="text-amber-500 text-base tracking-[2px] select-none" aria-hidden="true">
        ★★★★★
      </span>
      <span className="text-pex-muted text-xs">
        <strong className="text-pex-navy font-bold">{text}</strong>
      </span>
    </div>
  );
}
