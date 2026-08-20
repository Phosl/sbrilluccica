"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  const english = usePathname().startsWith("/en");
  const prefix = english ? "/en" : "";
  return (
    <main id="main-content" className="flex min-h-[70vh] items-center bg-ivory py-20 text-center">
      <Container className="max-w-4xl">
        <p className="font-serif text-[clamp(7rem,23vw,16rem)] leading-[0.7] tracking-[-0.08em] text-rose-soft">404</p>
        <h1 className="mt-10 font-serif text-5xl tracking-[-0.04em] sm:text-7xl">
          {english ? "This page slipped away." : "Questa pagina è scivolata via."}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
          {english ? "The jewellery is still here. Return to the collection and keep exploring." : "I gioielli sono ancora qui. Torna alla collezione e continua a esplorare."}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href={`${prefix}/`} className={buttonStyles({ size: "lg" })}>{english ? "Home" : "Home"}</Link>
          <Link href={`${prefix}/shop`} className={buttonStyles({ size: "lg", variant: "secondary" })}>{english ? "Shop" : "Vai allo shop"}</Link>
        </div>
      </Container>
    </main>
  );
}
