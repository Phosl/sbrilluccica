"use client";

import { useState, type FormEvent } from "react";
import { CircleUserRound, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/domain";
import { sendMagicLink, signInWithGoogle } from "@/lib/auth";

const copy = {
  it: {
    title: "Accedi al tuo account",
    intro: "Ritrova ordini, indirizzi e preferiti. Puoi acquistare anche come ospite.",
    email: "Email",
    magic: "Ricevi il link di accesso",
    google: "Continua con Google",
    demo: "Modalità demo: Supabase Auth non è ancora collegato e nessuna email verrà inviata.",
    sent: "Controlla la tua email per il link di accesso.",
  },
  en: {
    title: "Sign in to your account",
    intro: "Find orders, addresses and favourites. Guest checkout is always available.",
    email: "Email",
    magic: "Send me a sign-in link",
    google: "Continue with Google",
    demo: "Demo mode: Supabase Auth is not connected yet and no email will be sent.",
    sent: "Check your email for the sign-in link.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function AccountPanel({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const result = await sendMagicLink(email, locale);
    setMessage(result.ok ? (result.mode === "mock" ? text.demo : text.sent) : result.message);
    setBusy(false);
  }

  async function submitGoogle() {
    setBusy(true);
    const result = await signInWithGoogle(locale);
    setMessage(result.ok && result.mode === "mock" ? text.demo : result.ok ? "" : result.message);
    setBusy(false);
  }

  return (
    <div className="rounded-[2rem] border border-line bg-paper p-6 shadow-[0_24px_70px_rgba(72,45,43,0.08)] sm:p-10">
      <span className="grid size-12 place-items-center rounded-full bg-rose-soft text-rose-deep">
        <Sparkles aria-hidden="true" size={20} />
      </span>
      <h1 className="mt-7 font-serif text-5xl leading-[0.95] tracking-[-0.04em]">{text.title}</h1>
      <p className="mt-5 text-base leading-7 text-muted">{text.intro}</p>
      <form className="mt-8 grid gap-4" onSubmit={submitEmail}>
        <label className="grid gap-2 text-sm font-semibold">
          {text.email}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-12 rounded-2xl border border-line bg-white px-4 focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20"
          />
        </label>
        <Button type="submit" size="lg" disabled={busy} fullWidth>
          <Mail aria-hidden="true" size={17} /> {text.magic}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-4 text-xs uppercase tracking-[0.15em] text-muted">
        <span className="h-px flex-1 bg-line" /> {locale === "it" ? "oppure" : "or"} <span className="h-px flex-1 bg-line" />
      </div>
      <Button type="button" variant="secondary" size="lg" fullWidth disabled={busy} onClick={submitGoogle}>
        <CircleUserRound aria-hidden="true" size={17} /> {text.google}
      </Button>
      <p aria-live="polite" className="mt-5 text-sm leading-6 text-muted">
        {message}
      </p>
    </div>
  );
}
