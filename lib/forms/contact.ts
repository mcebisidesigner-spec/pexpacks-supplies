export function isValidSouthAfricanPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}

export function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function splitContactInput(value: string) {
  const contact = value.trim();

  if (!contact) {
    return {};
  }

  if (isValidEmailAddress(contact)) {
    return { email: contact };
  }

  return { phone: contact };
}
