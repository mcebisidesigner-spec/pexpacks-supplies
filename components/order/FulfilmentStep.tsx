import Link from "next/link";
import {
  type FulfilmentOption,
  fulfilmentOptions,
} from "./OrderFormTypes";
import styles from "./Order.module.css";

type FulfilmentStepProps = {
  fulfilmentOption: FulfilmentOption;
  setFulfilmentOption: (option: FulfilmentOption) => void;
  address: string;
  setAddress: (value: string) => void;
  suburb: string;
  setSuburb: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (value: string) => void;
  errors: Record<string, string>;
  clearFieldError: (field: string) => void;
};

function deliveryIcon(type: string) {
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

export function FulfilmentStep({
  fulfilmentOption,
  setFulfilmentOption,
  address,
  setAddress,
  suburb,
  setSuburb,
  city,
  setCity,
  province,
  setProvince,
  deliveryNotes,
  setDeliveryNotes,
  errors,
  clearFieldError,
}: FulfilmentStepProps) {
  return (
    <div className={styles.fulfilmentStep}>
      <fieldset className={styles.optionFieldset}>
        <legend>Preferred handover option</legend>
        <div className={styles.deliveryOptions}>
          {fulfilmentOptions.map((option) => (
            <label
              className={`${styles.deliveryOption} ${
                fulfilmentOption === option.value
                  ? styles.deliveryOptionSelected
                  : ""
              }`}
              key={option.value}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={option.value}
                checked={fulfilmentOption === option.value}
                onChange={() => {
                  setFulfilmentOption(option.value);
                  clearFieldError("address");
                  clearFieldError("suburb");
                  clearFieldError("city");
                  clearFieldError("province");
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

      {fulfilmentOption === "Home delivery" ? (
        <>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--pex-text-muted)", lineHeight: 1.5 }}>
            Home delivery incurs an additional delivery fee based on your location. Please read our{" "}
            <Link
              href="/delivery-policy"
              className={styles.inlineAction}
              style={{ display: "inline", fontSize: "inherit" }}
            >
              Delivery Policy
            </Link>{" "}
            for more details on pricing and schedules.
          </p>
          <div className={styles.formGrid}>
            {[
              {
                id: "delivery-address",
                label: "Street address",
                value: address,
                setter: setAddress,
                error: errors.address,
                autoComplete: "address-line1",
              },
              {
                id: "delivery-suburb",
                label: "Suburb",
                value: suburb,
                setter: setSuburb,
                error: errors.suburb,
                autoComplete: "address-level3",
              },
              {
                id: "delivery-city",
                label: "City",
                value: city,
                setter: setCity,
                error: errors.city,
                autoComplete: "address-level2",
              },
              {
                id: "delivery-province",
                label: "Province",
                value: province,
                setter: setProvince,
                error: errors.province,
                autoComplete: "address-level1",
              },
            ].map((field) => (
              <div className={styles.fieldGroup} key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>
                <input
                  id={field.id}
                  value={field.value}
                  autoComplete={field.autoComplete}
                  aria-invalid={Boolean(field.error)}
                  aria-describedby={field.error ? `${field.id}-error` : undefined}
                  onChange={(event) => {
                    field.setter(event.target.value);
                    clearFieldError(
                      field.id.replace("delivery-", "") as keyof typeof errors
                    );
                  }}
                />
                {field.error ? (
                  <p id={`${field.id}-error`} className={styles.fieldError}>
                    {field.error}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="delivery-notes">Delivery or collection notes optional</label>
        <textarea
          id="delivery-notes"
          value={deliveryNotes}
          placeholder="Gate code, preferred pickup time, or anything the team should know"
          onChange={(event) => setDeliveryNotes(event.target.value)}
        />
      </div>
    </div>
  );
}
