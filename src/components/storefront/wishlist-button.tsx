"use client";

import { Heart } from "lucide-react";

import type { Locale } from "@/lib/domain";

import { cn } from "@/components/ui/cn";

export function WishlistButton({
  active,
  locale,
  onToggle,
  productName,
  size = "md",
}: {
  active: boolean;
  locale: Locale;
  onToggle: () => void;
  productName: string;
  size?: "md" | "lg";
}) {
  const action = active
    ? locale === "it"
      ? "Rimuovi dai preferiti"
      : "Remove from wishlist"
    : locale === "it"
      ? "Aggiungi ai preferiti"
      : "Add to wishlist";

  return (
    <button
      type="button"
      aria-label={`${action}: ${productName}`}
      aria-pressed={active}
      className={cn(
        "grid place-items-center rounded-full border border-white/80 bg-[#fffaf4]/92 text-[#8b4255] shadow-sm backdrop-blur-sm transition-[color,background-color,transform] hover:scale-105 hover:bg-white motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-2",
        size === "lg" ? "size-12" : "size-10",
      )}
      onClick={(event) => {
        event.preventDefault();
        onToggle();
      }}
    >
      <Heart
        aria-hidden="true"
        className={active ? "fill-current" : undefined}
        size={size === "lg" ? 20 : 17}
        strokeWidth={1.7}
      />
    </button>
  );
}
