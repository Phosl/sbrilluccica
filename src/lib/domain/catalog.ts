import {
  DEFAULT_LOCALE,
  localizeText,
  type Locale,
  type LocalizedText,
} from "./i18n";
import { money, type Money } from "./money";

export type ProductStatus = "draft" | "published" | "archived";
export type ProductCategory =
  | "necklaces"
  | "earrings"
  | "rings"
  | "bracelets"
  | "accessories";
export type ProductAvailability =
  | "in_stock"
  | "low_stock"
  | "out_of_stock";
export type CatalogContentStatus = "verified" | "mock";

export interface ProductTranslation {
  name: string;
  shortDescription: string;
  description: string;
  materials: string | null;
  measurements: string | null;
  care: string | null;
  seoTitle: string;
  seoDescription: string;
}

export interface ProductMediaRecord {
  id: string;
  kind: "image";
  url: string;
  alt: LocalizedText;
  width: number;
  height: number;
  position: number;
  source: {
    kind: "official-wix";
    pageUrl: string;
  };
}

export interface ProductMedia extends Omit<ProductMediaRecord, "alt"> {
  alt: string;
}

export interface ProductVariantRecord {
  id: string;
  productId: string;
  sku: string;
  name: LocalizedText;
  options: Record<string, string>;
  price: Money;
  compareAtPrice: Money | null;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold: number;
  active: boolean;
}

export interface ProductVariant
  extends Omit<ProductVariantRecord, "name" | "stockOnHand" | "stockReserved"> {
  name: string;
  availableQuantity: number;
  availability: ProductAvailability;
}

export interface ProductRecord {
  id: string;
  slug: string;
  status: ProductStatus;
  category: ProductCategory;
  translations: Record<Locale, ProductTranslation>;
  media: ProductMediaRecord[];
  variants: ProductVariantRecord[];
  collectionSlugs: string[];
  tags: string[];
  featured: boolean;
  isNew: boolean;
  publishedAt: string;
  updatedAt: string;
  sourceUrl: string;
  contentStatus: CatalogContentStatus;
}

/** Storefront-safe, localized product DTO. */
export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  name: string;
  shortDescription: string;
  description: string;
  materials: string | null;
  measurements: string | null;
  care: string | null;
  seoTitle: string;
  seoDescription: string;
  media: ProductMedia[];
  variants: ProductVariant[];
  price: Money;
  compareAtPrice: Money | null;
  availableQuantity: number;
  availability: ProductAvailability;
  collectionSlugs: string[];
  tags: string[];
  featured: boolean;
  isNew: boolean;
  publishedAt: string;
  updatedAt: string;
  sourceUrl: string;
  contentStatus: CatalogContentStatus;
}

export interface CollectionTranslation {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CollectionRecord {
  id: string;
  slug: string;
  published: boolean;
  position: number;
  translations: Record<Locale, CollectionTranslation>;
  heroImage: ProductMediaRecord;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  position: number;
  heroImage: ProductMedia;
  productCount: number;
}

export interface CatalogSitemapEntry {
  kind: "product" | "collection";
  slug: string;
  locale: Locale;
  path: string;
  lastModified: string;
}

export function localizeProduct(
  record: ProductRecord,
  locale: Locale = DEFAULT_LOCALE,
): Product {
  const translation = record.translations[locale] ?? record.translations.it;
  const variants = record.variants
    .filter((variant) => variant.active)
    .map((variant) => localizeVariant(variant, locale));
  const primaryVariant = variants[0];

  if (!primaryVariant) {
    throw new Error(`Published product ${record.slug} has no active variant.`);
  }

  const availableQuantity = variants.reduce(
    (total, variant) => total + variant.availableQuantity,
    0,
  );

  return {
    id: record.id,
    slug: record.slug,
    category: record.category,
    ...translation,
    media: record.media
      .toSorted((left, right) => left.position - right.position)
      .map((item) => ({
        ...item,
        alt: localizeText(item.alt, locale),
      })),
    variants,
    price: variants.reduce(
      (lowest, variant) =>
        variant.price.amountInCents < lowest.amountInCents
          ? variant.price
          : lowest,
      primaryVariant.price,
    ),
    compareAtPrice: primaryVariant.compareAtPrice,
    availableQuantity,
    availability: getAvailability(
      availableQuantity,
      variants.reduce(
        (threshold, variant) => Math.max(threshold, variant.lowStockThreshold),
        0,
      ),
    ),
    collectionSlugs: [...record.collectionSlugs],
    tags: [...record.tags],
    featured: record.featured,
    isNew: record.isNew,
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
    sourceUrl: record.sourceUrl,
    contentStatus: record.contentStatus,
  };
}

export function localizeCollection(
  record: CollectionRecord,
  locale: Locale,
  productCount: number,
): Collection {
  const translation = record.translations[locale] ?? record.translations.it;

  return {
    id: record.id,
    slug: record.slug,
    ...translation,
    position: record.position,
    heroImage: {
      ...record.heroImage,
      alt: localizeText(record.heroImage.alt, locale),
    },
    productCount,
  };
}

function localizeVariant(
  record: ProductVariantRecord,
  locale: Locale,
): ProductVariant {
  const availableQuantity = Math.max(
    0,
    record.stockOnHand - record.stockReserved,
  );

  return {
    id: record.id,
    productId: record.productId,
    sku: record.sku,
    name: localizeText(record.name, locale),
    options: { ...record.options },
    price: money(record.price.amountInCents, record.price.currency),
    compareAtPrice: record.compareAtPrice
      ? money(
          record.compareAtPrice.amountInCents,
          record.compareAtPrice.currency,
        )
      : null,
    lowStockThreshold: record.lowStockThreshold,
    active: record.active,
    availableQuantity,
    availability: getAvailability(
      availableQuantity,
      record.lowStockThreshold,
    ),
  };
}

function getAvailability(
  availableQuantity: number,
  lowStockThreshold: number,
): ProductAvailability {
  if (availableQuantity <= 0) return "out_of_stock";
  if (availableQuantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
}
