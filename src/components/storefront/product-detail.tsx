import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  formatMoney,
  type Locale,
  type Product,
} from "@/lib/domain";

import { ProductGallery } from "@/components/storefront/product-gallery";
import { VariantOptions } from "@/components/storefront/variant-options";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

const copy = {
  en: {
    add: "Add to cart",
    available: "Available",
    care: "Care",
    details: "Details",
    low: "Only a few left",
    materials: "Materials",
    measurements: "Measurements",
    option: "Option",
    quantity: "Quantity",
    select: "Choose an option",
    soldOut: "Sold out",
  },
  it: {
    add: "Aggiungi al carrello",
    available: "Disponibile",
    care: "Cura",
    details: "Dettagli",
    low: "Ne restano pochi",
    materials: "Materiali",
    measurements: "Misure",
    option: "Opzione",
    quantity: "Quantità",
    select: "Scegli un’opzione",
    soldOut: "Esaurito",
  },
} satisfies Record<Locale, Record<string, string>>;

function ProductDisclosure({ label, value }: { label: string; value: string }) {
  return (
    <details className="group border-b border-[#dfc9c4]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-xs font-bold uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          aria-hidden="true"
          className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
          size={17}
        />
      </summary>
      <p className="pb-5 text-sm leading-7 text-[#705e5b]">{value}</p>
    </details>
  );
}

export function ProductDetail({
  addToCartAction,
  categoryLabel,
  locale,
  product,
  purchaseSlot,
  variantLabel,
}: {
  addToCartAction?: FormAction;
  categoryLabel?: string;
  locale: Locale;
  product: Product;
  purchaseSlot?: ReactNode;
  variantLabel?: string;
}) {
  const labels = copy[locale];
  const available = product.availability !== "out_of_stock";
  const isOnSale =
    product.compareAtPrice !== null &&
    product.compareAtPrice.amountInCents > product.price.amountInCents;

  return (
    <section aria-labelledby="product-title" className="bg-[#fffaf4] py-6 text-[#2b1e20] sm:py-10 lg:py-14">
      <Container>
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-start lg:gap-12 xl:gap-20">
          <ProductGallery images={product.media} locale={locale} productName={product.name} />

          <div className="lg:sticky lg:top-8 lg:py-4">
            <Eyebrow>{categoryLabel ?? product.category}</Eyebrow>
            <h1 id="product-title" className="mt-3 text-balance font-serif text-5xl leading-[0.9] tracking-[-0.045em] sm:text-6xl xl:text-7xl">
              {product.name}
            </h1>
            <div className="mt-5 flex items-baseline gap-3">
              <p className="text-lg font-semibold">{formatMoney(product.price, locale)}</p>
              {isOnSale && product.compareAtPrice ? (
                <p className="text-sm text-[#8d7a76] line-through">
                  {formatMoney(product.compareAtPrice, locale)}
                </p>
              ) : null}
            </div>
            <p className="mt-5 text-pretty text-base leading-7 text-[#5f4b49]">
              {product.shortDescription || product.description}
            </p>

            <p className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b4255]">
              <span className="grid size-5 place-items-center rounded-full bg-[#f0d6da]">
                <Check aria-hidden="true" size={12} strokeWidth={2.2} />
              </span>
              {available
                ? product.availability === "low_stock"
                  ? labels.low
                  : labels.available
                : labels.soldOut}
            </p>

            {purchaseSlot ?? (
              <form action={addToCartAction} className="mt-8 space-y-6">
                <input type="hidden" name="productId" value={product.id} />
                <VariantOptions
                  defaultSelectedId={product.variants.find((variant) => variant.availability !== "out_of_stock")?.id}
                  label={variantLabel ?? labels.option}
                  locale={locale}
                  selectPrompt={labels.select}
                  variants={product.variants}
                />
                <label className="block text-xs font-bold uppercase tracking-[0.16em]">
                  {labels.quantity}
                  <select
                    name="quantity"
                    defaultValue="1"
                    disabled={!available}
                    className="mt-3 block min-h-12 w-24 rounded-xl border border-[#cdb6b1] bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
                  >
                    {Array.from({ length: Math.min(8, Math.max(product.availableQuantity, 1)) }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sticky bottom-3 z-20 rounded-full shadow-[0_12px_35px_rgba(65,32,41,0.2)] sm:static sm:shadow-none">
                  <Button type="submit" disabled={!available} fullWidth size="lg">
                    {available ? labels.add : labels.soldOut}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-8 border-t border-[#dfc9c4]">
              {product.description && product.description !== product.shortDescription ? (
                <ProductDisclosure label={labels.details} value={product.description} />
              ) : null}
              {product.materials ? (
                <ProductDisclosure label={labels.materials} value={product.materials} />
              ) : null}
              {product.measurements ? (
                <ProductDisclosure label={labels.measurements} value={product.measurements} />
              ) : null}
              {product.care ? <ProductDisclosure label={labels.care} value={product.care} /> : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
