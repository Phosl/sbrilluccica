"use client";

import { CartPage } from "@/components/storefront/cart";
import { useCommerce } from "@/components/providers/commerce-provider";
import type { Locale } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

export function ConnectedCartPage({ locale }: { locale: Locale }) {
  const { cart, removeItem, setQuantity } = useCommerce();
  const path = (value: string) => localizedPath(locale, value);

  return (
    <div id="main-content">
      <CartPage
        actions={{ onQuantityChange: setQuantity, onRemove: removeItem }}
        cart={cart}
        checkoutHref={path("/checkout")}
        hrefForItem={(item) => path(`/product-page/${item.productSlug}`)}
        locale={locale}
        shippingMessage={
          locale === "it"
            ? "Costi e tempi vengono calcolati per la destinazione al checkout."
            : "Costs and timing are calculated for your destination at checkout."
        }
        shopHref={path("/shop")}
      />
    </div>
  );
}
