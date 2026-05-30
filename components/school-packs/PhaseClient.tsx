"use client";

import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PackCustomizer } from "@/components/packs/PackCustomizer";
import { ArticlePackCard } from "@/components/packs/ArticlePackCard";
import { CompleteListModal } from "@/components/packs/CompleteListModal";
import { DownloadListLink } from "@/components/packs/DownloadListLink";
import type {
  CompleteListPack,
  PackListItem,
} from "@/components/packs/packListTypes";
import type { PhasePack, GradePackTemplate } from "@/data/phasePacks";
import { homepagePacks, mostPopularPacksHref } from "@/data/packs";
import { formatCurrency } from "@/lib/formatCurrency";
import { createFullTrayPack } from "@/lib/order/createTrayPack";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import styles from "./PhaseClient.module.css";

type PhaseClientProps = {
  phaseData: PhasePack;
};

const phaseFaqs: Record<string, { q: string; a: string; links?: { label: string; href: string }[] }[]> = {
  "foundation-phase": [
    {
      q: "Are art supplies included?",
      a: "Yes, our Baseline packs include standard art tools like jumbo crayons, scissors, and glue. You can also customise to add paints or other specific items.",
      links: [{ label: "View Foundation Phase packs", href: "/foundation-phase" }],
    },
    {
      q: "Do the packs align with the CAPS curriculum?",
      a: "Yes, our Foundation Phase packs are designed around standard CAPS requirements for Grade R to 3.",
      links: [{ label: "Find your school", href: "/schools" }],
    },
  ],
  "primary-school": [
    {
      q: "Can I swap the type of pens or pencils?",
      a: "Absolutely. When you click Customise this pack, you can swap items, change quantities, or remove things you already have.",
      links: [{ label: "Start customising", href: "/order" }],
    },
    {
      q: "Do these packs have enough books for the year?",
      a: "The packs are designed as a solid starter for the year. Every school is different, so we recommend checking against your specific booklist and adjusting quantities if needed.",
      links: [{ label: "Check your school list", href: "/schools" }],
    },
  ],
  "high-school": [
    {
      q: "Do these packs include a scientific calculator?",
      a: "Yes, our high school baseline packs include a standard scientific calculator. You can remove it during customisation if you already have one.",
      links: [{ label: "View High School packs", href: "/high-school" }],
    },
    {
      q: "Can I add specific subject items like Accounting books?",
      a: "Yes, the customiser allows you to add specific books and items required for your chosen subjects.",
      links: [{ label: "Customise your pack", href: "/high-school" }],
    },
  ],
};

function toPhaseListItems(pack: GradePackTemplate): PackListItem[] {
  return pack.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    quantityLabel: String(item.quantity),
    icon: item.icon,
    category: item.category,
    specification: item.specification,
  }));
}




function getCardTone(phaseSlug: string): "default" | "primary" | "high" {
  if (phaseSlug === "primary-school") {
    return "primary";
  }

  if (phaseSlug === "high-school") {
    return "high";
  }

  return "default";
}

function buildPhaseCompleteListPack(
  phaseData: PhasePack,
  pack: GradePackTemplate,
  footerActions?: CompleteListPack["footerActions"]
): CompleteListPack {
  return {
    id: `phase-${phaseData.slug}-${pack.id}`,
    gradeLabel: pack.grade,
    modalTitle: `${pack.grade} Stationery List`,
    contentHeading: "Complete stationery list",
    description: `Prepared according to the standard stationery list for ${pack.grade}.`,
    priceLabel: `From ${formatCurrency(pack.priceFrom)}`,
    items: toPhaseListItems(pack),
    footerActions,
  };
}

type PhasePackActionsProps = {
  phaseData: PhasePack;
  pack: GradePackTemplate;
  onCustomise: (
    pack: GradePackTemplate,
    event: MouseEvent<HTMLButtonElement>
  ) => void;
};

function PhasePackActions({
  phaseData,
  pack,
  onCustomise,
}: PhasePackActionsProps) {
  const addPack = usePackTrayStore((s) => s.addPack);
  const openTray = usePackTrayStore((s) => s.openTray);

  const handleAddFullPack = useCallback(() => {
    const totalQuantity = pack.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedUnitPrice =
      pack.priceFrom && totalQuantity ? pack.priceFrom / totalQuantity : 0;

    addPack(
      createFullTrayPack({
        packId: pack.id,
        basePackId: pack.id,
        packName: pack.title,
        schoolSlug: phaseData.slug,
        schoolName: phaseData.title,
        grade: pack.grade,
        gradeSlug: pack.id,
        items: pack.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? estimatedUnitPrice,
        })),
        totalPrice: pack.priceFrom,
        sourcePath: window.location.pathname,
      })
    );
    openTray();
  }, [addPack, openTray, phaseData, pack]);

  return (
    <>
      <div className={styles.cardActions}>
        <Button type="button" onClick={handleAddFullPack} size="sm">
          Buy Full Pack
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => onCustomise(pack, event)}
        >
          Customise This Pack
        </Button>
      </div>
      <DownloadListLink
        pdfOptions={{
          schoolName: phaseData.title,
          grade: pack.grade,
          items: pack.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            specification: item.specification ?? "",
          })),
          estimatedPrice: formatCurrency(pack.priceFrom),
          fileName: `${phaseData.slug}-${pack.grade
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        }}
      />
    </>
  );
}

export function PhaseClient({ phaseData }: PhaseClientProps) {
  const [selectedCustomPack, setSelectedCustomPack] =
    useState<GradePackTemplate | null>(null);
  const [selectedListPackId, setSelectedListPackId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const customiseTriggerRef = useRef<HTMLButtonElement | null>(null);
  const viewListTriggerRef = useRef<HTMLButtonElement | null>(null);

  const addPack = usePackTrayStore((s) => s.addPack);
  const openTray = usePackTrayStore((s) => s.openTray);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const faqs = phaseFaqs[phaseData.slug] || [];

  const handleCustomise = (
    pack: GradePackTemplate,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    customiseTriggerRef.current = event.currentTarget;
    setSelectedCustomPack(pack);
  };

  const closeCustomiser = useCallback(() => {
    setSelectedCustomPack(null);
    window.setTimeout(() => {
      customiseTriggerRef.current?.focus();
    }, 0);
  }, []);

  const closeCompleteList = useCallback(() => {
    setSelectedListPackId(null);
    window.setTimeout(() => {
      viewListTriggerRef.current?.focus();
    }, 0);
  }, []);

  const handleAddToOrder = useCallback((pack: GradePackTemplate) => {
    const totalQuantity = pack.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedUnitPrice =
      pack.priceFrom && totalQuantity ? pack.priceFrom / totalQuantity : 0;

    addPack(
      createFullTrayPack({
        packId: pack.id,
        basePackId: pack.id,
        packName: pack.title,
        schoolSlug: phaseData.slug,
        schoolName: phaseData.title,
        grade: pack.grade,
        gradeSlug: pack.id,
        items: pack.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? estimatedUnitPrice,
        })),
        totalPrice: pack.priceFrom,
        sourcePath: window.location.pathname,
      })
    );
    openTray();
    closeCompleteList();
  }, [addPack, openTray, phaseData, closeCompleteList]);

  const otherPhases = homepagePacks.filter(
    (pack) => pack.href !== `/${phaseData.slug}`
  );

  const selectedListPackTemplate = selectedListPackId
    ? phaseData.gradePacks.find((pack) => pack.id === selectedListPackId)
    : undefined;
  const selectedListPack = selectedListPackTemplate
    ? buildPhaseCompleteListPack(
        phaseData,
        selectedListPackTemplate,
        <PhasePackActions
          phaseData={phaseData}
          pack={selectedListPackTemplate}
          onCustomise={handleCustomise}
        />
      )
    : null;

  const drawerContent = selectedCustomPack ? (
    <PackCustomizer
      phaseSlug={phaseData.slug}
      gradePack={selectedCustomPack}
      onCancel={closeCustomiser}
    />
  ) : null;

  return (
    <div className={styles.phaseContainer} data-phase={phaseData.slug}>
      <div className={styles.progressStepper}>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <div className={styles.stepIcon}>1</div>
          <span>Choose Phase</span>
        </div>
        <div className={styles.stepSeparator} />
        <div className={`${styles.step} ${styles.stepActive}`}>
          <div className={styles.stepIcon}>2</div>
          <span>Select Pack</span>
        </div>
        <div className={styles.stepSeparator} />
        <div
          className={`${styles.step} ${selectedCustomPack ? styles.stepActive : ""}`}
        >
          <div className={styles.stepIcon}>3</div>
          <span>Customise</span>
        </div>
        <div className={styles.stepSeparator} />
        <div className={styles.step}>
          <div className={styles.stepIcon}>4</div>
          <span>Review Order</span>
        </div>
      </div>

      <section className={styles.trustSection} aria-label="Pack benefits">
        <div className={styles.sectionInner}>
          <div className={styles.trustBadges}>
            <span>100% curriculum aligned</span>
            <span>Quality stationery brands</span>
            <span>Delivery or collection options</span>
          </div>
        </div>
      </section>

      <section
        className={styles.cardsSection}
        aria-label={`${phaseData.phaseRange} pack options`}
        id="grades"
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p>{phaseData.phaseRange}</p>
            <h2>Choose your standard pack</h2>
          </div>

          <div className={styles.cardsGrid}>
            {phaseData.gradePacks.map((pack, i) => (
              <ArticlePackCard
                key={pack.id}
                className={styles.animateFadeInUp}
                style={{ animationDelay: `${i * 0.1}s` }}
                tone={getCardTone(phaseData.slug)}
                gradeLabel={pack.grade}
                bestFor={`Best for ${pack.bestFor}`}
                title={pack.title}
                description={pack.summary}
                priceLabel={`From ${formatCurrency(pack.priceFrom)}`}
                items={toPhaseListItems(pack)}
                viewCompleteAriaLabel={`View complete ${pack.grade} stationery list`}
                onViewCompleteList={(event) => {
                  viewListTriggerRef.current = event.currentTarget;
                  setSelectedListPackId(pack.id);
                }}
                actions={
                  <PhasePackActions
                    phaseData={phaseData}
                    pack={pack}
                    onCustomise={handleCustomise}
                  />
                }
              />
            ))}
          </div>
        </div>
      </section>

      {isMounted && drawerContent
        ? createPortal(drawerContent, document.body)
        : null}

      <CompleteListModal
        pack={selectedListPack}
        onClose={closeCompleteList}
        onAddToOrder={
          selectedListPackTemplate
            ? () => handleAddToOrder(selectedListPackTemplate)
            : undefined
        }
      />

      {faqs.length > 0 ? (
        <section className={styles.faqSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <p>Support</p>
              <h2>Common questions</h2>
            </div>
            <div className={styles.faqGrid}>
              {faqs.map((faq) => (
                <details key={faq.q} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    <span className={styles.faqIcon} aria-hidden="true" />
                  </summary>
                  <div className={styles.faqAnswer}>
                    <p>{faq.a}</p>
                    {faq.links?.length ? (
                      <div className={styles.faqLinks}>
                        {faq.links.map((link) => (
                          <Link href={link.href} key={link.href}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {otherPhases.length > 0 ? (
        <section
          className={styles.faqSection}
          style={{
            paddingTop: "clamp(56px, 8vw, 96px)",
            borderTop: "1px solid var(--pex-border)",
          }}
        >
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <p>Explore more</p>
              <h2>Other school phases</h2>
            </div>
            <div className={styles.cardsGrid}>
              {otherPhases.map((pack) => (
                <article className={styles.gradeCard} key={pack.id}>
                  <div className={styles.cardBody}>
                    <p className={styles.bestFor}>{pack.category}</p>
                    <h3>{pack.name}</h3>
                    <p className={styles.summary}>{pack.description}</p>
                    <p
                      className={styles.priceFrom}
                      style={{ marginTop: "12px" }}
                    >
                      {pack.priceLabel}
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <Button
                      href={pack.href}
                      variant="outline"
                      style={{ width: "100%" }}
                    >
                      {pack.cta}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
