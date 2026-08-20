import { Hr, Section, Text } from "@react-email/components";

import { BrandFrame, EmailButton, emailTextStyle } from "./brand-frame";

export type OrderEmailItem = {
  name: string;
  quantity: number;
  unitAmount: number;
};

export type OrderConfirmationEmailProps = {
  currency?: string;
  customerName?: string;
  items: OrderEmailItem[];
  locale?: "it" | "en";
  orderNumber: string;
  orderUrl: string;
  totalAmount: number;
};

function money(amount: number, currency: string, locale: "it" | "en") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function OrderConfirmationEmail({
  currency = "EUR",
  customerName,
  items,
  locale = "it",
  orderNumber,
  orderUrl,
  totalAmount,
}: OrderConfirmationEmailProps) {
  const isItalian = locale === "it";

  return (
    <BrandFrame
      locale={locale}
      eyebrow={`${isItalian ? "Ordine" : "Order"} ${orderNumber}`}
      preview={isItalian ? "Il tuo ordine è confermato" : "Your order is confirmed"}
      title={isItalian ? "Grazie, è tutto confermato." : "Thank you, it’s all confirmed."}
    >
      <Text style={emailTextStyle}>
        {isItalian
          ? `Ciao${customerName ? ` ${customerName}` : ""}, abbiamo ricevuto il tuo pagamento. Ti scriveremo di nuovo appena il pacco sarà in viaggio.`
          : `Hello${customerName ? ` ${customerName}` : ""}, we received your payment. We’ll write again as soon as your parcel is on its way.`}
      </Text>
      <Section style={{ marginTop: "24px" }}>
        {items.map((item, index) => (
          <Section key={`${item.name}-${index}`} style={{ marginBottom: "12px" }}>
            <Text style={{ ...emailTextStyle, margin: 0 }}>
              {item.quantity} × {item.name}
              <span style={{ float: "right" }}>
                {money(item.unitAmount * item.quantity, currency, locale)}
              </span>
            </Text>
          </Section>
        ))}
        <Hr style={{ borderColor: "#eadbdc", margin: "18px 0" }} />
        <Text style={{ ...emailTextStyle, fontWeight: 700 }}>
          {isItalian ? "Totale" : "Total"}
          <span style={{ float: "right" }}>
            {money(totalAmount, currency, locale)}
          </span>
        </Text>
      </Section>
      <EmailButton href={orderUrl}>
        {isItalian ? "Segui l’ordine" : "View your order"}
      </EmailButton>
    </BrandFrame>
  );
}

export default OrderConfirmationEmail;
