import "server-only";

import { Resend } from "resend";

let resendClient: Resend | null = null;

function getApiKey() {
  const value = process.env.RESEND_API_KEY?.trim();
  return value?.startsWith("re_") ? value : null;
}

export function getResendClient(): Resend | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

export function getResendFromAddress() {
  const value = process.env.RESEND_FROM_EMAIL?.trim();
  return value?.includes("@") ? value : null;
}

export function getResendWebhookSecret() {
  const value = process.env.RESEND_WEBHOOK_SECRET?.trim();
  return value?.startsWith("whsec_") ? value : null;
}

export function getResendServerStatus() {
  return {
    email:
      getApiKey() && getResendFromAddress()
        ? ("configured" as const)
        : ("mock" as const),
    webhook: getResendWebhookSecret()
      ? ("configured" as const)
      : ("missing" as const),
  };
}
