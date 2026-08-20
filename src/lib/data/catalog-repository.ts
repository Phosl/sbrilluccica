import type {
  CatalogSitemapEntry,
  Collection,
  Locale,
  Product,
  ProductCategory,
} from "../domain";

export interface ProductQuery {
  locale: Locale;
  collectionSlug?: string;
  category?: ProductCategory;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
}

export interface CatalogRepository {
  listProducts(query: ProductQuery): Promise<Product[]>;
  getProductBySlug(slug: string, locale: Locale): Promise<Product | null>;
  listCollections(locale: Locale): Promise<Collection[]>;
  getCollectionBySlug(
    slug: string,
    locale: Locale,
  ): Promise<Collection | null>;
  getSitemapEntries(): Promise<CatalogSitemapEntry[]>;
}
