import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type BrandFrameProps = {
  children: ReactNode;
  eyebrow?: string;
  locale: "it" | "en";
  preview: string;
  title: string;
};

export function BrandFrame({
  children,
  eyebrow,
  locale,
  preview,
  title,
}: BrandFrameProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.brand}>SBRILLUCCICA</Section>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Heading style={styles.heading}>{title}</Heading>
          {children}
          <Hr style={styles.rule} />
          <Text style={styles.footer}>
            {locale === "it"
              ? "Gioielli e accessori scelti con cura. Questa è un’email transazionale."
              : "Jewellery and accessories selected with care. This is a transactional email."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Button href={href} style={styles.button}>
      {children}
    </Button>
  );
}

export const emailTextStyle = {
  color: "#42383d",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "15px",
  lineHeight: "24px",
};

const styles = {
  body: {
    backgroundColor: "#f8f2ef",
    margin: 0,
    padding: "36px 12px",
  },
  container: {
    backgroundColor: "#fffdfb",
    border: "1px solid #eadbdc",
    borderRadius: "24px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "38px 40px 30px",
  },
  brand: {
    color: "#b32962",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "20px",
    letterSpacing: "5px",
    marginBottom: "34px",
    textAlign: "center" as const,
  },
  eyebrow: {
    color: "#b32962",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
  },
  heading: {
    color: "#2f2429",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "34px",
    fontWeight: 400,
    lineHeight: "41px",
    margin: "0 0 22px",
  },
  button: {
    backgroundColor: "#b32962",
    borderRadius: "999px",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    marginTop: "14px",
    padding: "13px 24px",
    textDecoration: "none",
  },
  rule: { borderColor: "#eadbdc", margin: "34px 0 20px" },
  footer: {
    color: "#88777d",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12px",
    lineHeight: "19px",
    margin: 0,
  },
};
