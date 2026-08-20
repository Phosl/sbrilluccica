import { Text } from "@react-email/components";

import { BrandFrame, EmailButton, emailTextStyle } from "./brand-frame";

export type ShipmentUpdateEmailProps = {
  carrier?: string;
  customerName?: string;
  locale?: "it" | "en";
  orderNumber: string;
  trackingCode?: string;
  trackingUrl: string;
};

export function ShipmentUpdateEmail({
  carrier,
  customerName,
  locale = "it",
  orderNumber,
  trackingCode,
  trackingUrl,
}: ShipmentUpdateEmailProps) {
  const isItalian = locale === "it";

  return (
    <BrandFrame
      locale={locale}
      eyebrow={`${isItalian ? "Ordine" : "Order"} ${orderNumber}`}
      preview={isItalian ? "Il tuo pacco è in viaggio" : "Your parcel is on its way"}
      title={isItalian ? "Sta arrivando da te." : "It’s on its way to you."}
    >
      <Text style={emailTextStyle}>
        {isItalian
          ? `Ciao${customerName ? ` ${customerName}` : ""}, il tuo ordine è stato affidato al corriere.`
          : `Hello${customerName ? ` ${customerName}` : ""}, your order has been handed to the carrier.`}
      </Text>
      {carrier ? (
        <Text style={emailTextStyle}>
          <strong>{isItalian ? "Corriere:" : "Carrier:"}</strong> {carrier}
        </Text>
      ) : null}
      {trackingCode ? (
        <Text style={emailTextStyle}>
          <strong>{isItalian ? "Codice tracking:" : "Tracking code:"}</strong>{" "}
          {trackingCode}
        </Text>
      ) : null}
      <EmailButton href={trackingUrl}>
        {isItalian ? "Segui la spedizione" : "Track shipment"}
      </EmailButton>
    </BrandFrame>
  );
}

export default ShipmentUpdateEmail;
