import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { getStripeClient } from "./client";

const StripePriceMapSchema = z.record(
  z.string().min(1).max(120),
  z.string().regex(/^price_[A-Za-z0-9]+$/),
);

const ShippingZoneSchema = z.enum(["IT", "EU", "GB", "US"]);
const StripeShippingRateMapSchema = z.object({
  IT: z.string().regex(/^shr_[A-Za-z0-9]+$/),
  EU: z.string().regex(/^shr_[A-Za-z0-9]+$/),
  GB: z.string().regex(/^shr_[A-Za-z0-9]+$/),
  US: z.string().regex(/^shr_[A-Za-z0-9]+$/),
});

const shippingCountries = {
  IT: ["IT"],
  EU: [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
  ],
  GB: ["GB"],
  US: ["US"],
} as const;

export const CheckoutRequestSchema = z.object({
  locale: z.enum(["it", "en"]).default("it"),
  customerEmail: z.email().max(254).optional(),
  shippingZone: ShippingZoneSchema,
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(1).max(120),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(25),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export type CheckoutSessionResult = {
  id: string;
  mode: "live" | "mock";
  url: string;
};

export class CheckoutAdapterError extends Error {
  readonly code: "invalid_catalog" | "misconfigured" | "provider_error";
  readonly status: number;

  constructor(
    code: CheckoutAdapterError["code"],
    message: string,
    status = 500,
  ) {
    super(message);
    this.name = "CheckoutAdapterError";
    this.code = code;
    this.status = status;
  }
}

function getStripePriceMap() {
  const raw = process.env.STRIPE_PRICE_MAP?.trim();
  if (!raw) return null;

  try {
    const result = StripePriceMapSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function getStripeShippingRateMap() {
  const raw = process.env.STRIPE_SHIPPING_RATE_MAP?.trim();
  if (!raw) return null;

  try {
    const result = StripeShippingRateMapSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function localizedPath(locale: "it" | "en", path: string) {
  return locale === "en" ? `/en${path}` : path;
}

function createMockSession(input: CheckoutRequest, requestOrigin: string) {
  const id = `mock_checkout_${randomUUID()}`;
  const url = new URL(
    localizedPath(input.locale, "/checkout/success"),
    requestOrigin,
  );
  url.searchParams.set("session_id", id);
  url.searchParams.set("demo", "1");

  return { id, mode: "mock", url: url.toString() } satisfies CheckoutSessionResult;
}

export async function createCheckoutSession(
  input: CheckoutRequest,
  requestOrigin: string,
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const priceMap = getStripePriceMap();
  const shippingRateMap = getStripeShippingRateMap();

  // The demo never accepts or stores money. Live mode is enabled only when both
  // the provider secret and a server-owned variant -> Stripe Price map exist.
  if (!stripe && !priceMap && !shippingRateMap) {
    return createMockSession(input, requestOrigin);
  }

  if (!stripe || !priceMap || !shippingRateMap) {
    throw new CheckoutAdapterError(
      "misconfigured",
      "Stripe è configurato solo in parte. Verifica chiave, prezzi e tariffe di spedizione.",
      503,
    );
  }

  const lineItems = input.items.map(({ variantId, quantity }) => {
    const price = priceMap[variantId];
    if (!price) {
      throw new CheckoutAdapterError(
        "invalid_catalog",
        "Uno degli articoli non è disponibile per il pagamento.",
        409,
      );
    }
    return { price, quantity };
  });

  const successUrl = new URL(
    localizedPath(input.locale, "/checkout/success"),
    requestOrigin,
  );
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(
    localizedPath(input.locale, "/checkout"),
    requestOrigin,
  );
  cancelUrl.searchParams.set("cancelled", "1");

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        customer_email: input.customerEmail,
        adaptive_pricing: {
          enabled: process.env.STRIPE_ADAPTIVE_PRICING_ENABLED !== "false",
        },
        allow_promotion_codes: true,
        automatic_tax: {
          enabled: process.env.STRIPE_TAX_ENABLED === "true",
        },
        shipping_address_collection: {
          allowed_countries: [...shippingCountries[input.shippingZone]],
        },
        shipping_options: [
          { shipping_rate: shippingRateMap[input.shippingZone] },
        ],
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: { locale: input.locale, shippingZone: input.shippingZone },
      },
      { idempotencyKey: `checkout-${randomUUID()}` },
    );

    if (!session.url) {
      throw new CheckoutAdapterError(
        "provider_error",
        "Stripe non ha restituito un indirizzo di pagamento.",
        502,
      );
    }

    return { id: session.id, mode: "live", url: session.url };
  } catch (error) {
    if (error instanceof CheckoutAdapterError) throw error;
    throw new CheckoutAdapterError(
      "provider_error",
      "Il pagamento non è disponibile in questo momento.",
      502,
    );
  }
}
