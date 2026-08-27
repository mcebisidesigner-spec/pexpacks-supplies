import { describe, it, expect } from "vitest";
import {
  quotationBusinessSchema,
  quotationAddressSchema,
  quotationContactsSchema,
  quotationBankingSchema,
  quotationNotesTermsSchema,
  quotationDefaultsSchema,
} from "@/lib/admin/quotation-settings";

describe("Quotation Settings Schemas & Validation", () => {
  it("validates official Pexpacks business details correctly", () => {
    const validBusiness = {
      registered_name: "Pexpacks Supplies (Pty) Ltd",
      trading_name: "Pexpacks",
      reg_number: "2024/789123/07",
      vat_number: "4920182741",
      website: "https://pexpacks.co.za",
    };
    const parsed = quotationBusinessSchema.safeParse(validBusiness);
    expect(parsed.success).toBe(true);
  });

  it("validates physical address in Boksburg Jet Park", () => {
    const validAddress = {
      address_line1: "33 Kelly Rd",
      address_line2: "Meerzicht Business Park",
      suburb: "Jet Park",
      city: "Boksburg",
      province: "Gauteng",
      postal_code: "1459",
      country: "South Africa",
    };
    const parsed = quotationAddressSchema.safeParse(validAddress);
    expect(parsed.success).toBe(true);
  });

  it("validates primary contacts and quotation emails", () => {
    const validContacts = {
      main_phone: "078 003 6048",
      support_phone: "078 003 6048",
      quotation_email: "helpme@pexpacks.co.za",
      general_email: "helpme@pexpacks.co.za",
      finance_email: "accounts@pexpacks.co.za",
      sender_display_name: "Pexpacks Supplies Quotations Desk",
    };
    const parsed = quotationContactsSchema.safeParse(validContacts);
    expect(parsed.success).toBe(true);
  });

  it("validates settlement banking details (FNB / RMB)", () => {
    const validBanking = {
      bank_name: "FNB / RMB",
      account_holder: "Pexpacks",
      account_type: "Current Account",
      account_number: "63215756991",
      branch_name: "Universal Branch",
      branch_code: "250655",
      swift_code: "FIRNZAJJ",
      payment_reference_instructions: "Use Quotation Number as payment reference (e.g. PX-Q-YYYY-XXXX)",
      banking_notes: "Please email proof of payment to helpme@pexpacks.co.za",
    };
    const parsed = quotationBankingSchema.safeParse(validBanking);
    expect(parsed.success).toBe(true);
  });

  it("validates commercial defaults and terms clauses", () => {
    const validTerms = {
      quotation_notes: "Thank you for the opportunity to provide this quotation.",
      terms_and_conditions: "1. This quotation is valid for 30 calendar days from the date of issue.",
      terms_version: "v1.2",
    };
    const parsedTerms = quotationNotesTermsSchema.safeParse(validTerms);
    expect(parsedTerms.success).toBe(true);

    const validDefaults = {
      default_validity_days: 30,
      default_payment_terms: "Payment due on acceptance",
      default_currency: "ZAR",
      vat_rate: 15,
      vat_enabled: true,
      prefix: "PX-Q",
    };
    const parsedDefaults = quotationDefaultsSchema.safeParse(validDefaults);
    expect(parsedDefaults.success).toBe(true);
  });
});
