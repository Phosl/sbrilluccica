import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { isLocale, localizedPath } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Gift card",
  description: "Assistenza per gift card Sbrilluccica già emesse.",
};

export default async function GiftCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main-content" className="flex min-h-[60vh] items-center bg-rose-soft/45 py-16">
      <Container className="max-w-4xl text-center">
        <Eyebrow>{locale === "it" ? "Gift card" : "Gift cards"}</Eyebrow>
        <h1 className="mt-5 font-serif text-6xl leading-[0.92] tracking-[-0.05em] sm:text-8xl">
          {locale === "it" ? "Hai già una gift card?" : "Already have a gift card?"}
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted">
          {locale === "it"
            ? "La vendita di nuove gift card non fa parte di questa prima versione. Se ne possiedi una emessa dal vecchio store, contattaci: verificheremo codice e credito prima della migrazione."
            : "New gift-card sales are not included in this first release. If you hold one issued by the previous store, contact us so the code and balance can be checked before migration."}
        </p>
        <Link href={localizedPath(locale, "/contact")} className={buttonStyles({ className: "mt-9", size: "lg" })}>
          {locale === "it" ? "Contattaci" : "Contact us"}
        </Link>
      </Container>
    </main>
  );
}
