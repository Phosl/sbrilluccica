import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConnectedProductGrid } from "@/components/providers/connected-product-grid";
import { CatalogFilters } from "@/components/storefront/catalog-filters";
import { Container, Eyebrow } from "@/components/ui/container";
import { categoryLabel, filterAndSortProducts, productCategories } from "@/lib/catalog/view";
import { getProducts } from "@/lib/data";
import { isLocale, localizedPath } from "@/lib/i18n/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type ShopProps = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params }: ShopProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "it" ? "Shop" : "Shop jewellery",
    description:
      locale === "it"
        ? "Scopri collane, orecchini, anelli e bracciali Sbrilluccica."
        : "Discover Sbrilluccica necklaces, earrings, rings and bracelets.",
    alternates: { canonical: localizedPath(locale, "/shop") },
  };
}

function values(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export default async function ShopPage({ params, searchParams }: ShopProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const allProducts = await getProducts(locale);
  const categories = values(query.category);
  const search = typeof query.q === "string" ? query.q : undefined;
  const sort = typeof query.sort === "string" ? query.sort : undefined;
  const products = filterAndSortProducts(allProducts, { categories, query: search, sort });
  const path = (value: string) => localizedPath(locale, value);

  return (
    <main id="main-content" className="flex-1 bg-paper">
      <header className="border-b border-line bg-rose-soft/45 py-14 sm:py-20">
        <Container>
          <Eyebrow>{locale === "it" ? "Tutti i gioielli" : "All jewellery"}</Eyebrow>
          <h1 className="mt-4 font-serif text-6xl leading-none tracking-[-0.05em] sm:text-8xl">
            {locale === "it" ? "Lo shop" : "The shop"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {locale === "it"
              ? "Trova il dettaglio che parla di te, tra nuovi arrivi e icone Sbrilluccica."
              : "Find the detail that feels like you, from new arrivals to Sbrilluccica signatures."}
          </p>
          <form action={path("/shop")} className="mt-8 flex max-w-xl gap-2" role="search">
            <label className="sr-only" htmlFor="catalog-search">
              {locale === "it" ? "Cerca nello shop" : "Search the shop"}
            </label>
            <input
              id="catalog-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder={locale === "it" ? "Cerca un gioiello…" : "Search jewellery…"}
              className="min-h-12 min-w-0 flex-1 rounded-full border border-line bg-paper px-5 focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20"
            />
            <button className="min-h-12 rounded-full bg-ink px-6 text-sm font-semibold text-paper" type="submit">
              {locale === "it" ? "Cerca" : "Search"}
            </button>
          </form>
        </Container>
      </header>

      <Container className="pt-8">
        <CatalogFilters
          action={path("/shop")}
          clearHref={path("/shop")}
          groups={[
            {
              id: "category",
              label: locale === "it" ? "Categoria" : "Category",
              values: productCategories.map((category) => ({
                id: category,
                label: categoryLabel(category, locale),
                count: allProducts.filter((product) => product.category === category).length,
              })),
            },
          ]}
          locale={locale}
          hiddenFields={search ? { q: search } : {}}
          resultCount={products.length}
          selected={{ category: categories }}
          sortValue={sort}
          sortOptions={[
            { value: "new", label: locale === "it" ? "Più recenti" : "Newest" },
            { value: "price-asc", label: locale === "it" ? "Prezzo crescente" : "Price: low to high" },
            { value: "price-desc", label: locale === "it" ? "Prezzo decrescente" : "Price: high to low" },
          ]}
        />
      </Container>

      <ConnectedProductGrid locale={locale} products={products} />
    </main>
  );
}
