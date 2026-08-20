import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutSuccess } from "@/components/checkout/checkout-success";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Conferma ordine", robots: { index: false, follow: false } };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ demo?: string; session_id?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  return <CheckoutSuccess demo={query.demo === "1"} locale={locale} sessionId={query.session_id} />;
}
