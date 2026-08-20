import { Hr, Text } from "@react-email/components";

import { BrandFrame, emailTextStyle } from "./brand-frame";

export type ContactNotificationEmailProps = {
  email: string;
  locale: "it" | "en";
  message: string;
  name: string;
  orderNumber?: string;
};

export function ContactNotificationEmail({
  email,
  locale,
  message,
  name,
  orderNumber,
}: ContactNotificationEmailProps) {
  return (
    <BrandFrame
      locale="it"
      eyebrow="Contatto dal sito"
      preview={`Nuovo messaggio da ${name}`}
      title="È arrivato un nuovo messaggio."
    >
      <Text style={emailTextStyle}>
        <strong>Nome:</strong> {name}
        <br />
        <strong>Email:</strong> {email}
        <br />
        {orderNumber ? (
          <>
            <strong>Ordine:</strong> {orderNumber}
            <br />
          </>
        ) : null}
        <strong>Lingua:</strong> {locale.toUpperCase()}
      </Text>
      <Hr style={{ borderColor: "#eadbdc", margin: "22px 0" }} />
      <Text style={{ ...emailTextStyle, whiteSpace: "pre-wrap" }}>{message}</Text>
    </BrandFrame>
  );
}

export default ContactNotificationEmail;
