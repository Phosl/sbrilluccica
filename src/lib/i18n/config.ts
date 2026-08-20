import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isLocale as isDomainLocale,
  type Locale,
} from "@/lib/domain/i18n";

export const locales = SUPPORTED_LOCALES;
export type { Locale };

export const defaultLocale: Locale = DEFAULT_LOCALE;

export function isLocale(value: string): value is Locale {
  return isDomainLocale(value);
}

export function localizedPath(locale: Locale, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? normalized || "/" : `/${locale}${normalized}`;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "it" ? "en" : "it";
}
