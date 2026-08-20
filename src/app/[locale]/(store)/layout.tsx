import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { StorefrontShell } from "@/components/layout/storefront-shell";
import { isLocale } from "@/lib/i18n/config";

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const demoMode = (process.env.DATA_PROVIDER ?? "mock").toLowerCase() !== "supabase";

  return (
    <StorefrontShell demoMode={demoMode} locale={locale}>
      {children}
    </StorefrontShell>
  );
}
