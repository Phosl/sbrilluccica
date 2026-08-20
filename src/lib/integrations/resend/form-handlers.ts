import "server-only";

import { z } from "zod";

import {
  RequestValidationError,
  assertSameOrigin,
  getSafeRequestOrigin,
  readJsonBody,
} from "@/lib/integrations/http";
import { checkRateLimit } from "@/lib/integrations/rate-limit";

import { sendContactMessage } from "./contact";
import { requestNewsletterOptIn } from "./newsletter";

const ContactRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(["it", "en"]).default("it"),
  orderNumber: z.string().trim().max(80).optional(),
  website: z.string().max(200).optional(),
});

const NewsletterRequestSchema = z.object({
  email: z.email().max(254),
  locale: z.enum(["it", "en"]).default("it"),
  consent: z
    .union([z.literal(true), z.literal("true"), z.literal("on")])
    .transform(() => true),
  website: z.string().max(200).optional(),
});

function localeFrom(value: unknown): "it" | "en" {
  return typeof value === "object" &&
    value !== null &&
    "locale" in value &&
    value.locale === "en"
    ? "en"
    : "it";
}

const copy = {
  it: {
    invalidContact: "Controlla nome, email e messaggio.",
    invalidNewsletter: "Inserisci un’email valida e accetta il consenso.",
    limited: "Hai inviato troppe richieste. Riprova tra qualche minuto.",
    contactLive: "Grazie, il tuo messaggio è stato inviato.",
    contactMock: "Messaggio ricevuto in modalità demo. Collega Resend per inviarlo.",
    newsletterLive: "Controlla la posta e conferma la tua iscrizione.",
    newsletterMock:
      "Richiesta registrata in modalità demo. Collega Resend per inviare la conferma.",
    unavailable: "Servizio non disponibile in questo momento. Riprova più tardi.",
  },
  en: {
    invalidContact: "Check your name, email and message.",
    invalidNewsletter: "Enter a valid email and accept the consent notice.",
    limited: "You sent too many requests. Try again in a few minutes.",
    contactLive: "Thank you, your message has been sent.",
    contactMock: "Message received in demo mode. Connect Resend to deliver it.",
    newsletterLive: "Check your inbox and confirm your subscription.",
    newsletterMock:
      "Request recorded in demo mode. Connect Resend to send confirmation.",
    unavailable: "The service is unavailable right now. Please try again later.",
  },
};

function json(ok: boolean, message: string, status: number, retryAfter?: number) {
  const headers = retryAfter ? { "Retry-After": String(retryAfter) } : undefined;
  return Response.json({ ok, message }, { status, headers });
}

export async function handleContactForm(request: Request) {
  let locale: "it" | "en" = "it";

  try {
    assertSameOrigin(request);
    const raw = await readJsonBody(request);
    locale = localeFrom(raw);
    const parsed = ContactRequestSchema.safeParse(raw);
    if (!parsed.success) return json(false, copy[locale].invalidContact, 422);

    if (parsed.data.website) return json(true, copy[locale].contactLive, 202);

    const limit = checkRateLimit(request, "contact", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return json(false, copy[locale].limited, 429, limit.retryAfterSeconds);
    }

    const result = await sendContactMessage(parsed.data);
    return json(
      true,
      result.mode === "live" ? copy[locale].contactLive : copy[locale].contactMock,
      202,
    );
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return json(false, error.message, error.status);
    }
    console.error("[contact]", { code: "SEND_FAILED" });
    return json(false, copy[locale].unavailable, 503);
  }
}

export async function handleNewsletterForm(request: Request) {
  let locale: "it" | "en" = "it";

  try {
    assertSameOrigin(request);
    const raw = await readJsonBody(request);
    locale = localeFrom(raw);
    const parsed = NewsletterRequestSchema.safeParse(raw);
    if (!parsed.success) return json(false, copy[locale].invalidNewsletter, 422);

    if (parsed.data.website) return json(true, copy[locale].newsletterLive, 202);

    const limit = checkRateLimit(request, "newsletter", {
      limit: 4,
      windowMs: 30 * 60 * 1000,
    });
    if (!limit.allowed) {
      return json(false, copy[locale].limited, 429, limit.retryAfterSeconds);
    }

    const result = await requestNewsletterOptIn(
      parsed.data.email,
      parsed.data.locale,
      getSafeRequestOrigin(request),
    );
    return json(
      true,
      result.mode === "live"
        ? copy[locale].newsletterLive
        : copy[locale].newsletterMock,
      202,
    );
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return json(false, error.message, error.status);
    }
    console.error("[newsletter]", { code: "SUBSCRIBE_FAILED" });
    return json(false, copy[locale].unavailable, 503);
  }
}
