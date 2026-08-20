import "server-only";

import { createHash } from "node:crypto";

import { ContactNotificationEmail } from "@/emails/contact-notification";

import { sendTransactionalEmail } from "./send";

export type ContactMessage = {
  email: string;
  locale: "it" | "en";
  message: string;
  name: string;
  orderNumber?: string;
};

export async function sendContactMessage(input: ContactMessage) {
  const recipient = process.env.CONTACT_TO_EMAIL?.trim();
  if (!recipient?.includes("@")) return { mode: "mock" as const };

  const digest = createHash("sha256")
    .update(`${input.email}|${input.message}|${Math.floor(Date.now() / 3_600_000)}`)
    .digest("hex")
    .slice(0, 32);

  return sendTransactionalEmail({
    to: recipient,
    replyTo: input.email,
    subject: "Nuovo messaggio dal sito Sbrilluccica",
    react: <ContactNotificationEmail {...input} />,
    template: "contact-notification",
    idempotencyKey: `contact-${digest}`,
  });
}
