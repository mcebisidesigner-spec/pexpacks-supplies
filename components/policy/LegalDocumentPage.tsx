import type { ReactNode } from "react";
import clsx from "clsx";
import { PageHero } from "@/components/marketing/PageHero";
import { PolicyContentBar } from "./PolicyContentBar";

/** Re-export styles so page content can reference shared utility classes */
export const legalStyles = {
  documentCard: "scroll-mt-28 sm:scroll-mt-32 rounded-[22px] sm:rounded-[28px] border border-slate-200/90 bg-white/95 shadow-sm overflow-hidden",
  sectionHeader: "grid gap-2.5 p-5 sm:p-7 border-b border-slate-100",
  sectionBody: "p-5 sm:p-7 text-slate-700 text-sm sm:text-base leading-relaxed [&>p]:mb-4.5 [&>ul]:mb-4.5 [&>ol]:mb-4.5 [&>ul]:list-disc [&>ul]:pl-5.5 [&>ol]:list-decimal [&>ol]:pl-5.5 [&_a]:font-bold [&_a]:text-[#1a2a40] [&_a]:underline [&_a]:decoration-teal-600/50 hover:[&_a]:text-teal-600 [&_strong]:text-[#1a2a40]",
  noticeBlock: "rounded-2xl border border-amber-500/25 bg-amber-50/70 p-4.5 sm:p-5 my-4 text-slate-700 text-sm sm:text-base leading-relaxed",
  contactPanel: "rounded-2xl border border-teal-600/20 bg-teal-50/50 p-5 sm:p-6 my-5 text-slate-700 text-sm sm:text-base leading-relaxed",
  summaryTable: "w-full border-collapse text-left text-sm my-4",
};

export type LegalDocumentHighlightTone = "default" | "accent" | "warning";

export type LegalDocumentHighlight = {
  title: string;
  content: ReactNode;
  tone?: LegalDocumentHighlightTone;
};

export type LegalDocumentSection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  content: ReactNode;
};

export type LegalDocumentConfig = {
  route: string;
  pageTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroPanelTitle: string;
  heroPanelText: string;
  tocHeading: string;
  tocAriaLabel: string;
  summaryKicker: string;
  summaryTitle: string;
  summaryText: string;
  highlights?: LegalDocumentHighlight[];
  sections: LegalDocumentSection[];
  /** Optional extra content rendered after all sections (e.g. consent wording card). */
  extraContent?: ReactNode;
  notice?: ReactNode;
};

function highlightToneClass(tone: LegalDocumentHighlightTone | undefined) {
  if (tone === "accent") {
    return "border-teal-600/30 bg-teal-50/60";
  }

  if (tone === "warning") {
    return "border-amber-500/30 bg-amber-50/60";
  }

  return "border-slate-200/90 bg-white/80";
}

export function LegalDocumentPage({
  pageTitle,
  heroEyebrow,
  heroPanelTitle,
  heroPanelText,
  tocHeading,
  tocAriaLabel,
  summaryKicker,
  summaryTitle,
  summaryText,
  highlights = [],
  sections,
  extraContent,
  notice,
}: LegalDocumentConfig) {
  const topics = sections.map(({ id, title }) => ({ id, title }));
  const headingId = `${tocHeading.toLowerCase().replace(/\s+/g, "-")}-title`;

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={pageTitle}
        panelTitle={heroPanelTitle}
        panelText={heroPanelText}
      />

      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] gap-7 items-start max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <PolicyContentBar
            ariaLabel={tocAriaLabel}
            classNames={{
              tocCard: "rounded-[22px] sm:rounded-[24px] border border-slate-200/90 p-3.5 sm:p-5 bg-white sm:bg-white/80 sm:backdrop-blur-md shadow-sm max-h-none lg:max-h-[calc(100dvh-104px)] overflow-hidden lg:overflow-y-auto [&_ol]:flex [&_ol]:flex-nowrap [&_ol]:overflow-x-auto lg:[&_ol]:grid lg:[&_ol]:gap-1.5 [&_ol]:gap-2 [&_ol]:m-0 [&_ol]:p-0 [&_ol]:list-none [&_li]:shrink-0 lg:[&_li]:shrink [&_a]:block [&_a]:whitespace-nowrap lg:[&_a]:whitespace-normal [&_a]:rounded-xl [&_a]:px-3 [&_a]:py-2 [&_a]:text-xs sm:[&_a]:text-sm [&_a]:font-bold [&_a]:text-slate-700 [&_a]:no-underline hover:[&_a]:bg-slate-100 hover:[&_a]:text-teal-600 [&_a[aria-current='true']]:bg-teal-50 [&_a[aria-current='true']]:text-teal-700 [&_a[aria-current='true']]:border [&_a[aria-current='true']]:border-teal-600/30 transition-all",
              tocEyebrow: "m-0 text-teal-600 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider",
              tocShell: "sticky top-[calc(60px+10px)] max-md:z-50 w-full lg:w-auto lg:top-[calc(72px+14px)] self-start z-20 transition-all duration-200",
              tocShellFloating: "max-md:top-2",
            }}
            heading={tocHeading}
            headingId={headingId}
            topics={topics}
          />

          <div className="grid gap-5 min-w-0">
            <div className="rounded-[22px] sm:rounded-[28px] border border-teal-600/25 p-5 sm:p-7 bg-gradient-to-br from-teal-600/[0.06] to-white shadow-sm">
              <p className="m-0 text-teal-600 text-xs font-extrabold uppercase tracking-wider">{summaryKicker}</p>
              <h2 className="my-2 sm:mt-2 sm:mb-2.5 text-[#1a2a40] text-2xl sm:text-3xl font-extrabold leading-tight">{summaryTitle}</h2>
              {summaryText ? (
                <p className="m-0 text-slate-600 text-sm sm:text-base leading-relaxed max-w-[760px]">{summaryText}</p>
              ) : null}
              {highlights.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {highlights.map((highlight) => (
                    <div
                      className={clsx("p-4 sm:px-4.5 rounded-2xl border grid gap-1.5 shadow-xs", highlightToneClass(highlight.tone))}
                      key={highlight.title}
                    >
                      <strong className="text-[#1a2a40] text-sm sm:text-[15px] font-bold">{highlight.title}</strong>
                      <span className="m-0 text-slate-500 text-xs sm:text-sm leading-relaxed">{highlight.content}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {sections.map((section) => (
              <article className="scroll-mt-28 sm:scroll-mt-32 rounded-[22px] sm:rounded-[28px] border border-slate-200/90 bg-white/95 shadow-sm overflow-hidden" id={section.id} key={section.id}>
                <div className="grid gap-2 p-5 sm:p-7 border-b border-slate-100">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-teal-600 m-0">{section.eyebrow}</p>
                  <h2 className="m-0 text-2xl sm:text-3xl font-extrabold text-[#1a2a40] leading-tight">{section.title}</h2>
                  <span className="text-slate-500 text-sm sm:text-[15px] leading-relaxed max-w-[760px]">{section.summary}</span>
                </div>
                <div className="p-5 sm:p-7 text-slate-700 text-sm sm:text-base leading-relaxed [&>p]:mb-4.5 [&>ul]:mb-4.5 [&>ol]:mb-4.5 [&>ul]:list-disc [&>ul]:pl-5.5 [&>ol]:list-decimal [&>ol]:pl-5.5 [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 [&>ol:last-child]:mb-0 [&_a]:font-bold [&_a]:text-[#1a2a40] [&_a]:underline [&_a]:decoration-teal-600/50 hover:[&_a]:text-teal-600 [&_strong]:text-[#1a2a40] [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-extrabold [&>h3]:text-[#1a2a40] [&>h3]:mt-5 [&>h3]:mb-2 [&>h3:first-child]:mt-0">{section.content}</div>
              </article>
            ))}

            {extraContent}

            {notice ? (
              <aside className="rounded-[22px] sm:rounded-[28px] border border-amber-500/25 p-5 sm:p-7 bg-gradient-to-br from-amber-500/[0.08] to-white shadow-sm">
                <p className="m-0 text-amber-600 text-xs font-extrabold uppercase tracking-wider">Important note</p>
                <div className="mt-2 text-slate-700 text-sm sm:text-base leading-relaxed">{notice}</div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

