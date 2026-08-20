#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildStagingCatalog,
  fetchText,
  mapConcurrent,
  parseProductPage,
  parseProductSitemap,
  readTextInput,
} from "./lib.mjs";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SITEMAP =
  "https://www.sbrilluccica.com/store-products-sitemap.xml";
const DEFAULT_OUTPUT = resolve(SCRIPT_DIRECTORY, "staging/wix-catalog.json");
const DEFAULT_CACHE = resolve(SCRIPT_DIRECTORY, "staging/cache");

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(helpText());
    return;
  }

  const sitemapInput = args.sitemapFile ?? args.sitemapUrl;
  const sitemapXml = await readTextInput(sitemapInput, {
    timeoutMs: args.timeoutMs,
    retries: args.retries,
  });
  const allEntries = parseProductSitemap(sitemapXml);
  const selectedEntries = args.slugs.length
    ? allEntries.filter((entry) => args.slugs.includes(entry.slug))
    : allEntries;
  const missingSlugs = args.slugs.filter(
    (slug) => !selectedEntries.some((entry) => entry.slug === slug),
  );
  if (missingSlugs.length) {
    throw new Error(`Slug not found in sitemap: ${missingSlugs.join(", ")}`);
  }
  const entries = args.limit ? selectedEntries.slice(0, args.limit) : selectedEntries;
  const products = [];
  const failures = [];

  await mkdir(args.cacheDir, { recursive: true });
  const results = await mapConcurrent(entries, args.concurrency, async (entry, index) => {
    try {
      const html = await readOrFetchProductPage(entry, args);
      const product = parseProductPage(html, entry);
      process.stderr.write(
        `[${String(index + 1).padStart(String(entries.length).length, "0")}/${entries.length}] ${entry.slug}\n`,
      );
      return { product };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[errore] ${entry.slug}: ${message}\n`);
      return {
        failure: {
          slug: entry.slug,
          sourceUrl: entry.sourceUrl,
          message,
        },
      };
    }
  });

  for (const result of results) {
    if (result.product) products.push(result.product);
    if (result.failure) failures.push(result.failure);
  }

  const catalog = buildStagingCatalog({
    sitemapUrl: args.sitemapUrl,
    entries,
    products,
    failures,
  });
  await mkdir(dirname(args.output), { recursive: true });
  await writeFile(args.output, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  process.stdout.write(
    [
      `Catalogo staging: ${args.output}`,
      `Prodotti: ${catalog.stats.importedProducts}/${catalog.stats.sitemapEntries}`,
      `Errori: ${catalog.stats.failures}`,
      `Gruppi candidati variante: ${catalog.stats.variantCandidateGroups}`,
      `Collisioni slug destinazione: ${catalog.stats.slugCollisionGroups}`,
      `Conflitti SKU: ${catalog.stats.skuConflictGroups}`,
      `SKU variante da completare: ${catalog.stats.variantSkuGaps}`,
      "Nessun gruppo è stato unito automaticamente.",
    ].join("\n") + "\n",
  );

  if (failures.length > args.maxFailures) process.exitCode = 1;
}

async function readOrFetchProductPage(entry, args) {
  const cacheVersion = entry.lastModified ?? "unknown-date";
  const cachePath = resolve(
    args.cacheDir,
    `${encodeURIComponent(entry.slug)}--${cacheVersion}.html`,
  );
  if (!args.refresh) {
    try {
      return await readFile(cachePath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  const html = await fetchText(entry.sourceUrl, {
    timeoutMs: args.timeoutMs,
    retries: args.retries,
  });
  await writeFile(cachePath, html, "utf8");
  return html;
}

function parseArguments(argv) {
  const values = {
    sitemapUrl: DEFAULT_SITEMAP,
    sitemapFile: null,
    output: DEFAULT_OUTPUT,
    cacheDir: DEFAULT_CACHE,
    concurrency: 6,
    timeoutMs: 30_000,
    retries: 2,
    maxFailures: 0,
    limit: null,
    slugs: [],
    refresh: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") values.help = true;
    else if (argument === "--refresh") values.refresh = true;
    else if (argument === "--sitemap-url") values.sitemapUrl = requireValue(argv, ++index, argument);
    else if (argument === "--sitemap-file") values.sitemapFile = resolve(requireValue(argv, ++index, argument));
    else if (argument === "--output") values.output = resolve(requireValue(argv, ++index, argument));
    else if (argument === "--cache-dir") values.cacheDir = resolve(requireValue(argv, ++index, argument));
    else if (argument === "--concurrency") values.concurrency = positiveInteger(requireValue(argv, ++index, argument), argument);
    else if (argument === "--timeout-ms") values.timeoutMs = positiveInteger(requireValue(argv, ++index, argument), argument);
    else if (argument === "--retries") values.retries = nonNegativeInteger(requireValue(argv, ++index, argument), argument);
    else if (argument === "--max-failures") values.maxFailures = nonNegativeInteger(requireValue(argv, ++index, argument), argument);
    else if (argument === "--limit") values.limit = positiveInteger(requireValue(argv, ++index, argument), argument);
    else if (argument === "--slug") values.slugs.push(requireValue(argv, ++index, argument));
    else throw new Error(`Unknown argument: ${argument}`);
  }

  return values;
}

function requireValue(argv, index, argument) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
  return value;
}

function positiveInteger(value, argument) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${argument} must be a positive integer`);
  }
  return number;
}

function nonNegativeInteger(value, argument) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${argument} must be a non-negative integer`);
  }
  return number;
}

function helpText() {
  return `Importa il catalogo pubblico Wix in un JSON di staging verificabile.\n\nUso:\n  node scripts/import-wix-catalog/index.mjs [opzioni]\n\nOpzioni:\n  --sitemap-url URL      Sitemap ufficiale (default: ${DEFAULT_SITEMAP})\n  --sitemap-file FILE    Usa un sitemap locale, utile per verifiche offline\n  --output FILE          JSON di staging (default: ${DEFAULT_OUTPUT})\n  --cache-dir DIR        Cache HTML ignorata da Git (default: ${DEFAULT_CACHE})\n  --concurrency N        Richieste contemporanee (default: 6)\n  --timeout-ms N         Timeout per richiesta (default: 30000)\n  --retries N            Tentativi aggiuntivi (default: 2)\n  --max-failures N       Errori tollerati prima di uscire con codice 1 (default: 0)\n  --limit N              Importa solo i primi N slug ordinati (smoke test)\n  --slug SLUG            Importa uno slug preciso; ripetibile\n  --refresh              Ignora la cache delle pagine\n  --help                 Mostra questo aiuto\n`;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
  process.exitCode = 1;
});
