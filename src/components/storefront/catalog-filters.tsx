"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import type { FilterGroup, StoreLocale } from "@/components/storefront/models";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

const copy = {
  en: {
    apply: "Show results",
    clear: "Clear all",
    close: "Close",
    filter: "Filter & sort",
    results: "items",
    title: "Filter & sort",
  },
  it: {
    apply: "Mostra risultati",
    clear: "Azzera tutto",
    close: "Chiudi",
    filter: "Filtra e ordina",
    results: "prodotti",
    title: "Filtra e ordina",
  },
} satisfies Record<StoreLocale, Record<string, string>>;

export function CatalogFilters({
  action,
  clearHref,
  groups,
  hiddenFields = {},
  locale,
  resultCount,
  selected = {},
  sortOptions = [],
  sortValue,
}: {
  action?: string;
  clearHref: string;
  groups: FilterGroup[];
  hiddenFields?: Record<string, string | string[]>;
  locale: StoreLocale;
  resultCount: number;
  selected?: Record<string, string[]>;
  sortOptions?: Array<{ label: string; value: string }>;
  sortValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const labels = copy[locale];

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-y border-[#dfc9c4] py-4">
        <p aria-live="polite" className="text-sm text-[#705e5b]">
          <strong className="font-semibold text-[#2b1e20]">{resultCount}</strong> {labels.results}
        </p>
        <Button
          aria-expanded={open}
          aria-haspopup="dialog"
          size="sm"
          variant="secondary"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal aria-hidden="true" size={16} />
          {labels.filter}
        </Button>
      </div>

      <Drawer
        closeLabel={labels.close}
        open={open}
        onClose={() => setOpen(false)}
        title={labels.title}
        description={`${resultCount} ${labels.results}`}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <a
              href={clearHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8b4255] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b4255] hover:bg-[#f6e7e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
            >
              {labels.clear}
            </a>
            <Button form="catalog-filters" type="submit" fullWidth>
              {labels.apply}
            </Button>
          </div>
        }
      >
        <form id="catalog-filters" action={action} method="get" className="px-5 py-3 sm:px-7">
          {Object.entries(hiddenFields).flatMap(([name, value]) =>
            (Array.isArray(value) ? value : [value]).map((entry) => (
              <input key={`${name}-${entry}`} type="hidden" name={name} value={entry} />
            )),
          )}
          {sortOptions.length > 0 ? (
            <div className="border-b border-[#dfc9c4] py-5">
              <label htmlFor="catalog-sort" className="text-xs font-bold uppercase tracking-[0.16em]">
                {locale === "it" ? "Ordina per" : "Sort by"}
              </label>
              <select
                id="catalog-sort"
                name="sort"
                defaultValue={sortValue ?? sortOptions[0]?.value}
                className="mt-3 min-h-12 w-full rounded-xl border border-[#cdb6b1] bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {groups.map((group, groupIndex) => (
            <details
              key={group.id}
              className="group border-b border-[#dfc9c4] py-1"
              open={groupIndex === 0 || Boolean(selected[group.id]?.length)}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-bold uppercase tracking-[0.14em] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] [&::-webkit-details-marker]:hidden">
                {group.label}
                <span aria-hidden="true" className="font-normal transition-transform group-open:rotate-45 motion-reduce:transition-none">＋</span>
              </summary>
              <fieldset className="space-y-1 pb-5">
                <legend className="sr-only">{group.label}</legend>
                {group.values.map((value) => (
                  <label
                    key={value.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-[#f6e7e5]"
                  >
                    <input
                      type="checkbox"
                      name={group.id}
                      value={value.id}
                      defaultChecked={selected[group.id]?.includes(value.id)}
                      className="size-4 rounded border-[#a98983] accent-[#8b4255] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255]"
                    />
                    <span className="flex-1 text-sm">{value.label}</span>
                    {typeof value.count === "number" ? (
                      <span className="text-xs text-[#8d7a76]">{value.count}</span>
                    ) : null}
                  </label>
                ))}
              </fieldset>
            </details>
          ))}
        </form>
      </Drawer>
    </>
  );
}
