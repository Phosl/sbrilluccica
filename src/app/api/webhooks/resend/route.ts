import {
  ResendWebhookError,
  handleResendEvent,
  parseResendWebhook,
} from "@/lib/integrations/resend/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const parsed = parseResendWebhook(
      rawBody,
      {
        id: request.headers.get("svix-id"),
        timestamp: request.headers.get("svix-timestamp"),
        signature: request.headers.get("svix-signature"),
      },
      request.headers.get("x-sbrilluccica-mock-webhook") === "1",
    );
    const result = await handleResendEvent(parsed);
    return Response.json({ received: true, mode: parsed.mode, ...result });
  } catch (error) {
    if (error instanceof ResendWebhookError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("[resend-webhook]", { code: "UNEXPECTED" });
    return Response.json({ error: "Webhook non elaborato." }, { status: 500 });
  }
}
