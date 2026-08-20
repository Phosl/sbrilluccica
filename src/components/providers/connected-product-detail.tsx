"use client";

import { ProductDetail } from "@/components/storefront/product-detail";
import { ProductPurchaseForm } from "@/components/storefront/product-purchase-form";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { useCommerce } from "@/components/providers/commerce-provider";
import type { Locale, Product } from "@/lib/domain";

export function ConnectedProductDetail({
  categoryLabel,
  locale,
  product,
}: {
  categoryLabel?: string;
  locale: Locale;
  product: Product;
}) {
  const { addProduct, isWishlisted, toggleWishlist } = useCommerce();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute right-5 top-9 z-30 sm:right-8 lg:right-12 lg:top-16">
        <div className="pointer-events-auto">
          <WishlistButton
            active={isWishlisted(product.slug)}
            locale={locale}
            onToggle={() => toggleWishlist(product.slug)}
            productName={product.name}
            size="lg"
          />
        </div>
      </div>
      <ProductDetail
        categoryLabel={categoryLabel}
        locale={locale}
        product={product}
        purchaseSlot={
          <ProductPurchaseForm locale={locale} onAddToCart={addProduct} product={product} />
        }
      />
    </div>
  );
}
