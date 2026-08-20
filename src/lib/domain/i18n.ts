export const SUPPORTED_LOCALES = ["it", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "it";

export type LocalizedText = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return value && isLocale(value.toLowerCase())
    ? (value.toLowerCase() as Locale)
    : DEFAULT_LOCALE;
}

export function localizeText(
  value: LocalizedText,
  locale: Locale,
  fallbackLocale: Locale = DEFAULT_LOCALE,
): string {
  return value[locale] || value[fallbackLocale];
}
