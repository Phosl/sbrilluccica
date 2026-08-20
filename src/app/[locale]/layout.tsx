import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ConsentScripts } from "@/components/providers/consent-scripts";
import "@/app/globals.css";
import { isLocale, locales } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Sbrilluccica · Gioielli indipendenti",
    template: "%s · Sbrilluccica",
  },
  description: siteConfig.description.it,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
    languages: { "it-IT": "/", "en-GB": "/en" },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "Sbrilluccica · Gioielli indipendenti",
    description: siteConfig.description.it,
    images: [{ url: "/images/sbrilluccica-hero.jpg", width: 998, height: 1330 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sbrilluccica · Gioielli indipendenti",
    description: siteConfig.description.it,
    images: ["/images/sbrilluccica-hero.jpg"],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: locale === "it" ? "it-IT" : "en-GB",
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        {children}
        <ConsentScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
