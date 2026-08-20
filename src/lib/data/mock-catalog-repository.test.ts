import { describe, expect, it } from "vitest";

import { MockCatalogRepository } from "./mock-catalog-repository";

describe("MockCatalogRepository", () => {
  const repository = new MockCatalogRepository();

  it("returns a bilingual storefront DTO with official Wix media provenance", async () => {
    const italian = await repository.getProductBySlug("collana-dukaan", "it");
    const english = await repository.getProductBySlug("collana-dukaan", "en");

    expect(italian?.name).toBe("Collana Dukaan");
    expect(english?.description).toContain("official catalogue");
    expect(italian?.price.amountInCents).toBe(3800);
    expect(italian?.media[0]?.url).toMatch(
      /^https:\/\/static\.wixstatic\.com\/media\//,
    );
    expect(italian?.media[0]?.source.kind).toBe("official-wix");
    expect(italian?.contentStatus).toBe("mock");
  });

  it("consolidates a real multi-option product into typed variants", async () => {
    const product = await repository.getProductBySlug("kalpana-anello", "en");

    expect(product?.name).toBe("Kalpana Ring");
    expect(product?.variants.map((variant) => variant.name)).toEqual([
      "Turquoise",
      "Black",
      "White",
    ]);
    expect(product?.availableQuantity).toBe(11);
  });

  it("filters featured, new and collection listings", async () => {
    const featured = await repository.listProducts({
      locale: "it",
      featured: true,
      limit: 3,
    });
    const rings = await repository.listProducts({
      locale: "it",
      collectionSlug: "anelli-artigianali-etnici",
    });

    expect(featured).toHaveLength(3);
    expect(featured.every((product) => product.featured)).toBe(true);
    expect(rings.map((product) => product.category)).toEqual([
      "rings",
      "rings",
    ]);
  });

  it("returns localized collections and both sitemap variants", async () => {
    const collections = await repository.listCollections("en");
    const sitemap = await repository.getSitemapEntries();

    expect(collections[0]?.name).toBe("Necklaces");
    expect(collections[0]?.productCount).toBe(2);
    expect(sitemap).toContainEqual(
      expect.objectContaining({
        locale: "it",
        path: "/product-page/collana-dukaan",
      }),
    );
    expect(sitemap).toContainEqual(
      expect.objectContaining({
        locale: "en",
        path: "/en/product-page/collana-dukaan",
      }),
    );
  });
});
