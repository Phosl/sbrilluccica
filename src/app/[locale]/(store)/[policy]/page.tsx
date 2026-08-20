import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditorialPage } from "@/components/content/editorial-page";
import { getPolicyContent, type PolicySlug } from "@/lib/content/policies";
import { isLocale, localizedPath } from "@/lib/i18n/config";

const policySlugs: PolicySlug[] = [
  "shipping-policy",
  "refund-policy",
  "terms-conditions",
  "privacy-policy",
  "accessibility-statement",
];

function isPolicy(value: string): value is PolicySlug {
  return policySlugs.includes(value as PolicySlug);
}

export function generateStaticParams() {
  return policySlugs.flatMap((policy) => [
    { locale: "it", policy },
    { locale: "en", policy },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; policy: string }> }): Promise<Metadata> {
  const { locale, policy } = await params;
  if (!isLocale(locale) || !isPolicy(policy)) return {};
  const content = getPolicyContent(locale, policy);
  return {
    title: content.title,
    description: content.intro,
    alternates: { canonical: localizedPath(locale, `/${policy}`) },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ locale: string; policy: string }> }) {
  const { locale, policy } = await params;
  if (!isLocale(locale) || !isPolicy(policy)) notFound();
  const content = getPolicyContent(locale, policy);
  return <EditorialPage {...content} />;
}
