import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WishlistPage } from "@/components/providers/wishlist-page";
import { getProducts } from "@/lib/data";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Preferiti", robots: { index: false, follow: false } };

export default async function WishlistRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <WishlistPage locale={locale} products={await getProducts(locale)} />;
}
