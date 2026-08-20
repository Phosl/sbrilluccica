import { readFile } from "node:fs/promises";

export const SCHEMA_VERSION = 1;

const DEFAULT_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "it-IT,it;q=0.9,en;q=0.7",
  "user-agent":
    "SbrilluccicaCatalogMigration/1.0 (+https://www.sbrilluccica.com/)",
};

/**
 * Fetches a public URL with a fixed retry policy. The delay is deliberately
 * jitter-free so repeated imports behave the same way.
 */
export async function fetchText(
  url,
  {
    fetchImpl = globalThis.fetch,
    timeoutMs = 30_000,
    retries = 2,
    headers = DEFAULT_HEADERS,
  } = {},
) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await wait(300 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Unable to fetch ${url}: ${message}`);
}

export function parseProductSitemap(xml) {
  if (typeof xml !== "string" || !xml.includes("<urlset")) {
    throw new Error("The input is not a Wix product URL sitemap.");
  }

  const entries = [];
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const block = match[1];
    const sourceUrl = readXmlTag(block, "loc");
    if (!sourceUrl) continue;

    let parsedUrl;
    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      continue;
    }

    const productMarker = "/product-page/";
    const markerIndex = parsedUrl.pathname.indexOf(productMarker);
    if (markerIndex < 0) continue;

    const encodedSlug = parsedUrl.pathname.slice(markerIndex + productMarker.length);
    const slug = safeDecodeURIComponent(encodedSlug.replace(/\/$/, ""));
    if (!slug) continue;

    const images = [];
    for (const imageMatch of block.matchAll(/<image:image>([\s\S]*?)<\/image:image>/gi)) {
      const imageBlock = imageMatch[1];
      const renditionUrl = readXmlTag(imageBlock, "image:loc");
      if (!renditionUrl) continue;
      images.push({
        renditionUrl,
        canonicalUrl: canonicalizeWixMediaUrl(renditionUrl),
        altIt: readXmlTag(imageBlock, "image:title"),
        width: null,
        height: null,
        source: "sitemap",
      });
    }

    entries.push({
      slug,
      sourceUrl,
      lastModified: readXmlTag(block, "lastmod"),
      images: dedupeImages(images),
    });
  }

  return entries.toSorted((left, right) => left.slug.localeCompare(right.slug, "it"));
}

export function parseProductPage(html, sitemapEntry) {
  const schemaProduct = extractSchemaProduct(html);
  if (!schemaProduct) {
    throw new Error("Product JSON-LD was not found.");
  }

  const hydratedProduct = extractHydratedProduct(html, sitemapEntry.slug);
  const offer = selectOffer(schemaProduct.offers);
  const embeddedPrice = numberOrNull(hydratedProduct?.price);
  const priceAmount = numberOrNull(offer?.price ?? offer?.lowPrice) ?? embeddedPrice;
  const priceCurrency =
    stringOrNull(offer?.priceCurrency) ??
    stringOrNull(hydratedProduct?.currency) ??
    (priceAmount === null ? null : "EUR");
  const schemaImages = normalizeSchemaImages(schemaProduct.image);
  const images = dedupeImages([...schemaImages, ...sitemapEntry.images]);
  const options = normalizeOptions(hydratedProduct?.options);
  const topLevelSku = cleanText(schemaProduct.sku) ?? cleanText(hydratedProduct?.sku);
  const variants = resolveVariantSkus(
    normalizeVariants(hydratedProduct?.productItems, options),
    topLevelSku,
  );
  const inferredCategory = inferCategory(sitemapEntry.slug, schemaProduct.name);
  const targetSlug = toTargetSlug(sitemapEntry.slug);
  const reviewFlags = [];

  if (variants.length === 0 && !topLevelSku) {
    reviewFlags.push("missing-verified-sku");
  }
  if (variants.some((variant) => !variant.targetSku)) {
    reviewFlags.push("missing-variant-sku");
  }
  if (priceAmount === null || !priceCurrency) {
    reviewFlags.push("missing-verified-price");
  }
  if (images.length === 0) reviewFlags.push("missing-image");
  if (hasNumberedSlug(sitemapEntry.slug)) {
    reviewFlags.push("numbered-slug-variant-candidate");
  }
  if (targetSlug !== sitemapEntry.slug) {
    reviewFlags.push("target-slug-normalized");
  }
  if (!hydratedProduct && html.includes('"productItems"')) {
    reviewFlags.push("embedded-variant-data-not-matched");
  }

  return {
    sourceProductId: cleanText(hydratedProduct?.id),
    slug: sitemapEntry.slug,
    targetSlug,
    sourceUrl: sitemapEntry.sourceUrl,
    sourceLastModified: sitemapEntry.lastModified,
    nameIt: cleanText(schemaProduct.name),
    descriptionIt: cleanText(schemaProduct.description),
    sku: topLevelSku,
    price:
      priceAmount === null || !priceCurrency
        ? null
        : {
            amountInCents: decimalToCents(priceAmount),
            currency: priceCurrency.toUpperCase(),
          },
    availability: normalizeAvailability(
      offer?.availability ?? hydratedProduct?.inventory?.status,
    ),
    images,
    options,
    variants,
    categoryCandidate: inferredCategory,
    verification: {
      name: "json-ld",
      description: schemaProduct.description ? "json-ld" : null,
      sku: schemaProduct.sku ? "json-ld" : hydratedProduct?.sku ? "wix-page-data" : null,
      price: priceAmount === null ? null : offer ? "json-ld" : "wix-page-data",
      images: images.length ? "official-wix" : null,
      options: options.length ? "wix-page-data" : null,
      variants: variants.length ? "wix-page-data" : null,
    },
    reviewFlags: reviewFlags.toSorted(),
  };
}

export function buildStagingCatalog({ sitemapUrl, entries, products, failures = [] }) {
  const sortedProducts = products
    .map((product) => ({
      ...product,
      reviewFlags: [...product.reviewFlags],
    }))
    .toSorted((left, right) => left.slug.localeCompare(right.slug, "it"));
  const variantCandidateGroups = findVariantCandidateGroups(sortedProducts);
  const variantCandidateSlugs = new Set(
    variantCandidateGroups.flatMap((group) => group.members.map((member) => member.slug)),
  );
  const slugCollisionGroups = findSlugCollisionGroups(sortedProducts);
  const slugCollisionSlugs = new Set(
    slugCollisionGroups.flatMap((group) => group.members.map((member) => member.slug)),
  );
  const skuConflictGroups = findSkuConflictGroups(sortedProducts);
  const skuConflictSlugs = new Set(
    skuConflictGroups.flatMap((group) => group.members.map((member) => member.slug)),
  );

  for (const product of sortedProducts) {
    if (
      variantCandidateSlugs.has(product.slug) &&
      !product.reviewFlags.includes("possible-variant-group")
    ) {
      product.reviewFlags.push("possible-variant-group");
    }
    if (slugCollisionSlugs.has(product.slug)) product.reviewFlags.push("target-slug-collision");
    if (skuConflictSlugs.has(product.slug)) product.reviewFlags.push("duplicate-variant-sku");
    product.reviewFlags = [...new Set(product.reviewFlags)].toSorted();
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    source: {
      siteUrl: "https://www.sbrilluccica.com",
      sitemapUrl,
      policy:
        "Official public sitemap, product JSON-LD and Wix page data only; inferred fields are labelled and require review.",
    },
    stats: {
      sitemapEntries: entries.length,
      importedProducts: sortedProducts.length,
      failures: failures.length,
      variantCandidateGroups: variantCandidateGroups.length,
      slugCollisionGroups: slugCollisionGroups.length,
      skuConflictGroups: skuConflictGroups.length,
      productsWithVariantSkuGaps: sortedProducts.filter((product) =>
        product.variants.some((variant) => !variant.targetSku),
      ).length,
      variantSkuGaps: sortedProducts.reduce(
        (total, product) =>
          total + product.variants.filter((variant) => !variant.targetSku).length,
        0,
      ),
    },
    products: sortedProducts,
    variantCandidateGroups,
    slugCollisionGroups,
    skuConflictGroups,
    failures: failures.toSorted((left, right) => left.slug.localeCompare(right.slug, "it")),
  };
}

export function findVariantCandidateGroups(products) {
  const groups = new Map();

  for (const product of products) {
    if (!hasNumberedSlug(product.slug)) continue;
    const baseSlug = stripNumberedSlug(product.slug);
    const members = products.filter(
      (candidate) => stripNumberedSlug(candidate.slug) === baseSlug,
    );
    if (members.length < 2) continue;
    groups.set(`numbered-slug:${baseSlug}`, {
      key: baseSlug,
      reason: "numbered-slug",
      decision: "review-required",
      note: "Candidate variants only. Never merged automatically.",
      members: summarizeGroupMembers(members),
    });
  }

  const byName = new Map();
  for (const product of products) {
    const key = normalizeName(product.nameIt);
    if (!key) continue;
    const bucket = byName.get(key) ?? [];
    bucket.push(product);
    byName.set(key, bucket);
  }
  for (const [nameKey, members] of byName) {
    if (members.length < 2) continue;
    const groupKey = `same-name:${nameKey}`;
    if ([...groups.values()].some((group) => sameMembers(group.members, members))) continue;
    groups.set(groupKey, {
      key: nameKey,
      reason: "same-normalized-name",
      decision: "review-required",
      note: "Candidate variants only. Never merged automatically.",
      members: summarizeGroupMembers(members),
    });
  }

  return [...groups.values()].toSorted((left, right) =>
    `${left.reason}:${left.key}`.localeCompare(`${right.reason}:${right.key}`, "it"),
  );
}

export function findSlugCollisionGroups(products) {
  const byTargetSlug = new Map();
  for (const product of products) {
    const bucket = byTargetSlug.get(product.targetSlug) ?? [];
    bucket.push(product);
    byTargetSlug.set(product.targetSlug, bucket);
  }

  return [...byTargetSlug]
    .filter(([, members]) => members.length > 1)
    .map(([targetSlug, members]) => ({
      targetSlug,
      decision: "review-required",
      note: "The ASCII Supabase slug is not unique; choose distinct canonical slugs before import.",
      members: summarizeGroupMembers(members),
    }))
    .toSorted((left, right) => left.targetSlug.localeCompare(right.targetSlug, "it"));
}

export function findSkuConflictGroups(products) {
  const bySku = new Map();
  for (const product of products) {
    const effectiveVariants = product.variants.length
      ? product.variants
      : [{ sourceId: null, targetSku: product.sku }];
    for (const variant of effectiveVariants) {
      const normalizedSku = cleanText(variant.targetSku)?.toLocaleUpperCase("it");
      if (!normalizedSku) continue;
      const bucket = bySku.get(normalizedSku) ?? [];
      bucket.push({
        slug: product.slug,
        sourceUrl: product.sourceUrl,
        sourceVariantId: variant.sourceId,
        sku: variant.targetSku,
      });
      bySku.set(normalizedSku, bucket);
    }
  }

  return [...bySku]
    .filter(([, members]) => members.length > 1)
    .map(([normalizedSku, members]) => ({
      normalizedSku,
      decision: "review-required",
      note: "Supabase requires unique variant SKUs; no value was rewritten automatically.",
      members: members.toSorted((left, right) =>
        `${left.slug}:${left.sourceVariantId}`.localeCompare(
          `${right.slug}:${right.sourceVariantId}`,
          "it",
        ),
      ),
    }))
    .toSorted((left, right) => left.normalizedSku.localeCompare(right.normalizedSku, "it"));
}

export function toTargetSlug(sourceSlug) {
  const transliterated = sourceSlug
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i")
    .replaceAll("æ", "ae")
    .replaceAll("ø", "o")
    .replaceAll("đ", "d")
    .replaceAll("ł", "l")
    .replaceAll("ß", "ss")
    .toLocaleLowerCase("it")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!transliterated) {
    throw new Error(`Unable to create an ASCII target slug for ${sourceSlug}`);
  }
  return transliterated;
}

export async function mapConcurrent(items, concurrency, mapper) {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive integer");
  }
  const output = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      output[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return output;
}

export async function readTextInput(pathOrUrl, options = {}) {
  if (/^https?:\/\//i.test(pathOrUrl)) return fetchText(pathOrUrl, options);
  return readFile(pathOrUrl, "utf8");
}

function extractSchemaProduct(html) {
  for (const script of extractScripts(html)) {
    if (!/type\s*=\s*["']application\/ld\+json["']/i.test(script.attributes)) continue;
    try {
      const value = JSON.parse(script.body);
      const product = findObject(
        value,
        (candidate) => schemaTypeIncludes(candidate?.["@type"], "Product"),
      );
      if (product) return product;
    } catch {
      // Ignore malformed unrelated schema blocks and continue.
    }
  }
  return null;
}

function extractHydratedProduct(html, slug) {
  let best = null;
  let bestScore = 0;
  for (const script of extractScripts(html)) {
    if (!/type\s*=\s*["']application\/json["']/i.test(script.attributes)) continue;
    let value;
    try {
      value = JSON.parse(script.body);
    } catch {
      continue;
    }
    walkObjects(value, (candidate) => {
      const score = scoreHydratedProduct(candidate, slug);
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    });
  }
  return bestScore >= 8 ? best : null;
}

function scoreHydratedProduct(candidate, slug) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return 0;
  let score = 0;
  if (candidate.urlPart === slug) score += 10;
  if (typeof candidate.name === "string") score += 1;
  if (typeof candidate.id === "string") score += 1;
  if (Array.isArray(candidate.productItems)) score += 5;
  if (Array.isArray(candidate.options)) score += 3;
  if (Array.isArray(candidate.media)) score += 1;
  if (candidate.inventory && typeof candidate.inventory === "object") score += 1;
  return score;
}

function normalizeSchemaImages(imageValue) {
  const values = Array.isArray(imageValue) ? imageValue : imageValue ? [imageValue] : [];
  return values.flatMap((image) => {
    if (typeof image === "string") {
      return [
        {
          renditionUrl: image,
          canonicalUrl: canonicalizeWixMediaUrl(image),
          altIt: null,
          width: null,
          height: null,
          source: "json-ld",
        },
      ];
    }
    if (!image || typeof image !== "object") return [];
    const renditionUrl = cleanText(image.contentUrl ?? image.url);
    if (!renditionUrl) return [];
    return [
      {
        renditionUrl,
        canonicalUrl: canonicalizeWixMediaUrl(renditionUrl),
        altIt: cleanText(image.name ?? image.caption),
        width: positiveIntegerOrNull(image.width),
        height: positiveIntegerOrNull(image.height),
        source: "json-ld",
      },
    ];
  });
}

function normalizeOptions(rawOptions) {
  if (!Array.isArray(rawOptions)) return [];
  return rawOptions.flatMap((option) => {
    if (!option || typeof option !== "object") return [];
    const titleIt = cleanText(option.title);
    const key = cleanText(option.key) ?? titleIt;
    if (!key || !titleIt || !Array.isArray(option.selections)) return [];
    const values = option.selections.flatMap((selection) => {
      if (!selection || typeof selection !== "object") return [];
      const value = cleanText(selection.value ?? selection.description ?? selection.key);
      if (!value) return [];
      return [
        {
          sourceId: selection.id ?? null,
          value,
          descriptionIt: cleanText(selection.description) ?? value,
        },
      ];
    });
    return [{ sourceId: cleanText(option.id), key, titleIt, values }];
  });
}

function normalizeVariants(rawItems, options) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const price = numberOrNull(item.price);
    const selections = Array.isArray(item.optionsSelections)
      ? item.optionsSelections
      : [];
    const selectedOptions = {};
    for (const [optionIndex, option] of options.entries()) {
      const selectionId = selections[optionIndex];
      const selected = option.values.find(
        (candidate) => String(candidate.sourceId) === String(selectionId),
      );
      if (selected) selectedOptions[option.key] = selected.value;
    }
    const quantity = nonNegativeIntegerOrNull(item.inventory?.quantity);

    return [
      {
        sourceId: cleanText(item.id),
        sku: cleanText(item.sku),
        targetSku: null,
        targetSkuSource: null,
        options: selectedOptions,
        price:
          price === null
            ? null
            : {
                amountInCents: decimalToCents(price),
                currency: cleanText(item.currency)?.toUpperCase() ?? "EUR",
              },
        availability: normalizeAvailability(item.inventory?.status),
        stockQuantity: quantity,
        stockQuantityVerified: quantity !== null,
      },
    ];
  });
}

function resolveVariantSkus(variants, productSku) {
  return variants.map((variant) => {
    if (variant.sku) {
      return {
        ...variant,
        targetSku: variant.sku,
        targetSkuSource: "wix-variant-data",
      };
    }
    if (variants.length === 1 && productSku) {
      return {
        ...variant,
        targetSku: productSku,
        targetSkuSource: "product-sku",
      };
    }
    return variant;
  });
}

function inferCategory(slug, name) {
  const haystack = `${slug} ${cleanText(name) ?? ""}`.toLocaleLowerCase("it");
  const candidates = [
    ["rings", /\b(anell[oi]|ring)\b/],
    ["earrings", /\b(orecchin[oi]|earcuf+|earrings?)\b/],
    ["necklaces", /\b(collan[ae]|choker|necklaces?)\b/],
    ["bracelets", /\b(braccial[ei]|bracelets?)\b/],
  ];
  const match = candidates.find(([, pattern]) => pattern.test(haystack));
  return {
    value: match?.[0] ?? "accessories",
    basis: "slug-and-name-keyword",
    verified: false,
  };
}

function findObject(value, predicate) {
  let found = null;
  walkObjects(value, (candidate) => {
    if (!found && predicate(candidate)) found = candidate;
  });
  return found;
}

function walkObjects(value, visitor) {
  const stack = [value];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    visitor(current);
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        stack.push(current[index]);
      }
    } else {
      for (const child of Object.values(current)) stack.push(child);
    }
  }
}

function extractScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(
    (match) => ({ attributes: match[1], body: match[2].trim() }),
  );
}

function selectOffer(offers) {
  if (Array.isArray(offers)) return offers[0] ?? null;
  if (offers && typeof offers === "object") return offers;
  return null;
}

function schemaTypeIncludes(value, type) {
  if (Array.isArray(value)) return value.includes(type);
  return value === type;
}

function readXmlTag(block, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`<${escaped}>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

function decodeXmlEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function canonicalizeWixMediaUrl(value) {
  const match = value.match(/^(https:\/\/static\.wixstatic\.com\/media\/[^/]+)/i);
  return match?.[1] ?? value;
}

function dedupeImages(images) {
  const byCanonicalUrl = new Map();
  for (const image of images) {
    const current = byCanonicalUrl.get(image.canonicalUrl);
    if (!current) {
      byCanonicalUrl.set(image.canonicalUrl, image);
      continue;
    }
    byCanonicalUrl.set(image.canonicalUrl, {
      ...current,
      altIt: current.altIt ?? image.altIt,
      width: current.width ?? image.width,
      height: current.height ?? image.height,
    });
  }
  return [...byCanonicalUrl.values()];
}

function normalizeAvailability(value) {
  const normalized = cleanText(value)?.toLowerCase().replaceAll("_", "");
  if (!normalized) return "unknown";
  if (normalized.includes("outofstock")) return "out_of_stock";
  if (normalized.includes("instock")) return "in_stock";
  if (normalized.includes("preorder")) return "preorder";
  return "unknown";
}

function decimalToCents(value) {
  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new TypeError(`Invalid money value: ${value}`);
  return Math.round((number + Number.EPSILON) * 100);
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function positiveIntegerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function nonNegativeIntegerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function cleanText(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || null;
}

function stringOrNull(value) {
  return cleanText(value);
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function hasNumberedSlug(slug) {
  return /-\d+$/.test(slug);
}

function stripNumberedSlug(slug) {
  return slug.replace(/-\d+$/, "");
}

function normalizeName(value) {
  return (cleanText(value) ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function summarizeGroupMembers(members) {
  return members
    .map((product) => ({
      slug: product.slug,
      sourceUrl: product.sourceUrl,
      nameIt: product.nameIt,
      sku: product.sku,
      price: product.price,
    }))
    .toSorted((left, right) => left.slug.localeCompare(right.slug, "it"));
}

function sameMembers(summaries, products) {
  const left = summaries.map((item) => item.slug).toSorted();
  const right = products.map((item) => item.slug).toSorted();
  return left.length === right.length && left.every((slug, index) => slug === right[index]);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
