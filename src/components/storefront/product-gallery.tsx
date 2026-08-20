"use client";

import { useState } from "react";

import type { Locale, ProductMedia } from "@/lib/domain";

import { toMediaSource } from "@/components/storefront/models";
import { cn } from "@/components/ui/cn";
import { ResponsiveMedia } from "@/components/ui/media";

export function ProductGallery({
  images,
  locale,
  productName,
}: {
  images: ProductMedia[];
  locale: Locale;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = toMediaSource(images[selectedIndex] ?? images[0]);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#eadbd5] lg:aspect-[5/6]">
        <ResponsiveMedia
          eager
          media={selected}
          sizes="(min-width: 1024px) 56vw, 100vw"
        />
      </div>
      {images.length > 1 ? (
        <div
          aria-label={`${productName} — ${locale === "it" ? "galleria" : "gallery"}`}
          className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 sm:mt-4 sm:grid sm:grid-cols-5 sm:overflow-visible"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`${productName}, ${index + 1} / ${images.length}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-[#eadbd5] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-2",
                selectedIndex === index ? "border-[#8b4255]" : "border-transparent opacity-75 hover:opacity-100",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <ResponsiveMedia
                media={toMediaSource(image)}
                sizes="(min-width: 640px) 10vw, 5rem"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
