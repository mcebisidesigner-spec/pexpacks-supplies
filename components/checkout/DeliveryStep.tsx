"use client";

import styles from "@/app/checkout/Checkout.module.css";

type FulfilmentOption = "School collection" | "Delivery" | "Collection point";

type DeliveryStepProps = {
  fulfilmentOption: FulfilmentOption;
  onFulfilmentOptionChange: (option: FulfilmentOption) => void;
  address: string;
  onAddressChange: (value: string) => void;
  suburb: string;
  onSuburbChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  province: string;
  onProvinceChange: (value: string) => void;
  postalCode: string;
  onPostalCodeChange: (value: string) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
};

const FULFILMENT_OPTIONS: {
  value: FulfilmentOption;
  title: string;
  text: string;
  meta: string;
  icon: "school" | "home" | "pin";
}[] = [
  {
    value: "School collection",
    title: "School Collection",
    text: "Collect your pack from the school or agreed school handover point.",
    meta: "Usually best for school pack campaigns.",
    icon: "school",
  },
  {
    value: "Delivery",
    title: "Delivery",
    text: "Receive your pack at your address. Delivery fee may apply.",
    meta: "Address required before payment.",
    icon: "home",
  },
  {
    value: "Collection point",
    title: "Collection Point",
    text: "We will contact you to confirm the best pickup option.",
    meta: "Useful when school collection is not available.",
    icon: "pin",
  },
];

function deliveryIcon(type: "school" | "home" | "pin") {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  }
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" />
        <path d="M12 10.5h.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M8 20v-7h8v7" />
      <path d="M10 8h4" />
    </svg>
  );
}

export function DeliveryStep({
  fulfilmentOption,
  onFulfilmentOptionChange,
  address,
  onAddressChange,
  suburb,
  onSuburbChange,
  city,
  onCityChange,
  province,
  onProvinceChange,
  postalCode,
  onPostalCodeChange,
  consent,
  onConsentChange,
  errors,
  onClearError,
}: DeliveryStepProps) {
  return (
    <div className={styles.fulfilmentStep}>
      <fieldset className={styles.optionFieldset}>
        <legend>Choose how you will receive your pack</legend>
        <div className={styles.deliveryOptions}>
          {FULFILMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`${styles.deliveryOption} ${fulfilmentOption === option.value ? styles.deliveryOptionSelected : ""}`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={option.value}
                checked={fulfilmentOption === option.value}
                onChange={() => {
                  onFulfilmentOptionChange(option.value);
                  ["address", "suburb", "city", "province"].forEach(
                    onClearError
                  );
                }}
              />
              <span className={styles.deliveryIcon}>
                {deliveryIcon(option.icon)}
              </span>
              <span>
                <strong>{option.title}</strong>
                <small>{option.text}</small>
                <em>{option.meta}</em>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {fulfilmentOption === "Delivery" ? (
        <div className={styles.addressPanel}>
          <p>
            Home delivery may include a delivery fee depending on your
            location. We will confirm any delivery-specific details before
            fulfilment.
          </p>
          <div className={styles.formGrid}>
            {[
              {
                id: "address",
                label: "Address line",
                value: address,
                setter: onAddressChange,
                error: errors.address,
                autoComplete: "address-line1",
              },
              {
                id: "suburb",
                label: "Suburb",
                value: suburb,
                setter: onSuburbChange,
                error: errors.suburb,
                autoComplete: "address-level3",
              },
              {
                id: "city",
                label: "City",
                value: city,
                setter: onCityChange,
                error: errors.city,
                autoComplete: "address-level2",
              },
              {
                id: "province",
                label: "Province",
                value: province,
                setter: onProvinceChange,
                error: errors.province,
                autoComplete: "address-level1",
              },
              {
                id: "postalCode",
                label: "Postal code optional",
                value: postalCode,
                setter: onPostalCodeChange,
                error: undefined,
                autoComplete: "postal-code",
              },
            ].map((field) => (
              <div className={styles.fieldGroup} key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>
                <input
                  id={field.id}
                  data-field={field.id}
                  value={field.value}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(field.error)}
                  aria-describedby={
                    field.error ? `${field.id}-error` : undefined
                  }
                  onChange={(event) => {
                    field.setter(event.target.value);
                    onClearError(field.id);
                  }}
                />
                {field.error ? (
                  <p
                    id={`${field.id}-error`}
                    className={styles.fieldError}
                    role="alert"
                  >
                    {field.error}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <label className={styles.consentField}>
        <input
          data-field="consent"
          name="consent"
          type="checkbox"
          checked={consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          aria-invalid={Boolean(errors.consent)}
          onChange={(event) => {
            onConsentChange(event.target.checked);
            onClearError("consent");
          }}
        />
        <span>
          I agree that Pexpacks may process my personal information to complete
          this order, send payment and order updates, and contact me about
          delivery or collection. I have read and agree to the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>
          ,{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            terms of use
          </a>
          ,{" "}
          <a href="/delivery-policy" target="_blank" rel="noopener noreferrer">
            delivery policy
          </a>
          , and{" "}
          <a href="/returns-refunds-policy" target="_blank" rel="noopener noreferrer">
            returns & refunds policy
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p id="consent-error" className={styles.fieldError} role="alert">
          {errors.consent}
        </p>
      ) : null}
    </div>
  );
}
