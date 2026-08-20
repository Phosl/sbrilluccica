import type { Locale } from "./i18n";

export const SUPPORTED_CURRENCIES = ["EUR"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Monetary values always use integer minor units (cents for EUR). */
export interface Money {
  amountInCents: number;
  currency: CurrencyCode;
}

export function money(
  amountInCents: number,
  currency: CurrencyCode = "EUR",
): Money {
  if (!Number.isSafeInteger(amountInCents)) {
    throw new TypeError("Money must use a safe integer amount in cents.");
  }

  return { amountInCents, currency };
}

export function addMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return money(left.amountInCents + right.amountInCents, left.currency);
}

export function multiplyMoney(value: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new TypeError("Money quantity must be a non-negative integer.");
  }

  return money(value.amountInCents * quantity, value.currency);
}

export function formatMoney(value: Money, locale: Locale = "it"): string {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: value.currency,
  }).format(value.amountInCents / 100);
}

function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new TypeError("Money values must use the same currency.");
  }
}
