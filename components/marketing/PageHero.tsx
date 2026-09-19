import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text?: string;
  panelTitle?: string;
  panelText?: string;
  panelChildren?: ReactNode;
  panelClassName?: string;
  children?: ReactNode;
  variant?: "default" | "navy";
};

export function PageHero({
  eyebrow,
  title,
  text,
  panelTitle,
  panelText,
  panelChildren,
  panelClassName,
  children,
  variant = "default",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "bg-pex-navy",
        variant === "navy"
          ? "pt-[clamp(52px,8vw,96px)] pb-[clamp(58px,8vw,108px)]"
          : "pt-[clamp(36px,6vw,52px)] pb-[clamp(44px,8vw,72px)] md:pt-[clamp(52px,8vw,96px)] md:pb-[clamp(58px,8vw,108px)]"
      )}
    >
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-[clamp(38px,6vw,76px)] items-center">
        <div className="max-w-[850px] min-w-0">
          <p className="m-0 mb-4 text-pex-keppel font-extrabold text-sm tracking-normal">
            {eyebrow}
          </p>
          <h1 className="m-0 text-white font-heading text-[clamp(28px,10vw,34px)] sm:text-[clamp(32px,9vw,42px)] lg:text-[clamp(38px,5.4vw,64px)] font-extrabold leading-[1.06] tracking-tight [overflow-wrap:anywhere]">
            {title}
          </h1>
          {text ? (
            <p className="max-w-[530px] my-[18px] mb-6 text-white/80 text-[clamp(15px,2.5vw,16px)] lg:text-[clamp(15.5px,1.8vw,17px)] leading-[1.55]">
              {text}
            </p>
          ) : null}
          {children}
        </div>
        {panelChildren || panelTitle || panelText ? (
          <aside
            className={cn(
              "border border-pex-border rounded-card p-[22px] md:p-[32px_34px] bg-card shadow-[0_16px_44px_rgba(0,0,0,0.16)]",
              panelClassName
            )}
            aria-label={`${eyebrow} summary`}
          >
            {panelChildren || (
              <>
                {panelText ? (
                  <p className="m-0 mb-2.5 text-pex-muted text-[13.5px] font-semibold leading-[1.4] tracking-tight">
                    {panelText}
                  </p>
                ) : null}
                {panelTitle ? (
                  <strong className="block text-pex-navy text-[clamp(22px,2.4vw,28px)] font-extrabold leading-[1.25] tracking-tight">
                    {panelTitle}
                  </strong>
                ) : null}
              </>
            )}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

