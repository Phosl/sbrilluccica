"use client";

import { useState, type FormEvent } from "react";

import type { Locale, Product } from "@/lib/domain";

import { VariantOptions } from "@/components/storefront/variant-options";
import { Button } from "@/components/ui/button";

const copy = {
  en: {
    add: "Add to cart",
    option: "Option",
    quantity: "Quantity",
    select: "Choose an option",
    soldOut: "Sold out",
  },
  it: {
    add: "Aggiungi al carrello",
    option: "Opzione",
    quantity: "Quantità",
    select: "Scegli un’opzione",
    soldOut: "Esaurito",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ProductPurchaseForm({
  busy = false,
  locale,
  onAddToCart,
  product,
  variantLabel,
}: {
  busy?: boolean;
  locale: Locale;
  onAddToCart: (product: Product, variantId: string, quantity: number) => void;
  product: Product;
  variantLabel?: string;
}) {
  const firstAvailableId =
    product.variants.find((variant) => variant.availability !== "out_of_stock")?.id ?? "";
  const [variantId, setVariantId] = useState(firstAvailableId);
  const [quantity, setQuantity] = useState(1);
  const labels = copy[locale];
  const selectedVariant = product.variants.find((variant) => variant.id === variantId);
  const maximum = Math.min(8, selectedVariant?.availableQuantity ?? product.availableQuantity);
  const available = Boolean(selectedVariant && selectedVariant.availability !== "out_of_stock");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!variantId || !available) return;
    onAddToCart(product, variantId, quantity);
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={submit}>
      {product.variants.length > 1 ? (
        <VariantOptions
          busy={busy}
          label={variantLabel ?? labels.option}
          locale={locale}
          onSelect={(nextVariantId) => {
            setVariantId(nextVariantId);
            setQuantity(1);
          }}
          selectedId={variantId}
          selectPrompt={labels.select}
          variants={product.variants}
        />
      ) : (
        <input type="hidden" name="variantId" value={variantId} />
      )}

      <label className="block text-xs font-bold uppercase tracking-[0.16em]">
        {labels.quantity}
        <select
          name="quantity"
          value={quantity}
          disabled={!available || busy}
          className="mt-3 block min-h-12 w-24 rounded-xl border border-[#cdb6b1] bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
          onChange={(event) => setQuantity(Number(event.target.value))}
        >
          {Array.from({ length: Math.max(maximum, 1) }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </label>
      <div className="sticky bottom-3 z-20 rounded-full shadow-[0_12px_35px_rgba(65,32,41,0.2)] sm:static sm:shadow-none">
        <Button type="submit" disabled={!available || busy} fullWidth size="lg">
          {available ? labels.add : labels.soldOut}
        </Button>
      </div>
    </form>
  );
}
