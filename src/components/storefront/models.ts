import type {
  Cart,
  CartItem,
  Collection,
  Locale,
  Money,
  Product,
  ProductMedia,
} from "@/lib/domain";

import type { MediaSource } from "@/components/ui/media";

export type StoreLocale = Locale;
export type MoneyValue = Money;

export interface StoreLink {
  active?: boolean;
  href: string;
  label: string;
}

export interface LanguageLink extends StoreLink {
  locale: StoreLocale;
}

export interface CollectionTileData extends Collection {
  href: string;
}

export interface ProductCardData extends Product {
  badge?: string;
  href: string;
}

export type ProductDetailData = ProductCardData;

export interface CartLineData extends CartItem {
  href: string;
}

export interface CartData extends Cart {
  checkoutHref: string;
  items: CartLineData[];
  shippingMessage?: string;
}

export interface FilterValue {
  count?: number;
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  values: FilterValue[];
}

export function toMediaSource(media?: ProductMedia | null): MediaSource | null {
  return media
    ? {
        alt: media.alt,
        height: media.height,
        src: media.url,
        width: media.width,
      }
    : null;
}
