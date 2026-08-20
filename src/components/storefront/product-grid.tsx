import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale, Product } from "@/lib/domain";

import { ProductCard } from "@/components/storefront/product-card";
import { buttonStyles } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import { StatusPanel } from "@/components/ui/status";

export function ProductGrid({
  action,
  actionForProduct,
  emptyMessage,
  eyebrow,
  hrefForProduct,
  locale,
  products,
  title,
}: {
  action?: { href: string; label: string };
  actionForProduct?: (product: Product) => ReactNode;
  emptyMessage?: { body: string; title: string };
  eyebrow?: string;
  hrefForProduct: (product: Product) => string;
  locale: Locale;
  products: Product[];
  title?: string;
}) {
  return (
    <section className="bg-[#fffaf4] py-16 sm:py-20 lg:py-28">
      <Container>
        {title ? (
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow={eyebrow}>{title}</SectionHeading>
            {action ? (
              <Link
                href={action.href}
                className={buttonStyles({ className: "hidden sm:inline-flex", variant: "secondary" })}
              >
                {action.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className={title ? "mt-9" : undefined}>
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  actionSlot={actionForProduct?.(product)}
                  eager={index < 4}
                  href={hrefForProduct(product)}
                  locale={locale}
                  product={product}
                />
              ))}
            </div>
            {action ? (
              <div className="mt-10 text-center sm:hidden">
                <Link href={action.href} className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
                  {action.label}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <StatusPanel
            className={title ? "mt-9" : undefined}
            body={emptyMessage?.body ?? (locale === "it" ? "Prova a modificare i filtri selezionati." : "Try changing the selected filters.")}
            title={emptyMessage?.title ?? (locale === "it" ? "Nessun gioiello trovato" : "No jewellery found")}
          />
        )}
      </Container>
    </section>
  );
}
