"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[storefront]", { digest: error.digest });
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-[55vh] items-center bg-ivory py-16 text-center">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-6xl tracking-[-0.05em]">Qualcosa non ha brillato.</h1>
        <p className="mt-5 text-lg text-muted">Riprova: il carrello salvato sul dispositivo non andrà perso.</p>
        <Button className="mt-8" size="lg" onClick={reset}>Riprova</Button>
      </Container>
    </main>
  );
}
