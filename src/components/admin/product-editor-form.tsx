"use client";

import { useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";

import type { AdminProductDraft } from "./contracts";
import { mockProductDraft } from "./mock-data";

type ProductEditorFormProps = {
  categories?: string[];
  initialValue?: AdminProductDraft;
  onSave?: (value: AdminProductDraft) => Promise<void> | void;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-[#dfd0d4] bg-white px-3.5 text-sm text-[#30252a] outline-none transition placeholder:text-[#ad9aa1] focus:border-[#a72d60] focus:ring-2 focus:ring-[#a72d60]/15";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductEditorForm({
  categories = ["Anelli", "Orecchini", "Collane", "Bracciali", "Accessori"],
  initialValue = mockProductDraft,
  onSave,
}: ProductEditorFormProps) {
  const [draft, setDraft] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    await onSave?.(draft);
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <form className="rounded-[24px] border border-[#eadfe1] bg-white p-5 shadow-[0_18px_50px_rgba(91,41,60,0.05)] sm:p-7" onSubmit={submit}>
      <div className="flex flex-col gap-3 border-b border-[#eee2e3] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a72d60]">Catalogo · demo locale</p>
          <h2 className="mt-2 font-serif text-2xl text-[#30252a]">Dettagli prodotto</h2>
          <p className="mt-1 text-sm text-[#806e75]">Il salvataggio resta nel browser finché Supabase non è collegato.</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#a72d60] px-4 text-sm font-semibold text-white transition hover:bg-[#8f244f] disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a72d60]"
          disabled={status === "saving"}
          type="submit"
        >
          {status === "saving" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : status === "saved" ? <Check aria-hidden="true" className="size-4" /> : <Save aria-hidden="true" className="size-4" />}
          {status === "saving" ? "Salvataggio…" : status === "saved" ? "Salvato in demo" : "Salva bozza"}
        </button>
      </div>

      <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#493a40]">
          Nome prodotto
          <input
            className={inputClass}
            maxLength={120}
            onChange={(event) => {
              const name = event.target.value;
              setDraft((current) => ({ ...current, name, slug: slugify(name) }));
            }}
            required
            value={draft.name}
          />
        </label>
        <label className="text-sm font-semibold text-[#493a40]">
          Slug
          <input
            className={inputClass}
            maxLength={140}
            onChange={(event) => setDraft((current) => ({ ...current, slug: slugify(event.target.value) }))}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            value={draft.slug}
          />
        </label>
        <label className="text-sm font-semibold text-[#493a40]">
          SKU
          <input
            className={inputClass}
            maxLength={60}
            onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
            required
            value={draft.sku}
          />
        </label>
        <label className="text-sm font-semibold text-[#493a40]">
          Categoria
          <select className={inputClass} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} value={draft.category}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-[#493a40]">
          Prezzo in euro
          <input
            className={inputClass}
            min="0"
            onChange={(event) => setDraft((current) => ({ ...current, unitAmount: Math.round(Number(event.target.value) * 100) }))}
            required
            step="0.01"
            type="number"
            value={(draft.unitAmount / 100).toFixed(2)}
          />
        </label>
        <label className="text-sm font-semibold text-[#493a40]">
          Quantità disponibile
          <input
            className={inputClass}
            min="0"
            onChange={(event) => setDraft((current) => ({ ...current, stockQuantity: Number.parseInt(event.target.value || "0", 10) }))}
            required
            step="1"
            type="number"
            value={draft.stockQuantity}
          />
        </label>
        <label className="text-sm font-semibold text-[#493a40] sm:col-span-2">
          Descrizione
          <textarea
            className={`${inputClass} min-h-32 resize-y py-3`}
            maxLength={1200}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            required
            value={draft.description}
          />
        </label>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#fcf7f6] p-4">
        <input
          checked={draft.published}
          className="mt-0.5 size-4 accent-[#a72d60]"
          onChange={(event) => setDraft((current) => ({ ...current, published: event.target.checked }))}
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-semibold text-[#493a40]">Visibile nel negozio</span>
          <span className="mt-1 block text-xs leading-5 text-[#806e75]">In modalità reale, la pubblicazione richiederà dati, immagini e disponibilità validi lato server.</span>
        </span>
      </label>

      <p aria-live="polite" className="sr-only">
        {status === "saving" ? "Salvataggio in corso" : status === "saved" ? "Bozza salvata in modalità demo" : ""}
      </p>
    </form>
  );
}

export default ProductEditorForm;
