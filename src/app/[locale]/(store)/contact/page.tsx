import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactPage } from "@/components/content/contact-page";
import { isLocale, localizedPath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "it" ? "Contatti" : "Contact",
    description: locale === "it" ? "Contatta Sbrilluccica per prodotti, ordini e resi." : "Contact Sbrilluccica about products, orders and returns.",
    alternates: { canonical: localizedPath(locale, "/contact") },
  };
}

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ContactPage locale={locale} />;
}
