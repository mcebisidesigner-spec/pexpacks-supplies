export const generalEmail = "helpme@pexpacks.co.za";
export const legalEmail = "helpme@pexpacks.co.za";
export const secondaryEmail = "pexpacks@gmail.com";
export const ordersEmail = "orders@pexpacks.co.za";
export const phoneNumber = "0780036048";

export const generalEmailHref = `mailto:${generalEmail}`;
export const legalEmailHref = `mailto:${legalEmail}`;
export const ordersEmailHref = `mailto:${ordersEmail}`;

function normalizeSouthAfricanPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `27${digits.slice(1)}`;
  }

  return digits;
}

export const internationalPhoneNumber =
  normalizeSouthAfricanPhoneNumber(phoneNumber);
export const phoneHref = `tel:+${internationalPhoneNumber}`;

export const whatsappNumber =
  process.env.NEXT_PUBLIC_PEXPACKS_WHATSAPP_NUMBER ?? phoneNumber;
export const hasWhatsAppNumber = whatsappNumber.trim().length > 0;

export function buildWhatsAppHref(message: string) {
  if (!hasWhatsAppNumber) {
    return "";
  }

  const normalizedNumber = normalizeSouthAfricanPhoneNumber(whatsappNumber);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export const orderWhatsAppHref = buildWhatsAppHref(
  "Hi Pexpacks, I would like to order a stationery pack."
);
