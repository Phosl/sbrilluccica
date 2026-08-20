import {
  StripeWebhookError,
  handleStripeEvent,
  parseStripeWebhook,
} from "@/lib/integrations/stripe/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const parsed = parseStripeWebhook(
      rawBody,
      request.headers.get("stripe-signature"),
      request.headers.get("x-sbrilluccica-mock-webhook") === "1",
    );
    const result = await handleStripeEvent(parsed);

    return Response.json({ received: true, mode: parsed.mode, ...result });
  } catch (error) {
    if (error instanceof StripeWebhookError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("[stripe-webhook]", { code: "UNEXPECTED" });
    return Response.json({ error: "Webhook non elaborato." }, { status: 500 });
  }
}
