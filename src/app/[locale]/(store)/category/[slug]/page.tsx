import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ConnectedProductGrid } from "@/components/providers/connected-product-grid";
import { Container, Eyebrow } from "@/components/ui/container";
import { filterAndSortProducts } from "@/lib/catalog/view";
import { getCollectionBySlug, getCollections, getProductsByCollection } from "@/lib/data";
import { isLocale, localizedPath } from "@/lib/i18n/config";

type CollectionProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollections("it");
  return [
    ...collections.flatMap((collection) => [
      { locale: "it", slug: collection.slug },
      { locale: "en", slug: collection.slug },
    ]),
    { locale: "it", slug: "saldi" },
    { locale: "en", slug: "saldi" },
  ];
}

export async function generateMetadata({ params }: CollectionProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const collection = await getCollectionBySlug(slug, locale);
  if (!collection) return {};
  return {
    title: collection.seoTitle.replace(/\s*\|\s*Sbrilluccica$/i, ""),
    description: collection.seoDescription,
    alternates: { canonical: localizedPath(locale, `/category/${slug}`) },
    openGraph: { images: [collection.heroImage.url] },
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionProps) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  if (slug === "saldi") redirect(localizedPath(locale, "/shop"));

  const [collection, rawProducts] = await Promise.all([
    getCollectionBySlug(slug, locale),
    getProductsByCollection(slug, locale),
  ]);
  if (!collection) notFound();
  const products = filterAndSortProducts(rawProducts, { sort: query.sort });

  return (
    <main id="main-content" className="flex-1 bg-paper">
      <header className="border-b border-line bg-rose-soft/45 py-14 sm:py-20">
        <Container>
          <Eyebrow>{locale === "it" ? "Collezione" : "Collection"}</Eyebrow>
          <h1 className="mt-4 max-w-5xl font-serif text-6xl leading-none tracking-[-0.05em] sm:text-8xl">
            {collection.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{collection.description}</p>
          <p className="mt-5 text-sm text-muted">
            {products.length} {locale === "it" ? "gioielli" : "pieces"}
          </p>
        </Container>
      </header>
      <ConnectedProductGrid locale={locale} products={products} />
    </main>
  );
}
