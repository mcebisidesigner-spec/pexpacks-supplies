"use client";

import { SchoolSearchBox } from "@/components/ui/SchoolSearchBox";
import { SchoolsHowItWorks } from "./SchoolsHowItWorks";

type SchoolSearchPanelProps = {
  initialQuery?: string;
  readQueryFromUrl?: boolean;
};

/**
 * SchoolSearchPanel — the full-width search panel on the /schools page.
 * Delegates the search card to the shared SchoolSearchBox and adds the
 * mobile "how it works" strip below.
 */
export function SchoolSearchPanel({
  readQueryFromUrl = false,
}: SchoolSearchPanelProps) {
  return (
    <section
      id="school-search"
      className="w-full max-w-[1120px] flex flex-col pex-school-search-focus-anchor"
    >
      <SchoolSearchBox
        source="schools"
        readQueryFromUrl={readQueryFromUrl}
        showBrowseLink
      />

      {/* Mobile-only "how it works" strip */}
      <SchoolsHowItWorks className="block lg:hidden max-w-full mt-3 !px-0" />
    </section>
  );
}
