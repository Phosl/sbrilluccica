"use client";

import { ConnectedProductGrid } from "@/components/providers/connected-product-grid";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Container, Eyebrow } from "@/components/ui/container";
import type { Locale, Product } from "@/lib/domain";

export function WishlistPage({ locale, products }: { locale: Locale; products: Product[] }) {
  const { hydrated, wishlist } = useCommerce();
  const selected = products.filter((product) => wishlist.includes(product.slug));

  return (
    <main id="main-content" className="flex-1 bg-ivory">
      <header className="border-b border-line bg-rose-soft/45 py-14 sm:py-20">
        <Container>
          <Eyebrow>{locale === "it" ? "La tua selezione" : "Your selection"}</Eyebrow>
          <h1 className="mt-4 font-serif text-6xl leading-none tracking-[-0.05em] sm:text-8xl">
            {locale === "it" ? "Preferiti" : "Wishlist"}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            {locale === "it"
              ? "I gioielli che vuoi ritrovare, salvati su questo dispositivo."
              : "The jewellery you want to find again, saved on this device."}
          </p>
        </Container>
      </header>
      {hydrated ? (
        <ConnectedProductGrid
          emptyMessage={{
            title: locale === "it" ? "Nessun preferito, per ora" : "No favourites yet",
            body:
              locale === "it"
                ? "Tocca il cuore su un gioiello per salvarlo qui."
                : "Tap the heart on a piece to save it here.",
          }}
          locale={locale}
          products={selected}
        />
      ) : (
        <Container className="py-20 text-center text-sm text-muted" aria-live="polite">
          {locale === "it" ? "Caricamento preferiti…" : "Loading wishlist…"}
        </Container>
      )}
    </main>
  );
}
