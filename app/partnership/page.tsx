import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getFaqs, getWebsiteContent } from "@/lib/cms";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { PartnershipPageContent } from "@/components/partnership/PartnershipPageContent";
import type { FAQ } from "@/data/faqs";

const fallbackInstitutionalFaqs: FAQ[] = [
  {
    id: "institutional-rebate-structure",
    category: "Schools",
    question: "How does the institutional partnership rebate work?",
    answer:
      "Pexpacks returns up to 3.0% of qualifying stationery turnover directly to your school development fund. The rebate rate is tiered based on parent adoption: 1.5% below 30% adoption, 2.0% between 30% and 60%, and 3.0% for 60% and above. An itemised audit statement and electronic remittance are provided annually following the seasonal back-to-school period.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "Partnership Terms", href: "/school-partnership-terms" },
    ],
  },
  {
    id: "admin-workload-teachers",
    category: "Schools",
    question: "Does this partnership create administrative work for teachers or bursary staff?",
    answer:
      "Zero. Pexpacks manages list collation, inventory allocation, custom packaging, online payment collection, parent queries, and delivery. School personnel only review and approve the grade stationery specifications once per academic year and share the official link with parents.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "Contact Institutional Team", href: "/contact" },
    ],
  },
  {
    id: "digital-infrastructure-scope",
    category: "Schools",
    question: "What is included in the 12-Month Digital Infrastructure Package?",
    answer:
      "Qualifying partner institutions receive a complimentary 12-month digital infrastructure suite. Pexpacks builds, launches, and hosts a dedicated school ordering portal reflecting your school branding, with managed SSL encryption and zero server administration or maintenance fees.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "School Partnership Terms", href: "/school-partnership-terms" },
    ],
  },
  {
    id: "parent-payment-options",
    category: "Schools",
    question: "What payment options are available for parents?",
    answer:
      "Parents can pay via credit or debit card, instant EFT, and verified Happy Pay interest-free split installments (pay in 2 or 4 equal payments). This removes all manual cash collection from the school finance desk while providing flexible affordability for families.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    id: "delivery-campus-logistics",
    category: "Schools",
    question: "How is delivery and pack distribution handled on campus?",
    answer:
      "Pexpacks accommodates your campus preferences: packs can be bulk-delivered and sorted by grade/class directly to campus prior to term opening, or dispatched directly to parents' residences with door-to-door courier tracking.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    id: "custom-school-packaging",
    category: "Schools",
    question: "How does the custom-branded reusable bag program work?",
    answer:
      "Rather than disposable plastic bags or generic cartons, packs can be provided in durable reusable bags featuring your school crest and colours, a clear learner ID window for effortless classroom allocation, and reflective safety piping.",
    links: [
      { label: "Partnership Overview", href: "/partnership" },
      { label: "Find School Packs", href: "/schools" },
    ],
  },
];

export const metadata: Metadata = buildMetadata(
  "School Stationery Partnerships | Pexpacks Supplies",
  "Institutional stationery procurement, customized learner packs, and up to 3% development rebate for Gauteng primary and high schools. Zero administrative load.",
  "/partnership",
);

export const revalidate = 300;

export default async function PartnerWithSchoolsPage() {
  const [cmsFaqs, content] = await Promise.all([
    getFaqs("partnership"),
    getWebsiteContent(),
  ]);
  const hero = content["partnership.hero"];
  const heroEyebrow =
    typeof hero?.eyebrow === "string" && hero.eyebrow
      ? hero.eyebrow
      : "Partner with us";
  const heroTitle =
    typeof hero?.title === "string" && hero.title
      ? hero.title
      : "Free school website +";

  const displayFaqs: FAQ[] =
    cmsFaqs && cmsFaqs.length > 0 ? cmsFaqs : fallbackInstitutionalFaqs;

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        text="Empower your school with a free custom website, parent ordering portal, and a 1.5% fundraising rebate on every stationery pack sold."
        panelTitle="What your school gets"
        panelText="Free website, hosting, SSL, parent portal & 1.5% rebate"
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-5 items-stretch sm:items-center">
          <Button href="#partnership-enquiry" variant="primary" className="w-full sm:w-auto min-h-[44px]">
            Apply to Partner
          </Button>
          <Button href="#how-it-works" variant="white" className="w-full sm:w-auto min-h-[44px]">
            How It Works
          </Button>
        </div>
      </PageHero>

      <PartnershipPageContent />

      <div id="partnership-faq" style={{ paddingBottom: "48px" }}>
        <FaqMarquee
          faqs={displayFaqs}
          eyebrow="Institutional FAQ"
          title="Frequently asked questions"
          seeAllHref="/faq"
        />
      </div>
    </>
  );
}
