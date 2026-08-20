"use client";

import { useEffect } from "react";
import { Check, Sparkles } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

export function CheckoutSuccess({
  demo,
  locale,
  sessionId,
}: {
  demo: boolean;
  locale: Locale;
  sessionId?: string;
}) {
  const { clearCart, hydrated } = useCommerce();

  useEffect(() => {
    if (!hydrated) return;
    clearCart();
  }, [clearCart, hydrated, sessionId]);

  return (
    <main id="main-content" className="flex min-h-[65vh] items-center bg-ivory py-16">
      <Container className="max-w-3xl text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-rose-soft text-rose-deep">
          {demo ? <Sparkles aria-hidden="true" size={32} /> : <Check aria-hidden="true" size={34} />}
        </span>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">
          {demo ? (locale === "it" ? "Conferma dimostrativa" : "Demo confirmation") : locale === "it" ? "Ordine ricevuto" : "Order received"}
        </p>
        <h1 className="mt-4 font-serif text-6xl leading-[0.92] tracking-[-0.05em] sm:text-8xl">
          {demo
            ? locale === "it"
              ? "Il flusso funziona. Nessun pagamento è stato eseguito."
              : "The flow works. No payment was taken."
            : locale === "it"
              ? "Grazie, stiamo verificando il pagamento."
              : "Thank you, we are confirming your payment."}
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted">
          {demo
            ? locale === "it"
              ? "Questa modalità prova carrello, sessione e ritorno dal checkout senza creare un ordine reale. Collegando Stripe e Supabase, la conferma definitiva arriverà dal webhook firmato."
              : "This mode tests the bag, session and checkout return without creating a real order. Once Stripe and Supabase are connected, final confirmation will come from the signed webhook."
            : locale === "it"
              ? "Riceverai un’email quando il webhook Stripe avrà registrato l’ordine. La pagina di ritorno non viene usata come prova di pagamento."
              : "You will receive an email once the Stripe webhook has recorded the order. This return page is not treated as payment proof."}
        </p>
        {sessionId ? <p className="mt-5 break-all font-mono text-xs text-muted">{sessionId}</p> : null}
        <a href={localizedPath(locale, "/shop")} className={buttonStyles({ className: "mt-9", size: "lg" })}>
          {locale === "it" ? "Continua a esplorare" : "Keep exploring"}
        </a>
      </Container>
    </main>
  );
}
