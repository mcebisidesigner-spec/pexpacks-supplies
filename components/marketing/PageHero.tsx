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
          ? "pt-12 pb-14 sm:pt-16 sm:pb-20"
          : "pt-10 pb-12 sm:pt-14 sm:pb-20"
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-8 lg:gap-12 items-center">
        <div className="max-w-2xl min-w-0">
          <p className="m-0 mb-4 text-pex-keppel font-extrabold text-xs sm:text-sm tracking-normal">
            {eyebrow}
          </p>
          <h1 className="m-0 text-white font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.06] tracking-tight [overflow-wrap:anywhere]">
            {title}
          </h1>
          {text ? (
            <p className="max-w-2xl my-4 mb-6 text-white/80 text-base lg:text-lg leading-relaxed">
              {text}
            </p>
          ) : null}
          {children}
        </div>
        {panelChildren || panelTitle || panelText ? (
          <aside
            className={cn(
              "border border-slate-200/80 rounded-2xl p-4 sm:p-6 bg-white shadow-sm",
              panelClassName
            )}
            aria-label={`${eyebrow} summary`}
          >
            {panelChildren || (
              <>
                {panelText ? (
                  <p className="m-0 mb-2 text-slate-600 text-sm font-semibold leading-relaxed">
                    {panelText}
                  </p>
                ) : null}
                {panelTitle ? (
                  <strong className="block text-pex-navy text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
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

