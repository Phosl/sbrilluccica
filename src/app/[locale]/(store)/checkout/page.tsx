import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CheckoutPanel locale={locale} />;
}
