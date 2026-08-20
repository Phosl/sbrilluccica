import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { NewsletterOptInEmail } from "@/emails/newsletter-opt-in";

import { getResendClient } from "./client";
import { sendTransactionalEmail } from "./send";

type NewsletterTokenPayload = {
  email: string;
  expiresAt: number;
  locale: "it" | "en";
};

function signingSecret() {
  const value = process.env.NEWSLETTER_SIGNING_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createNewsletterToken(payload: NewsletterTokenPayload) {
  const secret = signingSecret();
  if (!secret) return null;
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyNewsletterToken(token: string): NewsletterTokenPayload | null {
  const secret = signingSecret();
  const [encodedPayload, providedSignature] = token.split(".");
  if (!secret || !encodedPayload || !providedSignature) return null;

  const expectedSignature = sign(encodedPayload, secret);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<NewsletterTokenPayload>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt < Date.now() ||
      (parsed.locale !== "it" && parsed.locale !== "en")
    ) {
      return null;
    }
    return parsed as NewsletterTokenPayload;
  } catch {
    return null;
  }
}

export async function requestNewsletterOptIn(
  email: string,
  locale: "it" | "en",
  origin: string,
) {
  const token = createNewsletterToken({
    email,
    locale,
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
  });

  if (!token) {
    return { mode: "mock" as const };
  }

  const confirmUrl = new URL("/api/newsletter/confirm", origin);
  confirmUrl.searchParams.set("token", token);

  return sendTransactionalEmail({
    to: email,
    subject:
      locale === "it"
        ? "Conferma la newsletter Sbrilluccica"
        : "Confirm your Sbrilluccica newsletter subscription",
    react: <NewsletterOptInEmail locale={locale} confirmUrl={confirmUrl.toString()} />,
    template: "newsletter-opt-in",
    idempotencyKey: `newsletter-opt-in-${sign(token, signingSecret()!)}`,
  });
}

export async function confirmNewsletterSubscription(payload: NewsletterTokenPayload) {
  const resend = getResendClient();
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();

  if (!resend || !segmentId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Newsletter non configurata.");
    }
    return { mode: "mock" as const };
  }

  const result = await resend.contacts.create({
    email: payload.email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
    properties: { locale: payload.locale },
  });

  if (result.error) throw new Error("Iscrizione newsletter non completata.");
  return { mode: "live" as const };
}
