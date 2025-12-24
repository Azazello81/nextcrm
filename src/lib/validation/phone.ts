// src/lib/validation/phone.ts

const MIN_DIGITS = 10;
const MAX_DIGITS = 15;
export const PHONE_MASK = '+7 (999) 999-99-99';

/**
 * Normalize phone number to E.164 digits-only string (no plus), e.g. `79001234567`.
 * Rules:
 * - remove all non-digits
 * - if 11 digits and starts with 8 -> replace with 7 (RU local to international)
 * - if 10 digits and starts with 9 -> assume Russia and prefix 7
 * - must end up between 10..15 digits; otherwise return null
 */
export function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D+/g, '');
  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    digits = '7' + digits;
  }

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) {
    return null;
  }

  return digits;
}

export function isValidPhone(raw?: string | null): boolean {
  const normalized = normalizePhone(raw);
  return normalized !== null && /^\d{10,15}$/.test(normalized);
}

/**
 * Normalize to E.164 format with leading plus (e.g. +79001234567) or null.
 */
export function normalizePhoneE164(raw?: string | null): string | null {
  const digits = normalizePhone(raw);
  return digits ? `+${digits}` : null;
}

export function formatPhone(raw?: string | null): string | null {
  const digits = normalizePhone(raw) || (raw && /^\d{10,15}$/.test(raw) ? raw : null);
  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }

  return `+${digits}`;
}
