import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandStory } from "@/components/content/brand-story";
import { isLocale, localizedPath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "it" ? "La nostra storia" : "Our story",
    description:
      locale === "it"
        ? "Gaia, i viaggi in Asia e la collaborazione con artigiani indiani: scopri il mondo Sbrilluccica."
        : "Gaia, travels through Asia and collaboration with Indian artisans: discover the Sbrilluccica world.",
    alternates: { canonical: localizedPath(locale, "/our-story") },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <BrandStory locale={locale} />;
}
