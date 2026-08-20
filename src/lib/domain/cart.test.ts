import { describe, expect, it } from "vitest";

import { money } from "./money";
import {
  CartValidationError,
  addCartItem,
  createEmptyCart,
  removeCartItem,
  setCartItemQuantity,
  type AddCartItemInput,
} from "./cart";

const item: AddCartItemInput = {
  productId: "product-1",
  productSlug: "collana-dukaan",
  variantId: "variant-1",
  sku: "SBR-DUKAAN",
  name: "Collana Dukaan",
  variantName: "Unica",
  imageUrl: "https://static.wixstatic.com/media/example.jpg",
  imageAlt: "Collana Dukaan",
  unitPrice: money(3800),
  quantity: 1,
  availableQuantity: 3,
};

describe("cart", () => {
  it("merges the same variant and recalculates integer totals", () => {
    const once = addCartItem(createEmptyCart("it"), item);
    const twice = addCartItem(once, item);

    expect(twice.items).toHaveLength(1);
    expect(twice.itemCount).toBe(2);
    expect(twice.subtotal.amountInCents).toBe(7600);
    expect(twice.items[0]?.lineTotal.amountInCents).toBe(7600);
  });

  it("prevents a browser cart from exceeding known stock", () => {
    const cart = addCartItem(createEmptyCart("it"), item);

    expect(() => setCartItemQuantity(cart, item.variantId, 4)).toThrowError(
      CartValidationError,
    );
  });

  it("removes lines cleanly", () => {
    const cart = addCartItem(createEmptyCart("it"), item);
    const empty = removeCartItem(cart, item.variantId);

    expect(empty.items).toEqual([]);
    expect(empty.itemCount).toBe(0);
    expect(empty.subtotal.amountInCents).toBe(0);
  });
});
