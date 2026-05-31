"use client";

import { memo } from "react";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import styles from "@/app/checkout/Checkout.module.css";

type ContactMethod = "whatsapp" | "phone" | "email";

type DetailsStepProps = {
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  buyerPhone: string;
  onBuyerPhoneChange: (value: string) => void;
  buyerEmail: string;
  onBuyerEmailChange: (value: string) => void;
  learnerName: string;
  onLearnerNameChange: (value: string) => void;
  schoolName: string;
  grade: string;
  learnerNotes: string;
  onLearnerNotesChange: (value: string) => void;
  preferredContactMethod: ContactMethod;
  onPreferredContactMethodChange: (method: ContactMethod) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalisePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  return trimmed.replace(/\D/g, "");
}

function isLikelySaPhone(value: string) {
  const normalised = normalisePhone(value);
  const digits = normalised.replace(/\D/g, "");
  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}

function formatPhoneNumber(value: string): string {
  const clean = value.replace(/\D/g, "");
  
  if (clean.startsWith("27")) {
    let formatted = "+27";
    if (clean.length > 2) {
      formatted += " " + clean.slice(2, 4);
    }
    if (clean.length > 4) {
      formatted += " " + clean.slice(4, 7);
    }
    if (clean.length > 7) {
      formatted += " " + clean.slice(7, 11);
    }
    return formatted;
  } else {
    let formatted = "";
    if (clean.length > 0) {
      formatted += clean.slice(0, 3);
    }
    if (clean.length > 3) {
      formatted += " " + clean.slice(3, 6);
    }
    if (clean.length > 6) {
      formatted += " " + clean.slice(6, 10);
    }
    return formatted;
  }
}


export const DetailsStep = memo(function DetailsStep({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  buyerPhone,
  onBuyerPhoneChange,
  buyerEmail,
  onBuyerEmailChange,
  learnerName,
  onLearnerNameChange,
  schoolName,
  grade,
  learnerNotes,
  onLearnerNotesChange,
  preferredContactMethod,
  onPreferredContactMethodChange,
  errors,
  onClearError,
}: DetailsStepProps) {
  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 2;
  const isPhoneValid = isLikelySaPhone(buyerPhone);
  const isEmailValid = isValidEmail(buyerEmail);
  const isLearnerNameValid = learnerName.trim().length >= 2;

  return (
    <div className={styles.formGrid}>
      <div style={{ gridColumn: "1 / -1" }}>
        <p style={{ margin: 0, color: "var(--pex-text-muted)", fontSize: "0.9rem" }}>
          We use this to confirm your order and payment updates.
        </p>
      </div>

      <Input
        id="firstName"
        label="First name"
        name="firstName"
        autoComplete="given-name"
        placeholder="Enter first name"
        value={firstName}
        showValid={isFirstNameValid}
        error={errors.firstName}
        onChange={(event) => {
          onFirstNameChange(event.target.value);
          onClearError("firstName");
        }}
      />

      <Input
        id="lastName"
        label="Surname"
        name="lastName"
        autoComplete="family-name"
        placeholder="Enter surname"
        value={lastName}
        showValid={isLastNameValid}
        error={errors.lastName}
        onChange={(event) => {
          onLastNameChange(event.target.value);
          onClearError("lastName");
        }}
      />

      <Input
        id="buyerPhone"
        label="Phone number"
        helper="WhatsApp or call is fastest for support."
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="e.g. 078 003 6048"
        value={buyerPhone}
        showValid={isPhoneValid}
        error={errors.buyerPhone}
        onChange={(event) => {
          const formatted = formatPhoneNumber(event.target.value);
          onBuyerPhoneChange(formatted);
          onClearError("buyerPhone");
        }}
      />

      <Input
        id="buyerEmail"
        label="Email address"
        helper="Used for your order updates."
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        value={buyerEmail}
        showValid={isEmailValid}
        error={errors.buyerEmail}
        onChange={(event) => {
          onBuyerEmailChange(event.target.value);
          onClearError("buyerEmail");
        }}
      />

      <Input
        id="learnerName"
        label="Learner name"
        helper="Helpful for labels and school handover."
        name="learnerName"
        autoComplete="off"
        placeholder="e.g. Leo Dlamini"
        value={learnerName}
        showValid={isLearnerNameValid}
        error={errors.learnerName}
        onChange={(event) => {
          onLearnerNameChange(event.target.value);
          onClearError("learnerName");
        }}
      />

      <Input
        id="schoolName"
        label="School name"
        value={schoolName}
        readOnly
      />

      <Input
        id="gradeName"
        label="Grade"
        value={grade}
        readOnly
      />

      <Textarea
        id="learner-notes"
        label="Optional notes"
        value={learnerNotes}
        placeholder="Anything we should know about this learner or pack?"
        onChange={(event) => onLearnerNotesChange(event.target.value)}
        className="col-span-full"
      />

      <Select
        id="preferredContactMethod"
        label="Preferred contact method"
        value={preferredContactMethod}
        onChange={(event) => onPreferredContactMethodChange(event.target.value as ContactMethod)}
        className="col-span-full"
        options={[
          { value: "whatsapp", label: "WhatsApp" },
          { value: "phone", label: "Phone call" },
          { value: "email", label: "Email" }
        ]}
      />
    </div>
  );
});