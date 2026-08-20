"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { formatMoney, type Locale } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

export function CheckoutPanel({ locale }: { locale: Locale }) {
  const { cart, hydrated } = useCommerce();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.items.length) return;
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const shippingZone = String(formData.get("shippingZone") ?? "IT");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          customerEmail: email || undefined,
          shippingZone,
          items: cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        }),
      });
      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !result.url) throw new Error(result.error);
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error && checkoutError.message
          ? checkoutError.message
          : locale === "it"
            ? "Il checkout non è disponibile. Riprova."
            : "Checkout is unavailable. Please try again.",
      );
      setBusy(false);
    }
  }

  if (!hydrated) {
    return <main id="main-content" className="min-h-[50vh] bg-ivory p-12 text-center text-muted">…</main>;
  }

  if (!cart.items.length) {
    return (
      <main id="main-content" className="min-h-[55vh] bg-ivory py-20">
        <Container className="max-w-3xl text-center">
          <h1 className="font-serif text-6xl tracking-[-0.05em]">
            {locale === "it" ? "Il carrello è vuoto" : "Your bag is empty"}
          </h1>
          <a href={localizedPath(locale, "/shop")} className={buttonStyles({ className: "mt-8", size: "lg" })}>
            {locale === "it" ? "Torna allo shop" : "Back to the shop"}
          </a>
        </Container>
      </main>
    );
  }

  return (
    <main id="main-content" className="flex-1 bg-ivory py-12 sm:py-20">
      <Container>
        <Eyebrow>{locale === "it" ? "Ultimo passaggio" : "Last step"}</Eyebrow>
        <h1 className="mt-4 font-serif text-6xl leading-none tracking-[-0.05em] sm:text-8xl">Checkout</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-16">
          <form onSubmit={startCheckout} className="rounded-[2rem] bg-paper p-6 sm:p-10">
            <div className="flex items-start gap-4 rounded-2xl bg-rose-soft/60 p-4 text-sm leading-6 text-muted">
              <LockKeyhole aria-hidden="true" className="mt-0.5 shrink-0 text-rose-deep" size={20} />
              <p>
                {locale === "it"
                  ? "Non inserire qui dati della carta. Verrai trasferito al checkout Stripe; in questa pre-produzione il flusso termina su una conferma demo."
                  : "Do not enter card details here. You will be sent to Stripe Checkout; in this pre-production build the flow ends on a demo confirmation."}
              </p>
            </div>
            <label className="mt-7 grid gap-2 text-sm font-semibold">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-12 rounded-2xl border border-line bg-white px-4 focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20"
              />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              {locale === "it" ? "Destinazione" : "Destination"}
              <select
                name="shippingZone"
                defaultValue="IT"
                required
                className="min-h-12 rounded-2xl border border-line bg-white px-4 focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20"
              >
                <option value="IT">Italia</option>
                <option value="EU">{locale === "it" ? "Unione Europea" : "European Union"}</option>
                <option value="GB">{locale === "it" ? "Regno Unito" : "United Kingdom"}</option>
                <option value="US">{locale === "it" ? "Stati Uniti" : "United States"}</option>
              </select>
            </label>
            <p className="mt-5 text-sm leading-6 text-muted">
              {locale === "it"
                ? "Stripe raccoglierà l’indirizzo completo e applicherà imposte e tariffa configurata per questa zona."
                : "Stripe will collect the full address and apply the tax and configured rate for this zone."}
            </p>
            <button type="submit" disabled={busy} className={buttonStyles({ className: "mt-8", fullWidth: true, size: "lg" })}>
              {busy ? (locale === "it" ? "Apertura…" : "Opening…") : locale === "it" ? "Continua al pagamento" : "Continue to payment"}
              <ArrowRight aria-hidden="true" size={17} />
            </button>
            <p role="alert" className="mt-4 text-sm text-rose-deep">{error}</p>
          </form>

          <aside className="rounded-[2rem] border border-line bg-paper p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-3xl">{locale === "it" ? "Riepilogo" : "Summary"}</h2>
            <ul className="mt-5 divide-y divide-line">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                  <span>{item.quantity} × {item.name}</span>
                  <strong>{formatMoney(item.lineTotal, locale)}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-5">
              <strong>{locale === "it" ? "Subtotale" : "Subtotal"}</strong>
              <span className="font-serif text-2xl">{formatMoney(cart.subtotal, locale)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              {locale === "it"
                ? "Spedizione e imposte vengono calcolate in base alla destinazione."
                : "Shipping and tax are calculated for the destination."}
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
