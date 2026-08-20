import "server-only";

import { randomUUID } from "node:crypto";
import type { ReactElement } from "react";

import { getResendClient, getResendFromAddress } from "./client";

export type TransactionalEmail = {
  idempotencyKey: string;
  react: ReactElement;
  replyTo?: string;
  subject: string;
  template: string;
  to: string;
};

export type EmailSendResult = {
  id: string;
  mode: "live" | "mock";
};

export class EmailAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailAdapterError";
  }
}

export async function sendTransactionalEmail(
  email: TransactionalEmail,
): Promise<EmailSendResult> {
  const resend = getResendClient();
  const from = getResendFromAddress();

  if (!resend && !from) {
    const id = `mock_email_${randomUUID()}`;
    console.info("[email:mock]", {
      id,
      template: email.template,
      idempotencyKey: email.idempotencyKey,
    });
    return { id, mode: "mock" };
  }

  if (!resend || !from) {
    throw new EmailAdapterError(
      "Resend è configurato solo in parte. Verifica API key e mittente.",
    );
  }

  const result = await resend.emails.send(
    {
      from,
      to: email.to,
      subject: email.subject,
      react: email.react,
      replyTo: email.replyTo,
    },
    { idempotencyKey: email.idempotencyKey },
  );

  if (result.error || !result.data?.id) {
    throw new EmailAdapterError("Resend non ha accettato l’email.");
  }

  return { id: result.data.id, mode: "live" };
}
