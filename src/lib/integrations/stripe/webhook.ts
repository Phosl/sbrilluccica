import "server-only";

import type Stripe from "stripe";
import { z } from "zod";

import { getStripeClient, getStripeWebhookSecret } from "./client";

const MockStripeEventSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(120),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

export type ParsedStripeEvent = {
  event: Stripe.Event | z.infer<typeof MockStripeEventSchema>;
  mode: "live" | "mock";
};

export class StripeWebhookError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StripeWebhookError";
    this.status = status;
  }
}

export function parseStripeWebhook(
  rawBody: string,
  signature: string | null,
  allowMockRequest: boolean,
): ParsedStripeEvent {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (stripe && webhookSecret) {
    if (!signature) {
      throw new StripeWebhookError("Firma Stripe mancante.", 400);
    }

    try {
      return {
        event: stripe.webhooks.constructEvent(rawBody, signature, webhookSecret),
        mode: "live",
      };
    } catch {
      throw new StripeWebhookError("Firma Stripe non valida.", 400);
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new StripeWebhookError("Webhook Stripe non configurato.", 503);
  }

  if (!allowMockRequest) {
    throw new StripeWebhookError("Webhook mock non autorizzato.", 401);
  }

  try {
    return { event: MockStripeEventSchema.parse(JSON.parse(rawBody)), mode: "mock" };
  } catch {
    throw new StripeWebhookError("Evento Stripe mock non valido.", 400);
  }
}

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
]);

export async function handleStripeEvent(parsed: ParsedStripeEvent) {
  const handled = SUPPORTED_EVENTS.has(parsed.event.type);

  // Persistence is intentionally deferred to the Supabase order service. The
  // handler never fulfils an order from the success page or fabricates a write.
  console.info("[stripe-webhook]", {
    eventId: parsed.event.id,
    eventType: parsed.event.type,
    mode: parsed.mode,
    handled,
  });

  return { handled };
}
