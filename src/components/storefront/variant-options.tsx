import { formatMoney, type Locale, type ProductVariant } from "@/lib/domain";

export function VariantOptions({
  busy = false,
  defaultSelectedId,
  label,
  locale,
  onSelect,
  selectedId,
  selectPrompt,
  variants,
}: {
  busy?: boolean;
  defaultSelectedId?: string;
  label: string;
  locale: Locale;
  onSelect?: (variantId: string) => void;
  selectedId?: string;
  selectPrompt: string;
  variants: ProductVariant[];
}) {
  if (variants.length === 1) {
    return <input type="hidden" name="variantId" value={variants[0].id} />;
  }

  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-baseline justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em]">
        {label}
        <span className="font-normal normal-case tracking-normal text-[#705e5b]">{selectPrompt}</span>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => {
          const available = variant.availability !== "out_of_stock";
          const controlledProps = onSelect
            ? {
                checked: selectedId === variant.id,
                onChange: () => onSelect(variant.id),
              }
            : {
                defaultChecked: defaultSelectedId === variant.id,
              };

          return (
            <label key={variant.id} className={available ? "cursor-pointer" : "cursor-not-allowed"}>
              <input
                type="radio"
                name="variantId"
                value={variant.id}
                disabled={!available || busy}
                required
                className="peer sr-only"
                {...controlledProps}
              />
              <span className="flex min-h-14 flex-col items-center justify-center rounded-xl border border-[#cdb6b1] bg-white px-3 py-2 text-center text-sm transition-colors peer-checked:border-[#8b4255] peer-checked:bg-[#f6e7e5] peer-disabled:opacity-40 peer-focus-visible:ring-2 peer-focus-visible:ring-[#8b4255] peer-focus-visible:ring-offset-2 motion-reduce:transition-none">
                <span className="font-semibold">{variant.name}</span>
                <span className="mt-0.5 text-xs text-[#705e5b]">{formatMoney(variant.price, locale)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
