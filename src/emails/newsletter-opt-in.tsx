import { Text } from "@react-email/components";

import { BrandFrame, EmailButton, emailTextStyle } from "./brand-frame";

export type NewsletterOptInEmailProps = {
  confirmUrl: string;
  locale?: "it" | "en";
};

export function NewsletterOptInEmail({
  confirmUrl,
  locale = "it",
}: NewsletterOptInEmailProps) {
  const isItalian = locale === "it";

  return (
    <BrandFrame
      locale={locale}
      eyebrow={isItalian ? "Newsletter" : "Newsletter"}
      preview={isItalian ? "Conferma la tua iscrizione" : "Confirm your subscription"}
      title={isItalian ? "Un ultimo piccolo gesto." : "One small final step."}
    >
      <Text style={emailTextStyle}>
        {isItalian
          ? "Conferma che vuoi ricevere novità, storie e nuove collezioni Sbrilluccica. Se non hai richiesto tu l’iscrizione, ignora questa email."
          : "Confirm that you’d like to receive Sbrilluccica news, stories and new collections. If you did not request this, ignore this email."}
      </Text>
      <EmailButton href={confirmUrl}>
        {isItalian ? "Conferma iscrizione" : "Confirm subscription"}
      </EmailButton>
    </BrandFrame>
  );
}

export default NewsletterOptInEmail;
