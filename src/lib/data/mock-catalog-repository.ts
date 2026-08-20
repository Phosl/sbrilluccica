import { mockCollectionRecords, mockProductRecords } from "../../data/mock-catalog";
import {
  SUPPORTED_LOCALES,
  localizeCollection,
  localizeProduct,
  type CatalogSitemapEntry,
  type Collection,
  type Locale,
  type Product,
} from "../domain";

import type { CatalogRepository, ProductQuery } from "./catalog-repository";

export class MockCatalogRepository implements CatalogRepository {
  async listProducts(query: ProductQuery): Promise<Product[]> {
    const records = mockProductRecords
      .filter((product) => product.status === "published")
      .filter(
        (product) =>
          !query.collectionSlug ||
          product.collectionSlugs.includes(query.collectionSlug),
      )
      .filter(
        (product) => !query.category || product.category === query.category,
      )
      .filter(
        (product) =>
          query.featured === undefined || product.featured === query.featured,
      )
      .filter(
        (product) => query.isNew === undefined || product.isNew === query.isNew,
      )
      .toSorted((left, right) =>
        right.publishedAt.localeCompare(left.publishedAt),
      );
    const limitedRecords =
      query.limit === undefined ? records : records.slice(0, query.limit);

    return limitedRecords.map((product) =>
      localizeProduct(product, query.locale),
    );
  }

  async getProductBySlug(
    slug: string,
    locale: Locale,
  ): Promise<Product | null> {
    const product = mockProductRecords.find(
      (candidate) =>
        candidate.status === "published" && candidate.slug === slug,
    );

    return product ? localizeProduct(product, locale) : null;
  }

  async listCollections(locale: Locale): Promise<Collection[]> {
    return mockCollectionRecords
      .filter((collection) => collection.published)
      .toSorted((left, right) => left.position - right.position)
      .map((collection) =>
        localizeCollection(
          collection,
          locale,
          mockProductRecords.filter(
            (product) =>
              product.status === "published" &&
              product.collectionSlugs.includes(collection.slug),
          ).length,
        ),
      );
  }

  async getCollectionBySlug(
    slug: string,
    locale: Locale,
  ): Promise<Collection | null> {
    const collection = mockCollectionRecords.find(
      (candidate) => candidate.published && candidate.slug === slug,
    );
    if (!collection) return null;

    return localizeCollection(
      collection,
      locale,
      mockProductRecords.filter(
        (product) =>
          product.status === "published" &&
          product.collectionSlugs.includes(collection.slug),
      ).length,
    );
  }

  async getSitemapEntries(): Promise<CatalogSitemapEntry[]> {
    const productEntries = mockProductRecords.flatMap((product) =>
      product.status === "published"
        ? SUPPORTED_LOCALES.map((locale) => ({
            kind: "product" as const,
            slug: product.slug,
            locale,
            path: localizePath(`/product-page/${product.slug}`, locale),
            lastModified: product.updatedAt,
          }))
        : [],
    );
    const collectionEntries = mockCollectionRecords.flatMap((collection) =>
      collection.published
        ? SUPPORTED_LOCALES.map((locale) => ({
            kind: "collection" as const,
            slug: collection.slug,
            locale,
            path: localizePath(`/category/${collection.slug}`, locale),
            lastModified: "2026-08-20T08:00:00.000Z",
          }))
        : [],
    );

    return [...productEntries, ...collectionEntries];
  }
}

function localizePath(path: string, locale: Locale): string {
  return locale === "it" ? path : `/en${path}`;
}
