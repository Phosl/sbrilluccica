"use client";

import { ProductGrid } from "@/components/storefront/product-grid";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { useCommerce } from "@/components/providers/commerce-provider";
import type { Locale, Product } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

export function ConnectedProductGrid({
  action,
  emptyMessage,
  eyebrow,
  locale,
  products,
  title,
}: {
  action?: { href: string; label: string };
  emptyMessage?: { body: string; title: string };
  eyebrow?: string;
  locale: Locale;
  products: Product[];
  title?: string;
}) {
  const { isWishlisted, toggleWishlist } = useCommerce();

  return (
    <ProductGrid
      action={action}
      actionForProduct={(product) => (
        <WishlistButton
          active={isWishlisted(product.slug)}
          locale={locale}
          onToggle={() => toggleWishlist(product.slug)}
          productName={product.name}
        />
      )}
      emptyMessage={emptyMessage}
      eyebrow={eyebrow}
      hrefForProduct={(product) => localizedPath(locale, `/product-page/${product.slug}`)}
      locale={locale}
      products={products}
      title={title}
    />
  );
}
