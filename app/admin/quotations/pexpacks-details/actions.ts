"use server";

import { revalidatePath } from "next/cache";
import {
  quotationAddressSchema,
  quotationContactsSchema,
  quotationBusinessSchema,
  quotationBankingSchema,
  quotationNotesTermsSchema,
  quotationDefaultsSchema,
  saveQuotationSectionSetting,
  type QuotationAddress,
  type QuotationContacts,
  type QuotationBusiness,
  type QuotationBanking,
  type QuotationNotesTerms,
  type QuotationDefaults,
} from "@/lib/admin/quotation-settings";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updateBusinessAndAddressAction(data: {
  business: QuotationBusiness;
  address: QuotationAddress;
  contacts: QuotationContacts;
}): Promise<ActionResult> {
  const parsedBusiness = quotationBusinessSchema.safeParse(data.business);
  if (!parsedBusiness.success) {
    return { success: false, error: parsedBusiness.error.issues[0]?.message || "Invalid business details" };
  }

  const parsedAddress = quotationAddressSchema.safeParse(data.address);
  if (!parsedAddress.success) {
    return { success: false, error: parsedAddress.error.issues[0]?.message || "Invalid address details" };
  }

  const parsedContacts = quotationContactsSchema.safeParse(data.contacts);
  if (!parsedContacts.success) {
    return { success: false, error: parsedContacts.error.issues[0]?.message || "Invalid contact details" };
  }

  const res1 = await saveQuotationSectionSetting(
    "quotation.business",
    "quotation",
    parsedBusiness.data,
    "Quotation legal entity and business identity"
  );
  if (!res1.success) return { success: false, error: res1.error };

  const res2 = await saveQuotationSectionSetting(
    "quotation.address",
    "quotation",
    parsedAddress.data,
    "Quotation physical business address"
  );
  if (!res2.success) return { success: false, error: res2.error };

  const res3 = await saveQuotationSectionSetting(
    "quotation.contacts",
    "quotation",
    parsedContacts.data,
    "Quotation contact channels and email identity"
  );
  if (!res3.success) return { success: false, error: res3.error };

  revalidatePath("/admin/quotations/pexpacks-details");
  revalidatePath("/admin/quotations");
  return { success: true, message: "Business address and contact details saved successfully." };
}

export async function updateBankingDetailsAction(data: QuotationBanking): Promise<ActionResult> {
  const parsed = quotationBankingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid banking details" };
  }

  const res = await saveQuotationSectionSetting(
    "quotation.banking",
    "quotation",
    parsed.data,
    "Official quotation settlement banking details",
    true // is_sensitive
  );

  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/quotations/pexpacks-details");
  revalidatePath("/admin/quotations");
  return { success: true, message: "Banking details updated successfully." };
}

export async function updateNotesAndTermsAction(data: QuotationNotesTerms): Promise<ActionResult> {
  const parsed = quotationNotesTermsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid notes or terms" };
  }

  const payload: QuotationNotesTerms = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const res = await saveQuotationSectionSetting(
    "quotation.notes_terms",
    "quotation",
    payload,
    "Default quotation notes, commercial clauses, and terms versioning"
  );

  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/quotations/pexpacks-details");
  revalidatePath("/admin/quotations");
  return { success: true, message: "Quotation notes and terms updated." };
}

export async function updateQuotationDefaultsAction(data: QuotationDefaults): Promise<ActionResult> {
  const parsed = quotationDefaultsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid quotation defaults" };
  }

  const res = await saveQuotationSectionSetting(
    "quotation.defaults",
    "quotation",
    parsed.data,
    "Default quotation commercial parameters and document defaults"
  );

  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/quotations/pexpacks-details");
  revalidatePath("/admin/quotations");
  return { success: true, message: "Quotation defaults updated." };
}
