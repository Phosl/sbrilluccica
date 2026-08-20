import type { AdminDashboardData, AdminProductDraft } from "./contracts";

export const mockAdminDashboard: AdminDashboardData = {
  updatedAt: "20 agosto 2026, 10:30",
  metrics: [
    {
      id: "revenue",
      label: "Vendite nette",
      value: "€ 8.420",
      context: "+12% sul mese scorso · dati demo",
      trend: "up",
    },
    {
      id: "orders",
      label: "Ordini",
      value: "126",
      context: "9 da preparare · dati demo",
      trend: "neutral",
    },
    {
      id: "customers",
      label: "Nuovi clienti",
      value: "48",
      context: "38% acquisto con account · dati demo",
      trend: "up",
    },
    {
      id: "stock",
      label: "Varianti in esaurimento",
      value: "7",
      context: "Sotto la soglia di 3 pezzi · dati demo",
      trend: "down",
    },
  ],
  orders: [
    {
      id: "demo-order-1",
      number: "SB-1048",
      customerName: "Elena R.",
      createdAt: "Oggi, 09:42",
      totalAmount: 12800,
      currency: "EUR",
      status: "paid",
      items: 2,
    },
    {
      id: "demo-order-2",
      number: "SB-1047",
      customerName: "Nora B.",
      createdAt: "Ieri, 18:16",
      totalAmount: 7400,
      currency: "EUR",
      status: "processing",
      items: 1,
    },
    {
      id: "demo-order-3",
      number: "SB-1046",
      customerName: "Marta C.",
      createdAt: "Ieri, 15:07",
      totalAmount: 18600,
      currency: "EUR",
      status: "shipped",
      items: 3,
    },
    {
      id: "demo-order-4",
      number: "SB-1045",
      customerName: "Sofia L.",
      createdAt: "18 ago, 11:32",
      totalAmount: 5600,
      currency: "EUR",
      status: "refunded",
      items: 1,
    },
  ],
  stockAlerts: [
    {
      id: "demo-stock-1",
      productName: "Anello Mandala",
      variantName: "Argento · 14",
      sku: "AN-MAN-AG-14",
      available: 1,
    },
    {
      id: "demo-stock-2",
      productName: "Orecchini Jaipur",
      variantName: "Quarzo rosa",
      sku: "OR-JAI-QR",
      available: 2,
    },
    {
      id: "demo-stock-3",
      productName: "Collana Sottobosco",
      variantName: "Unica",
      sku: "CO-SOT-UN",
      available: 2,
    },
  ],
  integrations: [
    {
      id: "supabase",
      name: "Supabase",
      detail: "Catalogo, account e ordini usano ancora dati locali.",
      state: "mock",
    },
    {
      id: "stripe",
      name: "Stripe",
      detail: "Checkout sicuro in modalità dimostrativa.",
      state: "mock",
    },
    {
      id: "resend",
      name: "Resend",
      detail: "Template pronti; nessuna email reale viene inviata.",
      state: "mock",
    },
    {
      id: "analytics",
      name: "Analytics",
      detail: "GA4 e Meta saranno attivati dopo il consenso.",
      state: "attention",
    },
  ],
};

export const mockProductDraft: AdminProductDraft = {
  name: "Anello Mandala",
  slug: "anello-mandala",
  sku: "AN-MAN-AG",
  category: "Anelli",
  description:
    "Anello lavorato artigianalmente, con dettagli ispirati ai motivi mandala.",
  unitAmount: 6400,
  stockQuantity: 8,
  published: true,
};
