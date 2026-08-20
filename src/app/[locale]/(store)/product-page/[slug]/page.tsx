import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConnectedProductDetail } from "@/components/providers/connected-product-detail";
import { ConnectedProductGrid } from "@/components/providers/connected-product-grid";
import { categoryLabel } from "@/lib/catalog/view";
import { getCatalogSitemapEntries, getProductBySlug, getProductsByCategory } from "@/lib/data";
import { formatMoney } from "@/lib/domain";
import { isLocale, localizedPath } from "@/lib/i18n/config";
import { absoluteUrl, siteConfig } from "@/lib/site";

type ProductProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const entries = await getCatalogSitemapEntries();
  return entries
    .filter((entry) => entry.kind === "product")
    .map((entry) => ({ locale: entry.locale, slug: entry.slug }));
}

export async function generateMetadata({ params }: ProductProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProductBySlug(slug, locale);
  if (!product) return {};

  return {
    title: product.seoTitle.replace(/\s*\|\s*Sbrilluccica$/i, ""),
    description: product.seoDescription,
    alternates: {
      canonical: localizedPath(locale, `/product-page/${slug}`),
      languages: {
        "it-IT": `/product-page/${slug}`,
        "en-GB": `/en/product-page/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: product.seoTitle,
      description: product.seoDescription,
      images: product.media.map((image) => ({ url: image.url, width: image.width, height: image.height, alt: image.alt })),
    },
  };
}

export default async function ProductPage({ params }: ProductProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProductBySlug(slug, locale);
  if (!product) notFound();

  const related = (await getProductsByCategory(product.category, locale, 5))
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 4);
  const primaryVariant = product.variants[0];
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription,
    image: product.media.map((image) => image.url),
    sku: primaryVariant?.sku,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: product.price.currency,
      price: (product.price.amountInCents / 100).toFixed(2),
      availability:
        product.availability === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: absoluteUrl(localizedPath(locale, `/product-page/${slug}`)),
    },
  };

  return (
    <main id="main-content" className="flex-1 bg-paper">
      <ConnectedProductDetail
        categoryLabel={categoryLabel(product.category, locale)}
        locale={locale}
        product={product}
      />
      <section className="border-y border-line bg-ivory px-4 py-7 text-center text-sm text-muted">
        {locale === "it"
          ? `Prezzo ${formatMoney(product.price, locale)} · Spedizione calcolata per destinazione · Reso entro 14 giorni`
          : `Price ${formatMoney(product.price, locale)} · Shipping calculated by destination · 14-day returns`}
      </section>
      {related.length ? (
        <ConnectedProductGrid
          eyebrow={locale === "it" ? "Continua a esplorare" : "Keep exploring"}
          locale={locale}
          products={related}
          title={locale === "it" ? "Potrebbe piacerti anche" : "You may also like"}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </main>
  );
}
