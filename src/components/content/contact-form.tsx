"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/domain";

const labels = {
  it: {
    name: "Nome",
    email: "Email",
    order: "Numero d’ordine (facoltativo)",
    message: "Come possiamo aiutarti?",
    submit: "Invia il messaggio",
    sending: "Invio…",
    error: "Non siamo riusciti a inviare il messaggio. Riprova o scrivici via email.",
  },
  en: {
    name: "Name",
    email: "Email",
    order: "Order number (optional)",
    message: "How can we help?",
    submit: "Send message",
    sending: "Sending…",
    error: "We could not send the message. Try again or email us directly.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const result = (await response.json()) as { message?: string; ok?: boolean };

      if (!response.ok || !result.ok) throw new Error(result.message);
      setMessage(result.message ?? "OK");
      setState("success");
      form.reset();
    } catch {
      setMessage(copy.error);
      setState("error");
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-muted/60 focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div aria-hidden="true" className="absolute -left-[10000px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        {copy.name}
        <input className={inputClass} name="name" autoComplete="name" required minLength={2} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {copy.email}
        <input className={inputClass} name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {copy.order}
        <input className={inputClass} name="orderNumber" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        {copy.message}
        <textarea className={`${inputClass} min-h-36 resize-y`} name="message" required minLength={10} />
      </label>
      <Button type="submit" size="lg" disabled={state === "sending"}>
        {state === "sending" ? copy.sending : copy.submit}
      </Button>
      <p
        aria-live="polite"
        className={state === "error" ? "text-sm text-rose-deep" : "text-sm text-muted"}
      >
        {message}
      </p>
    </form>
  );
}
