// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { money, type Product } from "@/lib/domain";

import { ProductPurchaseForm } from "@/components/storefront/product-purchase-form";

const product: Product = {
  id: "product-1",
  slug: "kalpana-anello",
  category: "rings",
  name: "Kalpana Anello",
  shortDescription: "Anello con finiture diverse.",
  description: "Descrizione",
  materials: null,
  measurements: null,
  care: null,
  seoTitle: "Kalpana Anello",
  seoDescription: "Anello",
  media: [],
  variants: [
    {
      id: "variant-turquoise",
      productId: "product-1",
      sku: "TURQUOISE",
      name: "Turchese",
      options: { finish: "turquoise" },
      price: money(3800),
      compareAtPrice: null,
      lowStockThreshold: 2,
      active: true,
      availableQuantity: 3,
      availability: "in_stock",
    },
    {
      id: "variant-black",
      productId: "product-1",
      sku: "BLACK",
      name: "Nero",
      options: { finish: "black" },
      price: money(3800),
      compareAtPrice: null,
      lowStockThreshold: 2,
      active: true,
      availableQuantity: 2,
      availability: "low_stock",
    },
  ],
  price: money(3800),
  compareAtPrice: null,
  availableQuantity: 5,
  availability: "in_stock",
  collectionSlugs: ["anelli"],
  tags: ["rings"],
  featured: true,
  isNew: true,
  publishedAt: "2026-08-20T08:00:00.000Z",
  updatedAt: "2026-08-20T08:00:00.000Z",
  sourceUrl: "https://www.sbrilluccica.com/product-page/kalpana-anello",
  contentStatus: "mock",
};

describe("ProductPurchaseForm", () => {
  it("submits the selected variant and quantity", () => {
    const onAddToCart = vi.fn();
    render(
      <ProductPurchaseForm
        locale="it"
        onAddToCart={onAddToCart}
        product={product}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /Nero/i }));
    fireEvent.change(screen.getByRole("combobox", { name: /Quantità/i }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Aggiungi al carrello/i }));

    expect(onAddToCart).toHaveBeenCalledWith(product, "variant-black", 2);
  });
});
