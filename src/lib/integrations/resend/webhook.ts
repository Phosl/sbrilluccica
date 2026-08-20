import "server-only";

import type { WebhookEventPayload } from "resend";
import { z } from "zod";

import {
  getResendClient,
  getResendWebhookSecret,
} from "./client";

const MockResendEventSchema = z.object({
  type: z.string().min(1).max(120),
  created_at: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

export type ParsedResendEvent = {
  event: WebhookEventPayload | z.infer<typeof MockResendEventSchema>;
  mode: "live" | "mock";
};

export class ResendWebhookError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ResendWebhookError";
    this.status = status;
  }
}

export function parseResendWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  allowMockRequest: boolean,
): ParsedResendEvent {
  const resend = getResendClient();
  const webhookSecret = getResendWebhookSecret();

  if (resend && webhookSecret) {
    if (!headers.id || !headers.timestamp || !headers.signature) {
      throw new ResendWebhookError("Firma Resend mancante.", 400);
    }

    try {
      return {
        event: resend.webhooks.verify({
          payload: rawBody,
          headers: {
            id: headers.id,
            timestamp: headers.timestamp,
            signature: headers.signature,
          },
          webhookSecret,
        }),
        mode: "live",
      };
    } catch {
      throw new ResendWebhookError("Firma Resend non valida.", 400);
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new ResendWebhookError("Webhook Resend non configurato.", 503);
  }

  if (!allowMockRequest) {
    throw new ResendWebhookError("Webhook mock non autorizzato.", 401);
  }

  try {
    return { event: MockResendEventSchema.parse(JSON.parse(rawBody)), mode: "mock" };
  } catch {
    throw new ResendWebhookError("Evento Resend mock non valido.", 400);
  }
}

const SUPPORTED_EVENTS = new Set([
  "email.delivered",
  "email.bounced",
  "email.complained",
  "email.suppressed",
  "email.failed",
]);

export async function handleResendEvent(parsed: ParsedResendEvent) {
  const handled = SUPPORTED_EVENTS.has(parsed.event.type);
  console.info("[resend-webhook]", {
    eventType: parsed.event.type,
    mode: parsed.mode,
    handled,
  });
  return { handled };
}
