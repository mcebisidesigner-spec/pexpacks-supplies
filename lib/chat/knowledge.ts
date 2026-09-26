import { getPublishedCmsFaqs, type CmsFaqTargetPage } from "@/lib/cms";

export type PexKnowledgeCard = { id: string; question: string; answer: string; href: string };

const KNOWLEDGE_STOP_WORDS = new Set([
  "about", "also", "and", "are", "can", "does", "for", "from", "get", "how",
  "into", "is", "my", "our", "that", "the", "these", "this", "to", "what",
  "when", "where", "which", "with", "you", "your",
]);

function pageForPath(pathname?: string): CmsFaqTargetPage | undefined {
  if (!pathname) return undefined;
  if (pathname.startsWith("/schools")) return "schools";
  if (pathname.startsWith("/track-order") || pathname.startsWith("/track")) return "track_order";
  if (pathname.startsWith("/happy-pay")) return "happy_pay";
  if (pathname.startsWith("/add-your-school")) return "add_your_school";
  if (pathname.startsWith("/partnership") || pathname.startsWith("/partner")) return "partnership";
  return "homepage";
}

function terms(value: string) {
  return new Set(
    (value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((term) => !KNOWLEDGE_STOP_WORDS.has(term)),
  );
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
      const contentTerms = terms(faq.question + " " + faq.answer);
      const matchingTerms = [...queryTerms].filter((term) => contentTerms.has(term));
      const score = matchingTerms.length / queryTerms.size;
      return { faq, score, matchingTerms };
    })
    .filter(({ score, matchingTerms }) =>
      score >= 0.34 && matchingTerms.length >= Math.min(2, queryTerms.size)
    )
    .sort((a, b) => b.score - a.score || a.faq.sort_order - b.faq.sort_order)
    .slice(0, 2)
    .map(({ faq }) => ({ id: faq.id, question: faq.question, answer: faq.answer, href: "/faq" }));
}
