export type AdminMetric = {
  id: "revenue" | "orders" | "customers" | "stock";
  label: string;
  value: string;
  context: string;
  trend?: "up" | "down" | "neutral";
};

export type AdminOrderStatus =
  | "paid"
  | "processing"
  | "shipped"
  | "refunded";

export type AdminOrder = {
  id: string;
  number: string;
  customerName: string;
  createdAt: string;
  totalAmount: number;
  currency: "EUR";
  status: AdminOrderStatus;
  items: number;
};

export type AdminStockAlert = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  available: number;
};

export type AdminIntegrationState = "ready" | "mock" | "attention";

export type AdminIntegration = {
  id: "supabase" | "stripe" | "resend" | "analytics";
  name: string;
  detail: string;
  state: AdminIntegrationState;
};

export type AdminDashboardData = {
  metrics: AdminMetric[];
  orders: AdminOrder[];
  stockAlerts: AdminStockAlert[];
  integrations: AdminIntegration[];
  updatedAt: string;
};

export type AdminProductDraft = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  unitAmount: number;
  stockQuantity: number;
  published: boolean;
};
