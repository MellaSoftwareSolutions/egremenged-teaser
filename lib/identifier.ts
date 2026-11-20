/**
 * Pure identifier normalization, validation, and masking helpers.
 * Safe for use in both Client Components and Server-side code.
 */

export const INVALID_IDENTIFIER_MESSAGE =
  "Please enter a valid Ethiopian phone number (09, 07, 251, +251) or email address.";

/**
 * Normalizes an identifier (email or Ethiopian phone number).
 * 1. Trim whitespace and lowercase.
 * 2. If it contains '@', treat it as an email.
 * 3. Otherwise, strip spaces, dashes, and parentheses:
 *    - If starts with '+2519' or '+2517' (13 chars) -> convert to '0' + digits.slice(4) (09... / 07...)
 *    - If starts with '2519' or '2517' (12 digits) -> convert to '0' + digits.slice(3) (09... / 07...)
 *    - If starts with '+25109' or '+25107' -> convert to digits.slice(4) (09... / 07...)
 *    - If starts with '25109' or '25107' -> convert to digits.slice(3) (09... / 07...)
 *    - If starts with '09' or '07' (10 digits) -> keeps 09... / 07...
 */
export function normalizeIdentifier(raw: string): string {
  const trimmed = (raw || "").trim().toLowerCase();
  if (trimmed.includes("@")) {
    return trimmed;
  }

  // Strip spaces, dashes, and parentheses
  let digits = trimmed.replace(/[\s\-()]/g, "");

  if (digits.startsWith("+2519") || digits.startsWith("+2517")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("2519") || digits.startsWith("2517")) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("+25109") || digits.startsWith("+25107")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("25109") || digits.startsWith("25107")) {
    digits = digits.slice(3);
  }

  return digits;
}

/**
 * Validates identifier as either a valid email address OR a valid 10-digit Ethiopian phone number.
 * - Email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 * - Ethiopian phone regex: /^0[79]\d{8}$/ (10 digits starting with 09 or 07)
 */
export function isValidIdentifier(normalized: string): boolean {
  if (!normalized) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ethiopianPhoneRegex = /^0[79]\d{8}$/;
  return emailRegex.test(normalized) || ethiopianPhoneRegex.test(normalized);
}

/**
 * Masks an identifier for privacy-conscious display.
 */
export function maskIdentifier(identifier: string): string {
  if (!identifier) return "";
  if (identifier.includes("@")) {
    const [local, domain] = identifier.split("@");
    if (local.length <= 2) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
  }

  // Phone masking: 0911••••44
  const clean = identifier.replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} •••• ${clean.slice(-2)}`;
  }
  return identifier;
}
