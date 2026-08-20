import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConnectedProductGrid } from "@/components/providers/connected-product-grid";
import { CollectionTiles } from "@/components/storefront/collection-tiles";
import { StoreHero } from "@/components/storefront/hero";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { getCollections, getNewProducts } from "@/lib/data";
import { getCopy } from "@/lib/i18n/copy";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site";

type HomeProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === "it" ? "Gioielli indipendenti" : "Independent jewellery";
  const description = siteConfig.description[locale];
  return {
    title,
    description,
    alternates: { canonical: localizedPath(locale, "/") },
  };
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [newProducts, collections] = await Promise.all([
    getNewProducts(locale, 8),
    getCollections(locale),
  ]);
  const copy = getCopy(locale);
  const path = (value: string) => localizedPath(locale, value);
  const demoMode = (process.env.DATA_PROVIDER ?? "mock").toLowerCase() !== "supabase";

  return (
    <main id="main-content" className="flex-1">
      <StoreHero
        body={copy.home.intro}
        eyebrow={copy.home.eyebrow}
        image={{
          src: "/images/sbrilluccica-hero.jpg",
          alt:
            locale === "it"
              ? "Collana e anelli Sbrilluccica indossati su un abito nero"
              : "Sbrilluccica necklace and rings worn with a black dress",
          width: 998,
          height: 1330,
        }}
        primaryAction={{ href: path("/shop?sort=new"), label: copy.home.primaryCta }}
        secondaryAction={{ href: path("/shop"), label: copy.home.secondaryCta }}
        title={copy.home.title}
      />

      <TrustStrip
        items={
          locale === "it"
            ? [
                { title: "Selezione indipendente", body: "Curata a Roma da Gaia" },
                { title: "Spedizioni internazionali", body: "Italia, UE, UK e USA" },
                { title: "Resi in 14 giorni", body: "Procedura unica e chiara" },
                demoMode
                  ? { title: "Checkout demo", body: "Stripe pronto da collegare" }
                  : { title: "Pagamento protetto", body: "Checkout gestito da Stripe" },
              ]
            : [
                { title: "Independent edit", body: "Curated in Rome by Gaia" },
                { title: "International shipping", body: "Italy, EU, UK and USA" },
                { title: "14-day returns", body: "One clear process" },
                demoMode
                  ? { title: "Demo checkout", body: "Stripe ready to connect" }
                  : { title: "Protected payment", body: "Checkout handled by Stripe" },
              ]
        }
      />

      <ConnectedProductGrid
        action={{ href: path("/shop"), label: locale === "it" ? "Vedi tutto" : "View all" }}
        eyebrow={copy.home.newEyebrow}
        locale={locale}
        products={newProducts}
        title={copy.home.newTitle}
      />

      <CollectionTiles
        collections={collections.map((collection) => ({
          ...collection,
          href: path(`/category/${collection.slug}`),
        }))}
        eyebrow={locale === "it" ? "Segui il tuo istinto" : "Follow your instinct"}
        title={locale === "it" ? "Una collezione per ogni gesto" : "A collection for every gesture"}
      />

      <section className="bg-ivory py-16 sm:py-24 lg:py-32">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-rose-soft">
            <Image
              src="/images/gaia-portrait-02.jpg"
              alt={
                locale === "it"
                  ? "Ritratto editoriale con anelli Sbrilluccica"
                  : "Editorial portrait with Sbrilluccica rings"
              }
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <Eyebrow>{copy.home.craftEyebrow}</Eyebrow>
            <h2 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl">
              {copy.home.craftTitle}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">{copy.home.craftBody}</p>
            <Link href={path("/our-story")} className={buttonStyles({ className: "mt-9", size: "lg" })}>
              {copy.home.craftCta}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
