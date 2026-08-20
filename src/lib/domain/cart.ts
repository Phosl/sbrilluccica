import type { Locale } from "./i18n";
import {
  addMoney,
  money,
  multiplyMoney,
  type CurrencyCode,
  type Money,
} from "./money";

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  variantId: string;
  sku: string;
  name: string;
  variantName: string;
  imageUrl: string;
  imageAlt: string;
  unitPrice: Money;
  quantity: number;
  availableQuantity: number;
  lineTotal: Money;
}

export interface Cart {
  id: string;
  locale: Locale;
  currency: CurrencyCode;
  items: CartItem[];
  itemCount: number;
  subtotal: Money;
  updatedAt: string;
}

export type AddCartItemInput = Omit<CartItem, "id" | "lineTotal">;

export type CartValidationCode =
  | "invalid_quantity"
  | "insufficient_stock"
  | "currency_mismatch";

export class CartValidationError extends Error {
  constructor(
    public readonly code: CartValidationCode,
    message: string,
  ) {
    super(message);
    this.name = "CartValidationError";
  }
}

export function createEmptyCart(
  locale: Locale = "it",
  id = "mock-cart",
): Cart {
  return recalculateCart({
    id,
    locale,
    currency: "EUR",
    items: [],
    itemCount: 0,
    subtotal: money(0),
    updatedAt: new Date().toISOString(),
  });
}

export function addCartItem(cart: Cart, input: AddCartItemInput): Cart {
  assertQuantity(input.quantity);
  assertCurrency(cart, input.unitPrice);

  const existing = cart.items.find(
    (item) => item.variantId === input.variantId,
  );
  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  assertStock(nextQuantity, input.availableQuantity);

  const nextItem: CartItem = {
    ...input,
    id: existing?.id ?? `cart-line-${input.variantId}`,
    quantity: nextQuantity,
    lineTotal: multiplyMoney(input.unitPrice, nextQuantity),
  };
  const items = existing
    ? cart.items.map((item) =>
        item.variantId === input.variantId ? nextItem : item,
      )
    : [...cart.items, nextItem];

  return recalculateCart({ ...cart, items });
}

export function setCartItemQuantity(
  cart: Cart,
  variantId: string,
  quantity: number,
): Cart {
  if (quantity === 0) return removeCartItem(cart, variantId);
  assertQuantity(quantity);

  const item = cart.items.find((entry) => entry.variantId === variantId);
  if (!item) return cart;
  assertStock(quantity, item.availableQuantity);

  return recalculateCart({
    ...cart,
    items: cart.items.map((entry) =>
      entry.variantId === variantId
        ? {
            ...entry,
            quantity,
            lineTotal: multiplyMoney(entry.unitPrice, quantity),
          }
        : entry,
    ),
  });
}

export function removeCartItem(cart: Cart, variantId: string): Cart {
  return recalculateCart({
    ...cart,
    items: cart.items.filter((item) => item.variantId !== variantId),
  });
}

function recalculateCart(cart: Cart): Cart {
  const subtotal = cart.items.reduce(
    (total, item) => addMoney(total, item.lineTotal),
    money(0, cart.currency),
  );

  return {
    ...cart,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    updatedAt: new Date().toISOString(),
  };
}

function assertQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new CartValidationError(
      "invalid_quantity",
      "Cart quantity must be a positive integer.",
    );
  }
}

function assertStock(quantity: number, availableQuantity: number): void {
  if (quantity > availableQuantity) {
    throw new CartValidationError(
      "insufficient_stock",
      "Requested quantity is not available.",
    );
  }
}

function assertCurrency(cart: Cart, price: Money): void {
  if (cart.currency !== price.currency) {
    throw new CartValidationError(
      "currency_mismatch",
      "Cart and item currencies must match.",
    );
  }
}
