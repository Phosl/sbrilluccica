import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildStagingCatalog,
  findSkuConflictGroups,
  findVariantCandidateGroups,
  mapConcurrent,
  parseProductPage,
  parseProductSitemap,
  toTargetSlug,
} from "./lib.mjs";

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), "fixtures");

test("parses and deterministically sorts only product sitemap entries", async () => {
  const xml = await readFile(resolve(FIXTURES, "store-products-sitemap.xml"), "utf8");
  const entries = parseProductSitemap(xml);

  assert.deepEqual(
    entries.map((entry) => entry.slug),
    ["taara-bracciale", "taara-bracciale-1"],
  );
  assert.equal(entries[1].images[0].altIt, "Taara dall'alto");
  assert.equal(
    entries[1].images[0].canonicalUrl,
    "https://static.wixstatic.com/media/cbc8f4_first~mv2.jpg",
  );
});

test("extracts verified JSON-LD fields and public Wix variants", async () => {
  const html = await readFile(resolve(FIXTURES, "product-page.html"), "utf8");
  const product = parseProductPage(html, {
    slug: "anello-artigianale-etnico-karma-onici-nere",
    sourceUrl:
      "https://www.sbrilluccica.com/product-page/anello-artigianale-etnico-karma-onici-nere",
    lastModified: "2025-12-12",
    images: [],
  });

  assert.equal(product.sourceProductId, "product-uuid");
  assert.equal(product.nameIt, "Karma Anello Nero");
  assert.equal(product.sku, "Roller Ring");
  assert.deepEqual(product.price, { amountInCents: 8000, currency: "EUR" });
  assert.equal(product.images[0].width, 3024);
  assert.equal(
    product.images[0].canonicalUrl,
    "https://static.wixstatic.com/media/cbc8f4_hero~mv2.jpg",
  );
  assert.deepEqual(product.options[0].values.map((item) => item.value), ["10", "12"]);
  assert.deepEqual(product.variants[0].options, { taglia: "10" });
  assert.equal(product.variants[0].targetSku, "POO1");
  assert.equal(product.variants[0].targetSkuSource, "wix-variant-data");
  assert.equal(product.variants[0].stockQuantity, 3);
  assert.equal(product.variants[1].availability, "out_of_stock");
  assert.deepEqual(product.categoryCandidate, {
    value: "rings",
    basis: "slug-and-name-keyword",
    verified: false,
  });
});

test("reports numbered slugs as candidates and never merges products", () => {
  const products = [
    productStub("taara-bracciale", "Taara Bracciale", "SBR-T-01"),
    productStub("taara-bracciale-1", "Taara Bracciale", "SBR-T-02"),
    productStub("altro-bracciale", "Altro", "SBR-A-01"),
  ];
  const groups = findVariantCandidateGroups(products);
  const catalog = buildStagingCatalog({
    sitemapUrl: "https://example.test/store-products-sitemap.xml",
    entries: products,
    products,
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].reason, "numbered-slug");
  assert.deepEqual(groups[0].members.map((item) => item.slug), [
    "taara-bracciale",
    "taara-bracciale-1",
  ]);
  assert.equal(catalog.products.length, 3);
  assert.match(groups[0].note, /Never merged automatically/);
});

test("uses the verified product SKU only for a single SKU-less variant", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({
    "@type": "Product",
    name: "Prodotto singolo",
    sku: "SBR-SINGLE",
    image: "https://static.wixstatic.com/media/single.jpg",
    offers: { price: "20", priceCurrency: "EUR", availability: "InStock" },
  })}</script><script type="application/json">${JSON.stringify({
    product: {
      id: "single-id",
      urlPart: "prodotto-singolo",
      name: "Prodotto singolo",
      media: [],
      options: [],
      productItems: [
        {
          id: "single-variant",
          sku: null,
          price: 20,
          optionsSelections: [],
          inventory: { status: "in_stock", quantity: 1 },
        },
      ],
    },
  })}</script>`;
  const product = parseProductPage(html, {
    slug: "prodotto-singolo",
    sourceUrl: "https://example.test/product-page/prodotto-singolo",
    lastModified: "2026-08-20",
    images: [],
  });

  assert.equal(product.variants[0].sku, null);
  assert.equal(product.variants[0].targetSku, "SBR-SINGLE");
  assert.equal(product.variants[0].targetSkuSource, "product-sku");
  assert.ok(!product.reviewFlags.includes("missing-variant-sku"));
});

test("mapConcurrent preserves input order", async () => {
  const result = await mapConcurrent([3, 1, 2], 2, async (value) => {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, value));
    return value * 10;
  });
  assert.deepEqual(result, [30, 10, 20]);
});

test("normalizes Unicode Wix slugs without overwriting the source slug", () => {
  assert.equal(toTargetSlug("earcuf-s-æng-1"), "earcuf-s-aeng-1");
  assert.equal(toTargetSlug("orecchino-khuṇ"), "orecchino-khun");
  assert.equal(toTargetSlug("earcuf-h-ıỵ-1"), "earcuf-h-iy-1");
});

test("reports duplicate variant SKUs without rewriting them", () => {
  const products = [
    productStub("primo", "Primo", "SBR-001"),
    productStub("secondo", "Secondo", "sbr-001"),
  ];
  const groups = findSkuConflictGroups(products);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].normalizedSku, "SBR-001");
  assert.deepEqual(groups[0].members.map((member) => member.sku), [
    "SBR-001",
    "sbr-001",
  ]);
});

function productStub(slug, nameIt, sku) {
  return {
    slug,
    targetSlug: slug,
    sourceUrl: `https://example.test/product-page/${slug}`,
    nameIt,
    sku,
    price: { amountInCents: 2000, currency: "EUR" },
    variants: [
      {
        sourceId: `${slug}-variant`,
        sku,
        targetSku: sku,
      },
    ],
    reviewFlags: [],
  };
}
