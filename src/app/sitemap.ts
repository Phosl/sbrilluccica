import type { MetadataRoute } from "next";

import { getCatalogSitemapEntries } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/shop",
  "/our-story",
  "/contact",
  "/shipping-policy",
  "/refund-policy",
  "/terms-conditions",
  "/privacy-policy",
  "/accessibility-statement",
  "/e-gift-card",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date("2026-08-20T08:00:00.000Z");
  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) => {
    const italianPath = path;
    const englishPath = path === "/" ? "/en" : `/en${path}`;
    const languages = { "it-IT": absoluteUrl(italianPath), "en-GB": absoluteUrl(englishPath) };
    return [
      {
        url: absoluteUrl(italianPath),
        lastModified: now,
        changeFrequency: path === "/" || path === "/shop" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
        alternates: { languages },
      },
      {
        url: absoluteUrl(englishPath),
        lastModified: now,
        changeFrequency: path === "/" || path === "/shop" ? "weekly" : "monthly",
        priority: path === "/" ? 0.9 : path === "/shop" ? 0.8 : 0.5,
        alternates: { languages },
      },
    ];
  });

  const catalogEntries: MetadataRoute.Sitemap = (await getCatalogSitemapEntries()).map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(entry.lastModified),
    changeFrequency: "weekly",
    priority: entry.kind === "product" ? 0.8 : 0.7,
  }));

  return [...staticEntries, ...catalogEntries];
}
