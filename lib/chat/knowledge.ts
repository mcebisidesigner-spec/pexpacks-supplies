import { getPublishedCmsFaqs, type CmsFaqTargetPage } from "@/lib/cms";

export type PexKnowledgeCard = { id: string; question: string; answer: string; href: string };

function pageForPath(pathname?: string): CmsFaqTargetPage | undefined {
  if (!pathname) return undefined;
  if (pathname.startsWith("/schools")) return "schools";
  if (pathname.startsWith("/track-order")) return "track_order";
  if (pathname.startsWith("/happy-pay")) return "happy_pay";
  if (pathname.startsWith("/add-your-school")) return "add_your_school";
  if (pathname.startsWith("/partnership")) return "partnership";
  return "homepage";
}

function terms(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
}

export async function getPexKnowledgeCards(query: string, pathname?: string): Promise<PexKnowledgeCard[]> {
  const queryTerms = terms(query);
  if (queryTerms.size === 0) return [];

  let faqs;
  try {
    faqs = await getPublishedCmsFaqs(pageForPath(pathname));
  } catch (error) {
    console.error("[pex-chat] CMS knowledge lookup failed:", error);
    return [];
  }

  return faqs
    .map((faq) => {
      const contentTerms = terms(`${faq.question} ${faq.answer}`);
      const score = [...queryTerms].filter((term) => contentTerms.has(term)).length / queryTerms.size;
      return { faq, score };
    })
    .filter(({ score }) => score >= 0.25)
    .sort((a, b) => b.score - a.score || a.faq.sort_order - b.faq.sort_order)
    .slice(0, 2)
    .map(({ faq }) => ({ id: faq.id, question: faq.question, answer: faq.answer, href: "/faq" }));
}