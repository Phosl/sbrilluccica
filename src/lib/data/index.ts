import type { Locale, ProductCategory } from "../domain";

import type { ProductQuery } from "./catalog-repository";
import { createCatalogRepository } from "./provider";

export * from "./catalog-repository";
export * from "./data-errors";
export * from "./mock-catalog-repository";
export * from "./provider";

export async function getProducts(
  locale: Locale,
  query: Omit<ProductQuery, "locale"> = {},
) {
  return createCatalogRepository().listProducts({ ...query, locale });
}

export async function getFeaturedProducts(locale: Locale, limit = 8) {
  return getProducts(locale, { featured: true, limit });
}

export async function getNewProducts(locale: Locale, limit = 8) {
  return getProducts(locale, { isNew: true, limit });
}

export async function getProductsByCollection(
  collectionSlug: string,
  locale: Locale,
  limit?: number,
) {
  return getProducts(locale, { collectionSlug, limit });
}

export async function getProductsByCategory(
  category: ProductCategory,
  locale: Locale,
  limit?: number,
) {
  return getProducts(locale, { category, limit });
}

export async function getProductBySlug(slug: string, locale: Locale) {
  return createCatalogRepository().getProductBySlug(slug, locale);
}

export async function getCollections(locale: Locale) {
  return createCatalogRepository().listCollections(locale);
}

export async function getCollectionBySlug(slug: string, locale: Locale) {
  return createCatalogRepository().getCollectionBySlug(slug, locale);
}

export async function getCatalogSitemapEntries() {
  return createCatalogRepository().getSitemapEntries();
}
