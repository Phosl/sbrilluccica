"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatMoney, type Cart, type CartItem, type Locale } from "@/lib/domain";

import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { Drawer } from "@/components/ui/drawer";
import { ResponsiveMedia } from "@/components/ui/media";
import { StatusPanel } from "@/components/ui/status";

const copy = {
  en: {
    cart: "Your cart",
    checkout: "Checkout",
    close: "Close",
    decrease: "Decrease quantity",
    emptyBody: "Choose something that feels like you. Your pieces will appear here.",
    emptyTitle: "Your cart is waiting to shine",
    increase: "Increase quantity",
    quantity: "Quantity",
    remove: "Remove",
    shop: "Discover the collection",
    subtotal: "Subtotal",
    taxes: "Shipping and taxes are calculated at checkout.",
    viewCart: "View cart",
  },
  it: {
    cart: "Il tuo carrello",
    checkout: "Vai al checkout",
    close: "Chiudi",
    decrease: "Riduci quantità",
    emptyBody: "Scegli ciò che ti somiglia. I tuoi gioielli appariranno qui.",
    emptyTitle: "Il carrello aspetta di brillare",
    increase: "Aumenta quantità",
    quantity: "Quantità",
    remove: "Rimuovi",
    shop: "Scopri la collezione",
    subtotal: "Subtotale",
    taxes: "Spedizione e imposte vengono calcolate al checkout.",
    viewCart: "Vedi il carrello",
  },
} satisfies Record<Locale, Record<string, string>>;

export interface CartActions {
  busyItemId?: string | null;
  onQuantityChange?: (variantId: string, quantity: number) => void;
  onRemove?: (variantId: string) => void;
}

function CartLine({
  actions,
  href,
  item,
  locale,
}: {
  actions?: CartActions;
  href: string;
  item: CartItem;
  locale: Locale;
}) {
  const labels = copy[locale];
  const busy = actions?.busyItemId === item.id;
  const atMax = item.quantity >= item.availableQuantity;

  return (
    <article className="grid grid-cols-[5.8rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <Link
        href={href}
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eadbd5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-2"
      >
        <ResponsiveMedia
          media={
            item.imageUrl
              ? { alt: item.imageAlt, src: item.imageUrl }
              : null
          }
          sizes="7rem"
        />
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl leading-tight tracking-tight">
              <Link
                href={href}
                className="rounded-sm hover:text-[#8b4255] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              >
                {item.name}
              </Link>
            </h3>
            {item.variantName ? (
              <p className="mt-1 text-xs leading-5 text-[#705e5b]">{item.variantName}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatMoney(item.lineTotal, locale)}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-[#cdb6b1] bg-white">
            <button
              type="button"
              aria-label={`${labels.decrease}: ${item.name}`}
              disabled={busy || item.quantity <= 1 || !actions?.onQuantityChange}
              className="grid size-10 place-items-center rounded-full hover:bg-[#f6e7e5] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              onClick={() => actions?.onQuantityChange?.(item.variantId, item.quantity - 1)}
            >
              <Minus aria-hidden="true" size={14} />
            </button>
            <span aria-live="polite" className="min-w-7 text-center text-sm font-semibold">
              <span className="sr-only">{labels.quantity}: </span>
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`${labels.increase}: ${item.name}`}
              disabled={busy || atMax || !actions?.onQuantityChange}
              className="grid size-10 place-items-center rounded-full hover:bg-[#f6e7e5] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              onClick={() => actions?.onQuantityChange?.(item.variantId, item.quantity + 1)}
            >
              <Plus aria-hidden="true" size={14} />
            </button>
          </div>
          <button
            type="button"
            disabled={busy || !actions?.onRemove}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-xs font-semibold text-[#705e5b] underline decoration-[#c8aaa4] underline-offset-4 hover:text-[#8b4255] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
            onClick={() => actions?.onRemove?.(item.variantId)}
          >
            <Trash2 aria-hidden="true" size={14} /> {labels.remove}
          </button>
        </div>
      </div>
    </article>
  );
}

function CartSummary({
  cart,
  checkoutHref,
  locale,
  shippingMessage,
}: {
  cart: Cart;
  checkoutHref: string;
  locale: Locale;
  shippingMessage?: string;
}) {
  const labels = copy[locale];
  return (
    <div>
      {shippingMessage ? (
        <p className="mb-4 rounded-xl bg-[#f6e7e5] px-4 py-3 text-center text-xs leading-5 text-[#6a3c49]">
          {shippingMessage}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">{labels.subtotal}</p>
        <p className="font-serif text-2xl">{formatMoney(cart.subtotal, locale)}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#705e5b]">{labels.taxes}</p>
      <Link href={checkoutHref} className={buttonStyles({ className: "mt-5", fullWidth: true, size: "lg" })}>
        {labels.checkout}
      </Link>
    </div>
  );
}

export function CartDrawer({
  actions,
  cart,
  cartHref,
  checkoutHref,
  hrefForItem,
  locale,
  onClose,
  open,
  shippingMessage,
  shopHref,
}: {
  actions?: CartActions;
  cart: Cart;
  cartHref: string;
  checkoutHref: string;
  hrefForItem: (item: CartItem) => string;
  locale: Locale;
  onClose: () => void;
  open: boolean;
  shippingMessage?: string;
  shopHref: string;
}) {
  const labels = copy[locale];
  const hasItems = cart.items.length > 0;
  const itemLabel =
    locale === "it"
      ? cart.itemCount === 1
        ? "articolo"
        : "articoli"
      : cart.itemCount === 1
        ? "item"
        : "items";

  return (
    <Drawer
      closeLabel={labels.close}
      open={open}
      onClose={onClose}
      title={labels.cart}
      description={hasItems ? `${cart.itemCount} ${itemLabel}` : undefined}
      footer={
        hasItems ? (
          <div>
            <CartSummary
              cart={cart}
              checkoutHref={checkoutHref}
              locale={locale}
              shippingMessage={shippingMessage}
            />
            <Link
              href={cartHref}
              className="mt-3 flex min-h-11 items-center justify-center text-xs font-semibold uppercase tracking-[0.14em] underline decoration-[#c8aaa4] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
            >
              {labels.viewCart}
            </Link>
          </div>
        ) : undefined
      }
    >
      {hasItems ? (
        <div className="divide-y divide-[#dfc9c4] px-5 sm:px-7">
          {cart.items.map((item) => (
            <CartLine
              key={item.id}
              actions={actions}
              href={hrefForItem(item)}
              item={item}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 sm:px-7">
          <StatusPanel
            body={labels.emptyBody}
            title={labels.emptyTitle}
            action={{ href: shopHref, label: labels.shop }}
          />
        </div>
      )}
    </Drawer>
  );
}

export function CartPage({
  actions,
  cart,
  checkoutHref,
  hrefForItem,
  locale,
  shippingMessage,
  shopHref,
}: {
  actions?: CartActions;
  cart: Cart;
  checkoutHref: string;
  hrefForItem: (item: CartItem) => string;
  locale: Locale;
  shippingMessage?: string;
  shopHref: string;
}) {
  const labels = copy[locale];
  const hasItems = cart.items.length > 0;

  return (
    <main className="flex-1 bg-[#fffaf4] py-12 text-[#2b1e20] sm:py-16 lg:py-24">
      <Container>
        <Eyebrow>{locale === "it" ? "La tua selezione" : "Your selection"}</Eyebrow>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-[-0.045em] sm:text-7xl">
          {labels.cart}
        </h1>
        {hasItems ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-16">
            <div className="divide-y divide-[#dfc9c4] border-y border-[#dfc9c4]">
              {cart.items.map((item) => (
                <CartLine
                  key={item.id}
                  actions={actions}
                  href={hrefForItem(item)}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
            <aside className="rounded-[1.5rem] border border-[#dfc9c4] bg-white p-6 lg:sticky lg:top-8">
              <CartSummary
                cart={cart}
                checkoutHref={checkoutHref}
                locale={locale}
                shippingMessage={shippingMessage}
              />
            </aside>
          </div>
        ) : (
          <StatusPanel
            className="mt-10"
            body={labels.emptyBody}
            title={labels.emptyTitle}
            action={{ href: shopHref, label: labels.shop }}
          />
        )}
      </Container>
    </main>
  );
}
