import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getSecretKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  return value?.startsWith("sk_") ? value : null;
}

export function getStripeClient(): Stripe | null {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  stripeClient ??= new Stripe(secretKey, {
    maxNetworkRetries: 2,
    typescript: true,
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const value = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return value?.startsWith("whsec_") ? value : null;
}

export function getStripeServerStatus() {
  return {
    checkout: getSecretKey() ? ("configured" as const) : ("mock" as const),
    webhook: getStripeWebhookSecret()
      ? ("configured" as const)
      : ("missing" as const),
  };
}
