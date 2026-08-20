import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConnectedCartPage } from "@/components/providers/cart-page-connected";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Carrello", robots: { index: false, follow: false } };

export default async function CartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ConnectedCartPage locale={locale} />;
}
