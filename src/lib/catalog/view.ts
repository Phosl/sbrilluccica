import type { Locale, Product, ProductCategory } from "@/lib/domain";

export const productCategories: ProductCategory[] = [
  "necklaces",
  "earrings",
  "rings",
  "bracelets",
  "accessories",
];

const labels: Record<Locale, Record<ProductCategory, string>> = {
  it: {
    necklaces: "Collane",
    earrings: "Orecchini",
    rings: "Anelli",
    bracelets: "Bracciali",
    accessories: "Accessori",
  },
  en: {
    necklaces: "Necklaces",
    earrings: "Earrings",
    rings: "Rings",
    bracelets: "Bracelets",
    accessories: "Accessories",
  },
};

export function categoryLabel(category: ProductCategory, locale: Locale): string {
  return labels[locale][category];
}

export function isProductCategory(value: string): value is ProductCategory {
  return productCategories.includes(value as ProductCategory);
}

export function filterAndSortProducts(
  products: Product[],
  {
    categories,
    query,
    sort,
  }: { categories?: string[]; query?: string; sort?: string },
): Product[] {
  const validCategories = (categories ?? []).filter(isProductCategory);
  const normalizedQuery = query?.trim().toLocaleLowerCase();

  const filtered = products.filter((product) => {
    if (validCategories.length && !validCategories.includes(product.category)) return false;
    if (!normalizedQuery) return true;

    return [product.name, product.shortDescription, product.description, ...product.tags]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });

  return filtered.toSorted((left, right) => {
    if (sort === "price-asc") return left.price.amountInCents - right.price.amountInCents;
    if (sort === "price-desc") return right.price.amountInCents - left.price.amountInCents;
    return right.publishedAt.localeCompare(left.publishedAt);
  });
}
