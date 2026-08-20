"use client";

import { useState } from "react";

import { Newsletter } from "@/components/storefront/newsletter";
import type { Locale } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

const copy = {
  it: {
    title: "Novità, ispirazioni e piccoli inviti.",
    body: "Iscriviti per scoprire in anteprima nuovi gioielli e collezioni.",
    consent: "Voglio ricevere la newsletter e ho letto la privacy policy.",
  },
  en: {
    title: "New pieces, inspiration and invitations.",
    body: "Sign up for an early look at new jewellery and collections.",
    consent: "I want to receive the newsletter and have read the privacy policy.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function NewsletterSignup({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<{ message: string; type: "error" | "success" }>();

  async function subscribe(formData: FormData) {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        consent: formData.get("consent") === "on",
        website: formData.get("website") ?? "",
        locale,
      }),
    });
    const result = (await response.json()) as { message?: string; ok?: boolean };
    setStatus({
      message:
        result.message ??
        (locale === "it" ? "Non siamo riusciti a completare l’iscrizione." : "We could not complete the sign-up."),
      type: response.ok && result.ok ? "success" : "error",
    });
  }

  return (
    <Newsletter
      action={subscribe}
      body={copy[locale].body}
      consentLabel={
        <>
          {copy[locale].consent}{" "}
          <a className="underline underline-offset-2" href={localizedPath(locale, "/privacy-policy")}>
            {locale === "it" ? "Leggi l’informativa" : "Read the notice"}
          </a>
        </>
      }
      locale={locale}
      status={status}
      title={copy[locale].title}
    />
  );
}
