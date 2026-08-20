"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addCartItem,
  createEmptyCart,
  removeCartItem,
  setCartItemQuantity,
  type Cart,
  type CartItem,
  type Locale,
  type Product,
} from "@/lib/domain";

interface CommerceContextValue {
  cart: Cart;
  hydrated: boolean;
  notice: string | null;
  addProduct: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  wishlist: string[];
  isWishlisted: (productSlug: string) => boolean;
  toggleWishlist: (productSlug: string) => void;
  clearCart: () => void;
  clearNotice: () => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

function cartStorageKey(locale: Locale) {
  return `sbrilluccica:cart:v1:${locale}`;
}

function wishlistStorageKey() {
  return "sbrilluccica:wishlist:v1";
}

function restoreCart(locale: Locale, value: string | null): Cart {
  if (!value) return createEmptyCart(locale);

  try {
    const parsed = JSON.parse(value) as Partial<Cart>;
    if (!Array.isArray(parsed.items)) return createEmptyCart(locale);

    return parsed.items.reduce((cart, item) => {
      const candidate = item as Partial<CartItem>;
      if (
        typeof candidate.productId !== "string" ||
        typeof candidate.productSlug !== "string" ||
        typeof candidate.variantId !== "string" ||
        typeof candidate.sku !== "string" ||
        typeof candidate.name !== "string" ||
        typeof candidate.variantName !== "string" ||
        typeof candidate.imageUrl !== "string" ||
        typeof candidate.imageAlt !== "string" ||
        typeof candidate.quantity !== "number" ||
        typeof candidate.availableQuantity !== "number" ||
        !candidate.unitPrice
      ) {
        return cart;
      }

      return addCartItem(cart, {
        productId: candidate.productId,
        productSlug: candidate.productSlug,
        variantId: candidate.variantId,
        sku: candidate.sku,
        name: candidate.name,
        variantName: candidate.variantName,
        imageUrl: candidate.imageUrl,
        imageAlt: candidate.imageAlt,
        unitPrice: candidate.unitPrice,
        quantity: candidate.quantity,
        availableQuantity: candidate.availableQuantity,
      });
    }, createEmptyCart(locale));
  } catch {
    return createEmptyCart(locale);
  }
}

function restoreWishlist(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item): item is string => typeof item === "string"))]
      : [];
  } catch {
    return [];
  }
}

export function CommerceProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [cart, setCart] = useState<Cart>(() => createEmptyCart(locale));
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCart(restoreCart(locale, window.localStorage.getItem(cartStorageKey(locale))));
      setWishlist(restoreWishlist(window.localStorage.getItem(wishlistStorageKey())));
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(cartStorageKey(locale), JSON.stringify(cart));
  }, [cart, hydrated, locale]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(wishlistStorageKey(), JSON.stringify(wishlist));
  }, [hydrated, wishlist]);

  const addProduct = useCallback(
    (product: Product, variantId: string, quantity = 1) => {
      const variant = product.variants.find((item) => item.id === variantId);
      if (!variant) {
        setNotice(locale === "it" ? "Seleziona una variante disponibile." : "Choose an available option.");
        return;
      }

      try {
        setCart((current) =>
          addCartItem(current, {
            productId: product.id,
            productSlug: product.slug,
            variantId: variant.id,
            sku: variant.sku,
            name: product.name,
            variantName: variant.name,
            imageUrl: product.media[0]?.url ?? "",
            imageAlt: product.media[0]?.alt ?? product.name,
            unitPrice: variant.price,
            quantity,
            availableQuantity: variant.availableQuantity,
          }),
        );
        setNotice(locale === "it" ? `${product.name} è nel carrello.` : `${product.name} is in your bag.`);
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : locale === "it"
              ? "Impossibile aggiungere il prodotto."
              : "The product could not be added.",
        );
      }
    },
    [locale],
  );

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    try {
      setCart((current) => setCartItemQuantity(current, variantId, quantity));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Invalid quantity.");
    }
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setCart((current) => removeCartItem(current, variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart(createEmptyCart(locale));
  }, [locale]);

  const toggleWishlist = useCallback((productSlug: string) => {
    setWishlist((current) =>
      current.includes(productSlug)
        ? current.filter((slug) => slug !== productSlug)
        : [...current, productSlug],
    );
  }, []);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cart,
      hydrated,
      notice,
      addProduct,
      removeItem,
      setQuantity,
      wishlist,
      isWishlisted: (productSlug) => wishlist.includes(productSlug),
      toggleWishlist,
      clearCart,
      clearNotice: () => setNotice(null),
    }),
    [addProduct, cart, clearCart, hydrated, notice, removeItem, setQuantity, toggleWishlist, wishlist],
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
      <p
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[80] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center text-sm text-paper shadow-xl empty:hidden"
      >
        {notice}
      </p>
    </CommerceContext.Provider>
  );
}

export function useCommerce(): CommerceContextValue {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider.");
  }
  return context;
}
