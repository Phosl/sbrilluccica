import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountPanel } from "@/components/account/account-panel";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main-content" className="flex min-h-[65vh] items-center bg-ivory py-14 sm:py-20">
      <Container className="max-w-2xl">
        <AccountPanel locale={locale} />
      </Container>
    </main>
  );
}
