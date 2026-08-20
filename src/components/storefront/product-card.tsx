import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatMoney, type Locale, type Product } from "@/lib/domain";

import { toMediaSource } from "@/components/storefront/models";
import { cn } from "@/components/ui/cn";
import { ResponsiveMedia } from "@/components/ui/media";

const copy = {
  en: { new: "New", sale: "Sale", soldOut: "Sold out" },
  it: { new: "Novità", sale: "In offerta", soldOut: "Esaurito" },
} satisfies Record<Locale, Record<string, string>>;

export function ProductCard({
  actionSlot,
  eager = false,
  href,
  locale,
  product,
}: {
  actionSlot?: ReactNode;
  eager?: boolean;
  href: string;
  locale: Locale;
  product: Product;
}) {
  const labels = copy[locale];
  const primaryImage = toMediaSource(product.media[0]);
  const hoverImage = toMediaSource(product.media[1]);
  const isOnSale =
    product.compareAtPrice !== null &&
    product.compareAtPrice.amountInCents > product.price.amountInCents;
  const badge =
    product.availability === "out_of_stock"
      ? labels.soldOut
      : isOnSale
        ? labels.sale
        : product.isNew
          ? labels.new
          : null;

  return (
    <article className="group relative min-w-0 [content-visibility:auto] [contain-intrinsic-size:auto_30rem]">
      <Link
        href={href}
        className="block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-4"
      >
        <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#eadbd5]">
          <ResponsiveMedia
            eager={eager}
            media={primaryImage}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
              hoverImage && "group-hover:opacity-0",
              "group-hover:scale-[1.025] motion-reduce:group-hover:scale-100",
            )}
          />
          {hoverImage ? (
            <ResponsiveMedia
              media={hoverImage}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
          {badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-[#fffaf4]/92 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#8b4255] backdrop-blur-sm sm:left-4 sm:top-4">
              {badge}
            </span>
          ) : null}
          <span className="absolute bottom-4 right-4 hidden size-11 place-items-center rounded-full bg-white text-[#8b4255] opacity-0 shadow-sm transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none sm:grid sm:translate-y-2">
            <ArrowUpRight aria-hidden="true" size={18} />
          </span>
        </div>
        <div className="px-1 pt-4">
          <h3 className="font-serif text-[1.35rem] leading-tight tracking-[-0.02em] text-[#2b1e20] sm:text-2xl">
            {product.name}
          </h3>
          {product.shortDescription ? (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#705e5b] sm:text-sm">
              {product.shortDescription}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-[#2b1e20]">
            <span>{formatMoney(product.price, locale)}</span>
            {isOnSale && product.compareAtPrice ? (
              <span className="text-xs font-normal text-[#8d7a76] line-through">
                {formatMoney(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      {actionSlot ? (
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">{actionSlot}</div>
      ) : null}
    </article>
  );
}
