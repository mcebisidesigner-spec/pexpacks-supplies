"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { OfficePack } from "@/data/officePacks";
import { formatCurrency } from "@/lib/formatCurrency";
import { endpointPathForFormType } from "@/lib/forms/types";
import styles from "@/components/marketing/Marketing.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type QuoteMode = "standard" | "custom";

type OfficeQuoteExperienceProps = {
  officePacks: OfficePack[];
  officeBenefits: string[];
  businessUseCases: string[];
};

const trustSignals = [
  "Tax invoices provided",
  "Gauteng delivery or collection",
  "Custom quantities supported",
  "Business-ready admin packs",
];

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
    <span id={id} className={styles.fieldError}>
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
  officeBenefits,
  businessUseCases,
}: OfficeQuoteExperienceProps) {
  const [selectedPackId, setSelectedPackId] = useState(officePacks[0]?.id ?? "");
  const [mode, setMode] = useState<QuoteMode>("standard");
  const [items, setItems] = useState<string[]>(officePacks[0]?.contents ?? []);
  const [newItem, setNewItem] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStickyBar, setShowStickyBar] = useState(true);
  const [selectedItemOption, setSelectedItemOption] = useState("");
  const formRef = useRef<HTMLElement | null>(null);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);

  const selectedPack = useMemo(
    () => officePacks.find((pack) => pack.id === selectedPackId) ?? officePacks[0],
    [officePacks, selectedPackId]
  );

  const itemOptions = useMemo(
    () =>
      Array.from(new Set(officePacks.flatMap((pack) => pack.contents))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [officePacks]
  );

  useEffect(() => {
    setSelectedItemOption(
      itemOptions.find((item) => !items.includes(item)) ?? itemOptions[0] ?? ""
    );
  }, [itemOptions, items]);

  useEffect(() => {
    const formElement = formRef.current;
    const footerSentinelElement = footerSentinelRef.current;

    if (!formElement || !footerSentinelElement) {
      return;
    }

    const formNode = formElement;
    const footerSentinelNode = footerSentinelElement;

    function updateStickyVisibility() {
      const formRect = formNode.getBoundingClientRect();
      const footerRect = footerSentinelNode.getBoundingClientRect();
      const formReached =
        formRect.top <= window.innerHeight - 120 && formRect.bottom >= 0;
      const footerReached = footerRect.top <= window.innerHeight;

      setShowStickyBar(!formReached && !footerReached);
    }

    updateStickyVisibility();
    window.addEventListener("scroll", updateStickyVisibility, { passive: true });
    window.addEventListener("resize", updateStickyVisibility);

    return () => {
      window.removeEventListener("scroll", updateStickyVisibility);
      window.removeEventListener("resize", updateStickyVisibility);
    };
  }, []);

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
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
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
      preferredContactMethod: val(formData, "preferredContactMethod") || undefined,
      businessName: val(formData, "businessName"),
      orderQuantity: val(formData, "orderQuantity") || undefined,
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
      const response = await fetch(endpointPathForFormType("office-pack-enquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
      <section className={styles.officeTrustStrip} aria-label="Business trust signals">
        <div className={styles.inner}>
          <ul>
            {trustSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Office pack types</p>
            <h2>Office pack options</h2>
            <p>Ready-to-quote packs for small teams, home offices and recurring admin needs.</p>
          </div>
          <div className={styles.officeGrid}>
            {officePacks.map((pack) => (
              <article className={styles.packCard} key={pack.id}>
                <div
                  className={`${styles.packMedia} ${styles.packMediaBlue}`}
                  aria-hidden="true"
                >
                  <span>Office</span>
                </div>
                <div className={styles.packBody}>
                  <p className={styles.packMeta}>SME and office supplies</p>
                  <h3>{pack.name}</h3>
                  <p>{pack.description}</p>
                  <ul className={styles.packList}>
                    {pack.contents.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.packFooter}>
                    <span className={styles.priceLabel}>
                      {pack.priceFrom === 0
                        ? "Request quote"
                        : `From ${formatCurrency(pack.priceFrom)}`}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => selectPack(pack, "standard")}
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.sectionEyebrow}>Monthly office support</p>
              <h2>Keep admin supplies predictable</h2>
              <p>
                Set up a recurring office pack for the basics your team uses
                every month, or request a custom pack when a project, shop or
                site needs practical supplies quickly.
              </p>
              <div className={styles.buttonRow}>
                <Button type="button" onClick={() => selectPack(selectedPack, "custom")}>
                  Request Quote
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {officeBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Business stationery</p>
            <h2>Built for practical business types</h2>
            <p>
              Pexpacks office packs are structured around real admin needs, not
              cluttered catalogue browsing.
            </p>
          </div>
          <div className={styles.gridThree}>
            {businessUseCases.map((useCase) => (
              <article className={styles.infoCard} key={useCase}>
                <h3 style={{ margin: 0 }}>{useCase}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact-enquiry"
        className={styles.sectionCream}
        ref={formRef}
      >
        <div className={styles.inner}>
          <div className={styles.officeQuoteLayout}>
            <div className={styles.officeQuoteFormCard}>
              <p className={styles.sectionEyebrow}>Contact enquiry</p>
              <h2>Request an office quote</h2>
              <p>
                Your selected pack is already attached to the enquiry. Choose a
                standard quote or customise the items before submitting.
              </p>

              <div className={styles.quoteModeTabs} role="tablist" aria-label="Office quote mode">
                <button
                  type="button"
                  className={mode === "standard" ? styles.activeQuoteMode : ""}
                  onClick={() => setMode("standard")}
                  role="tab"
                  aria-selected={mode === "standard"}
                >
                  <span><BoxIcon /></span>
                  Standard office quote
                </button>
                <button
                  type="button"
                  className={mode === "custom" ? styles.activeQuoteMode : ""}
                  onClick={() => setMode("custom")}
                  role="tab"
                  aria-selected={mode === "custom"}
                >
                  <span><EditIcon /></span>
                  Customise quotation
                </button>
              </div>

              <div className={styles.selectedPackPanel}>
                <span>Selected pack</span>
                <strong>{selectedPack.name}</strong>
                <p>{selectedPack.description}</p>
              </div>

              {mode === "custom" ? (
                <div className={styles.customItemsPanel}>
                  <div>
                    <strong>Customise stationery items</strong>
                    <p>Add or remove items before sending the quotation request.</p>
                  </div>
                  <ul>
                    {items.map((item, index) => (
                      <li key={`${item}-${index}`}>
                        <span>{item}</span>
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
                  <div className={styles.addItemRow}>
                    <select
                      value={selectedItemOption}
                      onChange={(event) =>
                        setSelectedItemOption(event.target.value)
                      }
                      aria-label="Choose an office stationery item to add"
                    >
                      {itemOptions.map((item) => (
                        <option key={item} value={item} disabled={items.includes(item)}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => addItem()}>
                      Add selected item
                    </button>
                  </div>
                  <div className={styles.addItemRow}>
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
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
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
                  <label className={styles.field}>
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
                  <label className={styles.field}>
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
                  <label className={styles.field}>
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
                  <label className={styles.field}>
                    <span>Preferred contact method</span>
                    <select name="preferredContactMethod" defaultValue="whatsapp">
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Quantity</span>
                    <input
                      name="orderQuantity"
                      type="number"
                      min="1"
                      placeholder="1"
                    />
                  </label>
                  <label className={`${styles.field} ${styles.formWide}`}>
                    <span>Notes</span>
                    <textarea
                      name="message"
                      placeholder="Delivery area, monthly restock needs, preferred brands, or anything else we should know."
                    />
                  </label>
                </div>

                <label className={styles.consentField}>
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    {...errorAttributes(errors, "consent")}
                  />
                  <span>
                    I consent to Pexpacks using my information to contact me
                    about this enquiry and provide related support.{" "}
                    <Link href="/privacy-policy" className={styles.inlineTextLink}>
                      privacy policy
                    </Link>
                  </span>
                </label>
                <FieldError id="consent-error" message={errors.consent} />

                <label className={styles.honeypot} aria-hidden="true">
                  Company website
                  <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
                </label>

                <Button type="submit" disabled={pending}>
                  {pending ? "Submitting..." : "Submit Quote Request"}
                </Button>
                {status ? (
                  <p
                    className={
                      status.success ? styles.statusMessage : styles.statusError
                    }
                    role={status.success ? "status" : "alert"}
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                ) : null}
              </form>
            </div>

            <aside className={styles.officeQuoteSummary}>
              <p className={styles.sectionEyebrow}>Quote ready</p>
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

      <div ref={footerSentinelRef} className={styles.footerStickySentinel} />

      {showStickyBar ? (
        <div className={styles.stickyQuoteBar}>
          <span>Ready for an office quote?</span>
          <button type="button" onClick={scrollToForm}>
            Request Quote
          </button>
        </div>
      ) : null}
    </>
  );
}
