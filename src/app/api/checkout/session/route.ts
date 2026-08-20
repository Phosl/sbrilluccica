import { randomUUID } from "node:crypto";

import { ZodError } from "zod";

import {
  CheckoutAdapterError,
  CheckoutRequestSchema,
  createCheckoutSession,
} from "@/lib/integrations/stripe/checkout";
import {
  assertSameOrigin,
  getSafeRequestOrigin,
  publicErrorResponse,
  readJsonBody,
} from "@/lib/integrations/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    assertSameOrigin(request);
    const input = CheckoutRequestSchema.parse(await readJsonBody(request));
    const session = await createCheckoutSession(
      input,
      getSafeRequestOrigin(request),
    );

    return Response.json(session, {
      headers: { "Cache-Control": "no-store", "X-Request-Id": requestId },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Controlla gli articoli nel carrello e riprova." },
        { status: 422, headers: { "X-Request-Id": requestId } },
      );
    }

    if (error instanceof CheckoutAdapterError) {
      console.warn("[checkout]", { requestId, code: error.code });
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "X-Request-Id": requestId } },
      );
    }

    console.error("[checkout]", { requestId, code: "UNEXPECTED" });
    const response = publicErrorResponse(error);
    response.headers.set("X-Request-Id", requestId);
    return response;
  }
}
