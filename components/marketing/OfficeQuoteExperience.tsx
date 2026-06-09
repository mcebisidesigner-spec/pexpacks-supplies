"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import type { OfficePack } from "@/data/officePacks";
import { OfficeReconciliationConcierge } from "./OfficeReconciliationConcierge";
import { formatCurrency } from "@/lib/formatCurrency";
import { endpointPathForFormType } from "@/lib/forms/types";
import {
  isValidSouthAfricanPhone,
  isValidEmailAddress,
} from "@/lib/forms/contact";
import officeStyles from "@/components/marketing/Marketing.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import formStyles from "@/components/marketing/MarketingForms.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type QuoteMode = "standard" | "custom";

type OfficeQuoteExperienceProps = {
  officePacks: OfficePack[];
  initialMessage?: string;
};

const trustSignals = [
  "Tax invoices provided",
  "Gauteng delivery or collection",
  "Custom quantities supported",
  "Business-ready admin packs",
];

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const itemBrandDetails: Record<string, string> = {
  "Notebook set": "3x A4 72-page Feint/Margin books (Croxley)",
  "Ballpoint pens": "Pack of 10 black & blue medium pens (Bic / Pilot)",
  Pencils: "Pack of 4 HB graphite pencils (Staedtler)",
  "Sticky notes": "3x3 yellow self-adhesive notes, 100 sheets (Post-it)",
  "Correction tape": "5mm x 8m dry correction tape (Pritt / Penflex)",
  "Filing basics": "2x Lever arch files, 10x plastic sleeves (Croxley)",
  Pens: "Box of 50 black/blue ballpoint writing pens (Bic)",
  Notebooks: "5x Executive wirebound college books (Croxley)",
  Folders: "10x Presentation folders with fasteners (Bantex)",
  Markers: "4x Dry erase whiteboard markers (Pentel)",
  "Desk basics": "1x Heavy-duty stapler, 1x tape dispenser, staples (Bostitch)",
  "Job-card books": "3x Carbonless duplicate job card books (Croxley)",
  Labels: "100x White multi-purpose printer labels (Tower)",
  Clipboards: "3x Heavy-duty Masonite clipboards (Bantex)",
  "Receipt books": "3x Carbonless duplicate receipt books (Croxley)",
  "Price tags": "Pack of 500 white stringed price tags",
  Tape: "3x Clear packaging tape 48mm x 50m (Sellotape)",
  "Printer paper": "5x Reams of A4 Typek white 80gsm copy paper",
  "Lever arch files": "5x Polypropylene A4 lever arch files (Bantex)",
  Dividers: "5x Sets of A4 10-tab board indexes (Croxley)",
  "Plastic sleeves": "Pack of 100 clear A4 punched pockets",
  "Highlighters": "Pack of 4 assorted pastel highlighters (Stabilo Boss)",
  "Flipchart paper": "1x standard 50-sheet flipchart paper pad (A1 size)",
};

function val(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorAttributes(errors: Record<string, string>, fieldName: string) {
  return errors[fieldName]
    ? {
        "aria-describedby": `${fieldName}-error`,
        "aria-invalid": true,
      }
    : {};
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className={formStyles.fieldError}>
      {message}
    </span>
  );
}

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20h4l11-11-4-4L4 16v4z" />
    <path d="M13 7l4 4" />
  </svg>
);

export function OfficeQuoteExperience({
  officePacks,
  initialMessage = "",
}: OfficeQuoteExperienceProps) {
  const [selectedPackId, setSelectedPackId] = useState(
    officePacks[0]?.id ?? "",
  );
  const [mode, setMode] = useState<QuoteMode>("standard");
  const [items, setItems] = useState<string[]>(officePacks[0]?.contents ?? []);
  const [newItem, setNewItem] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedItemOption, setSelectedItemOption] = useState("");
  const [companySize, setCompanySize] = useState<string>("all");
  const [packQuantities, setPackQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    officePacks.forEach((p) => {
      initial[p.id] = 1;
    });
    return initial;
  });
  const [formNotes, setFormNotes] = useState(initialMessage);

  function handleBrandingClick() {
    setFormNotes((prev) => {
      const brandingText = "I would like to enquire about premium corporate branding (logo notebooks, pens, and presentation folders) for our office stationery.";
      if (prev.includes(brandingText)) return prev;
      return prev ? `${prev}\n\n${brandingText}` : brandingText;
    });
    window.setTimeout(scrollToForm, 0);
  }
  const formRef = useRef<HTMLElement | null>(null);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);

  const selectedPack = useMemo(
    () =>
      officePacks.find((pack) => pack.id === selectedPackId) ?? officePacks[0],
    [officePacks, selectedPackId],
  );

  const filteredPacks = useMemo(() => {
    if (companySize === "all") return officePacks;
    if (companySize === "solo")
      return officePacks.filter((p) => p.id === "new-hire-setup");
    if (companySize === "small")
      return officePacks.filter((p) => p.id === "boardroom-basics");
    if (companySize === "medium")
      return officePacks.filter((p) => p.id === "monthly-admin-restock");
    return officePacks;
  }, [officePacks, companySize]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function handleDownloadPdf() {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const { generateOfficeQuotePdf } = await import(
        "@/lib/pdf/generateOfficeQuotePdf"
      );
      await generateOfficeQuotePdf({
        packName: selectedPack.name,
        items,
        itemBrandDetails,
        estimatedPrice: selectedPack.priceFrom === 0
          ? "Quote-based"
          : `From ${formatCurrency(selectedPack.priceFrom)}`,
        fileName: `${selectedPack.slug}-quote-draft`,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  const itemOptions = useMemo(
    () =>
      Array.from(new Set(officePacks.flatMap((pack) => pack.contents))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [officePacks],
  );

  useEffect(() => {
    setSelectedItemOption(
      itemOptions.find((item) => !items.includes(item)) ?? itemOptions[0] ?? "",
    );
  }, [itemOptions, items]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectPack(pack: OfficePack, nextMode: QuoteMode = "standard") {
    setSelectedPackId(pack.id);
    setItems(pack.contents);
    setMode(nextMode);
    setStatus(null);
    setErrors({});
    window.setTimeout(scrollToForm, 0);
  }

  function addItem(value = selectedItemOption) {
    const nextValue = value.trim();
    if (!nextValue) return;
    if (items.includes(nextValue)) return;
    setItems((current) => [...current, nextValue]);
    setNewItem("");
  }

  function addCustomItem() {
    const value = newItem.trim();
    if (!value) return;
    if (items.includes(value)) {
      setNewItem("");
      return;
    }
    setItems((current) => [...current, value]);
    setNewItem("");
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Client-side Validation Check
    const clientErrors: Record<string, string> = {};
    const fullName = val(formData, "fullName");
    const businessName = val(formData, "businessName");
    const phone = val(formData, "phone");
    const email = val(formData, "email");
    const consent = formData.get("consent") === "on";

    if (!businessName) {
      clientErrors.businessName = "Business name is required.";
    }
    if (!fullName) {
      clientErrors.fullName = "Contact name is required.";
    } else if (fullName.length < 2) {
      clientErrors.fullName = "Name must be at least 2 characters.";
    }
    if (!phone) {
      clientErrors.phone = "Phone number is required.";
    } else if (!isValidSouthAfricanPhone(phone)) {
      clientErrors.phone = "Please enter a valid South African phone number.";
    }
    if (email && !isValidEmailAddress(email)) {
      clientErrors.email = "Please enter a valid email address.";
    }
    if (!consent) {
      clientErrors.consent = "Consent is required.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const selectedItems = mode === "custom" ? items : selectedPack.contents;
    const message = [
      `Quote mode: ${mode === "custom" ? "Customise quotation" : "Standard office quote"}`,
      `Selected pack: ${selectedPack.name}`,
      `Pack price: ${
        selectedPack.priceFrom === 0
          ? "Request quote"
          : `From ${formatCurrency(selectedPack.priceFrom)}`
      }`,
      `Items: ${selectedItems.join(", ")}`,
      `Notes: ${val(formData, "message") || "None"}`,
    ].join("\n");

    const payload = {
      formType: "office-pack-enquiry",
      fullName: val(formData, "fullName"),
      phone: val(formData, "phone"),
      email: val(formData, "email") || undefined,
      preferredContactMethod:
        val(formData, "preferredContactMethod") || undefined,
      businessName: val(formData, "businessName"),
      enquiryType: "Office pack",
      packType: selectedPack.name,
      packId: selectedPack.id,
      packName: selectedPack.name,
      selectedItems: selectedItems.join(", "),
      message,
      consent: formData.get("consent") === "on",
      companyWebsite: val(formData, "companyWebsite"),
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    setPending(true);
    setStatus(null);
    setErrors({});

    try {
      const response = await fetch(
        endpointPathForFormType("office-pack-enquiry"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as ApiResponse;
      setStatus(result);

      if (!result.success) {
        setErrors(result.errors ?? {});
        return;
      }

      form.reset();
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your office quote right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section
        className={officeStyles.officeTrustStrip}
        aria-label="Business trust signals"
      >
        <div className={sectionStyles.inner}>
          <ul>
            {trustSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionStyles.section} id="office-pack-types">
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.sectionHeader}>
            <p className={sectionStyles.sectionEyebrow}>Office pack types</p>
            <h2>Office pack options</h2>
            <p>
              Ready-to-quote packs for small teams, home offices and recurring
              admin needs.
            </p>
          </div>

          <div className={officeStyles.sizeSelectorWrapper}>
            <span className={officeStyles.sizeSelectorLabel}>
              Find packs by company size:
            </span>
            <div className={officeStyles.sizeSelectorButtons}>
              <button
                type="button"
                className={
                  companySize === "all"
                    ? officeStyles.activeSizeButton
                    : officeStyles.sizeButton
                }
                onClick={() => setCompanySize("all")}
              >
                All Sizes
              </button>
              <button
                type="button"
                className={
                  companySize === "solo"
                    ? officeStyles.activeSizeButton
                    : officeStyles.sizeButton
                }
                onClick={() => setCompanySize("solo")}
              >
                Solo / Home Office (1 user)
              </button>
              <button
                type="button"
                className={
                  companySize === "small"
                    ? officeStyles.activeSizeButton
                    : officeStyles.sizeButton
                }
                onClick={() => setCompanySize("small")}
              >
                Small Team (2-10 users)
              </button>
              <button
                type="button"
                className={
                  companySize === "medium"
                    ? officeStyles.activeSizeButton
                    : officeStyles.sizeButton
                }
                onClick={() => setCompanySize("medium")}
              >
                Medium Office (10+ users)
              </button>
            </div>
          </div>

          <div className={cardStyles.officeGrid}>
            {filteredPacks.map((pack) => {
              const qty = packQuantities[pack.id] ?? 1;
              return (
                <article className={cardStyles.packCard} key={pack.id}>
                  <div
                    className={`${cardStyles.packMedia} ${cardStyles.packMediaBlue}`}
                    aria-hidden="true"
                  >
                    <span>Office</span>
                  </div>
                  <div className={cardStyles.packBody}>
                    <p className={cardStyles.packMeta}>SME and office supplies</p>
                    <h3>{pack.name}</h3>
                    <p>{pack.description}</p>
                    <ul className={cardStyles.packList}>
                      {pack.contents.map((item) => (
                        <li key={item}>
                          <strong>{item}</strong>
                          {itemBrandDetails[item] && (
                            <span className={officeStyles.cardItemDetail}>
                              {" "}
                              — {itemBrandDetails[item]}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className={officeStyles.urgencyBadge} style={{ margin: "0 22px", width: "fit-content" }}>
                      Next-day delivery
                    </div>
                    <div className={cardStyles.packFooter}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className={cardStyles.priceLabel}>
                          {pack.priceFrom === 0
                            ? "Request quote"
                            : `From ${formatCurrency(pack.priceFrom * qty)}`}
                        </span>
                        {qty > 1 && pack.priceFrom > 0 && (
                          <span className={officeStyles.cardItemDetail} style={{ fontSize: "11px", opacity: 0.75 }}>
                            ({formatCurrency(pack.priceFrom)} each)
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <QuantityStepper
                          value={qty}
                          onChange={(newQty) =>
                            setPackQuantities((prev) => ({ ...prev, [pack.id]: newQty }))
                          }
                          min={1}
                          max={99}
                          ariaLabel={`quantity for ${pack.name}`}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => selectPack(pack, "standard")}
                        >
                          Request Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <OfficeReconciliationConcierge />

      <section className={officeStyles.brandingUpsellSection}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.sectionHeader}>
            <p className={sectionStyles.sectionEyebrow}>Brand your business</p>
            <h2>Stand out from the start</h2>
          </div>
          <div className={officeStyles.brandingGrid}>
            <div className={officeStyles.brandingCard}>
              <div className={officeStyles.brandingCardIcon} aria-hidden="true">
                <RocketIcon />
              </div>
              <p className={officeStyles.brandingCardEyebrow}>Special Offer</p>
              <h3 className={officeStyles.brandingCardTitle}>Business Starter Brand Package</h3>
              <p className={officeStyles.brandingCardDesc}>
                Logo, business cards, flyers, letterhead, and a 5-page website — everything you need to launch professionally.
              </p>
              <div className={officeStyles.brandingCardPrice}>
                <span>R5,500.00</span>
              </div>
              <div className={officeStyles.brandingCardAction}>
                <Button href="/business-starter-brand-package" variant="white">
                  Learn More
                </Button>
              </div>
            </div>
            <div className={officeStyles.brandingCard}>
              <div className={officeStyles.brandingCardIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <p className={officeStyles.brandingCardEyebrow}>Corporate Identity</p>
              <h3 className={officeStyles.brandingCardTitle}>Custom Branded Stationery</h3>
              <p className={officeStyles.brandingCardDesc}>
                Notebooks, pens, and presentation folders featuring your company logo. Premium branding added to any office pack.
              </p>
              <div className={officeStyles.brandingCardAction}>
                <Button
                  type="button"
                  variant="white"
                  onClick={handleBrandingClick}
                >
                  Add Corporate Branding
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={officeStyles.officeSocialProof} aria-label="Customer testimonials">
        <div className={officeStyles.officeSocialProofInner}>
          <div className={officeStyles.officeSocialProofQuote}>
            <blockquote>
              We switched from Makro halfway through the year. Pexpacks delivers next day with proper invoices — our bookkeeper was thrilled.
            </blockquote>
            <p className={officeStyles.officeSocialProofAuthor}>
              &mdash; Marius C., Office Manager, Fourways
            </p>
          </div>
          <div className={officeStyles.officeSocialProofStats}>
            <div className={officeStyles.officeSocialProofStat}>
              <strong>50+</strong>
              <span>SMEs served</span>
            </div>
            <div className={officeStyles.officeSocialProofStat}>
              <strong>Next-day</strong>
              <span>Gauteng delivery</span>
            </div>
            <div className={officeStyles.officeSocialProofStat}>
              <strong>SARS</strong>
              <span>Compliant invoices</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact-enquiry"
        className={sectionStyles.section}
        ref={formRef}
      >
        <div className={sectionStyles.inner}>
          <div className={officeStyles.officeQuoteLayout}>
            <div className={officeStyles.officeQuoteFormCard}>
              <p className={sectionStyles.sectionEyebrow}>Contact enquiry</p>
              <h2>Request an office quote</h2>
              <p>
                Your selected pack is already attached to the enquiry. Choose a
                standard quote or customise the items before submitting.
              </p>

              <div
                className={officeStyles.quoteModeTabs}
                role="tablist"
                aria-label="Office quote mode"
              >
                <button
                  type="button"
                  className={mode === "standard" ? officeStyles.activeQuoteMode : ""}
                  onClick={() => setMode("standard")}
                  role="tab"
                  aria-selected={mode === "standard"}
                >
                  <span>
                    <BoxIcon />
                  </span>
                  Standard office quote
                </button>
                <button
                  type="button"
                  className={mode === "custom" ? officeStyles.activeQuoteMode : ""}
                  onClick={() => setMode("custom")}
                  role="tab"
                  aria-selected={mode === "custom"}
                >
                  <span>
                    <EditIcon />
                  </span>
                  Customise quotation
                </button>
              </div>

              <div className={officeStyles.selectedPackPanel}>
                <span>Selected pack</span>
                <strong>{selectedPack.name}</strong>
                <p>{selectedPack.description}</p>
              </div>

              {mode === "custom" ? (
                <div className={officeStyles.customItemsPanel}>
                  <div>
                    <strong>Customise stationery items</strong>
                    <p>
                      Add or remove items before sending the quotation request.
                    </p>
                  </div>
                  <ul>
                    {items.map((item, index) => (
                      <li key={`${item}-${index}`}>
                        <span
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <strong>{item}</strong>
                          {itemBrandDetails[item] && (
                            <span className={officeStyles.itemDetailSub}>
                              {itemBrandDetails[item]}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          aria-label={`Remove ${item}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={officeStyles.addItemRow}>
                    <Select
                      value={selectedItemOption}
                      onChange={(event) =>
                        setSelectedItemOption(event.target.value)
                      }
                      aria-label="Choose an office stationery item to add"
                      options={itemOptions.map((item) => ({
                        value: item,
                        label: item,
                        disabled: items.includes(item),
                      }))}
                    />
                    <button type="button" onClick={() => addItem()}>
                      Add selected item
                    </button>
                  </div>
                  <div className={officeStyles.addItemRow}>
                    <input
                      value={newItem}
                      onChange={(event) => setNewItem(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCustomItem();
                        }
                      }}
                      placeholder="Or type a custom item"
                    />
                    <button type="button" onClick={addCustomItem}>
                      Add custom item
                    </button>
                  </div>

                  <div className={officeStyles.draftActionsGroup}>
                    <button
                      type="button"
                      className={officeStyles.draftActionButton}
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                    >
                      {isGeneratingPdf ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={officeStyles.spinner}
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                      {isGeneratingPdf ? "Generating PDF..." : "Download PDF Quote Draft"}
                    </button>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className={formStyles.formGrid}>
                  <label className={formStyles.field}>
                    <span>Business name</span>
                    <input
                      name="businessName"
                      placeholder="Business name"
                      autoComplete="organization"
                      required
                      {...errorAttributes(errors, "businessName")}
                    />
                    <FieldError
                      id="businessName-error"
                      message={errors.businessName}
                    />
                  </label>
                  <label className={formStyles.field}>
                    <span>Contact person</span>
                    <input
                      name="fullName"
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      {...errorAttributes(errors, "fullName")}
                    />
                    <FieldError id="fullName-error" message={errors.fullName} />
                  </label>
                  <label className={formStyles.field}>
                    <span>Phone</span>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="078 003 6048"
                      autoComplete="tel"
                      required
                      {...errorAttributes(errors, "phone")}
                    />
                    <FieldError id="phone-error" message={errors.phone} />
                  </label>
                  <label className={formStyles.field}>
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...errorAttributes(errors, "email")}
                    />
                    <FieldError id="email-error" message={errors.email} />
                  </label>
                  <label className={`${formStyles.field} ${formStyles.formWide}`}>
                    <span>Notes</span>
                    <textarea
                      name="message"
                      placeholder="Delivery area, monthly restock needs, preferred brands, or anything else we should know."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </label>
                </div>

                <label className={formStyles.consentField}>
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    {...errorAttributes(errors, "consent")}
                  />
                  <span>
                    I consent to Pexpacks using my information to contact me
                    about this enquiry and provide related support.{" "}
                    <Link
                      href="/privacy-policy"
                      className={formStyles.inlineTextLink}
                    >
                      privacy policy
                    </Link>
                  </span>
                </label>
                <FieldError id="consent-error" message={errors.consent} />

                <label className={formStyles.honeypot} aria-hidden="true">
                  Company website
                  <input
                    name="companyWebsite"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                <Button type="submit" disabled={pending}>
                  {pending ? "Submitting..." : "Submit Quote Request"}
                </Button>
                {status ? (
                  <p
                    className={
                      status.success ? formStyles.statusMessage : formStyles.statusError
                    }
                    role={status.success ? "status" : "alert"}
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                ) : null}
              </form>
            </div>

            <aside className={officeStyles.officeQuoteSummary}>
              <p className={sectionStyles.sectionEyebrow}>Quote ready</p>
              <h3>{selectedPack.name}</h3>
              <p>
                {mode === "custom"
                  ? `${items.length} customised items will be sent with your enquiry.`
                  : "The standard pack details will be sent with your enquiry."}
              </p>
              <ul>
                <li>Tax invoices provided</li>
                <li>Clear office-pack follow-up</li>
                <li>No online payment taken here</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <div ref={footerSentinelRef} className={officeStyles.footerStickySentinel} />
    </>
  );
}
