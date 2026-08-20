import {
  ArrowUpRight,
  Boxes,
  ChevronRight,
  CircleUserRound,
  Gem,
  LayoutDashboard,
  Mail,
  PackageCheck,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { AdminNotice } from "./admin-notice";
import type {
  AdminDashboardData,
  AdminMetric,
  AdminOrderStatus,
} from "./contracts";
import { IntegrationStatus } from "./integration-status";
import { mockAdminDashboard } from "./mock-data";

type AdminDashboardProps = {
  data?: AdminDashboardData;
};

const metricIcons = {
  revenue: Sparkles,
  orders: ShoppingBag,
  customers: UsersRound,
  stock: Boxes,
};

const orderStatus: Record<AdminOrderStatus, { label: string; style: string }> = {
  paid: { label: "Pagato", style: "bg-emerald-50 text-emerald-700" },
  processing: { label: "Da preparare", style: "bg-amber-50 text-amber-800" },
  shipped: { label: "Spedito", style: "bg-blue-50 text-blue-700" },
  refunded: { label: "Rimborsato", style: "bg-zinc-100 text-zinc-600" },
};

const navItems = [
  { label: "Panoramica", icon: LayoutDashboard, active: true },
  { label: "Ordini", icon: ShoppingBag },
  { label: "Catalogo", icon: Gem },
  { label: "Inventario", icon: PackageCheck },
  { label: "Clienti", icon: CircleUserRound },
  { label: "Newsletter", icon: Mail },
  { label: "Impostazioni", icon: Settings2 },
];

function MetricCard({ metric }: { metric: AdminMetric }) {
  const Icon = metricIcons[metric.id];
  return (
    <article className="rounded-[22px] border border-[#eadfe1] bg-white p-5 shadow-[0_18px_50px_rgba(91,41,60,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b767d]">
          {metric.label}
        </p>
        <span className="grid size-9 place-items-center rounded-full bg-[#fff1f5] text-[#a72d60]">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-5 font-serif text-3xl text-[#30252a]">{metric.value}</p>
      <p className="mt-2 text-xs leading-5 text-[#8b767d]">{metric.context}</p>
    </article>
  );
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(
    amount / 100,
  );
}

export function AdminDashboard({ data = mockAdminDashboard }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-[#f7f1ef] text-[#30252a]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-[#e7dadd] bg-[#30252a] px-5 py-7 text-white lg:flex lg:flex-col">
          <div className="px-3 font-serif text-xl tracking-[0.2em]">SBRILLUCCICA</div>
          <div className="mt-10 rounded-2xl bg-white/7 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Gestionale
            </p>
            <p className="mt-1 text-sm text-white/85">Negozio internazionale</p>
          </div>
          <nav aria-label="Navigazione gestionale" className="mt-7">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <span
                      aria-current={item.active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                        item.active
                          ? "bg-white text-[#30252a]"
                          : "text-white/62"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 p-4 text-xs leading-5 text-white/55">
            I valori visualizzati sono dimostrativi finché Supabase non viene collegato.
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-7 xl:px-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a72d60]">
                Gestionale Sbrilluccica
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                Buongiorno, Gaia.
              </h1>
              <p className="mt-2 text-sm text-[#7e6d73]">
                Ultimo aggiornamento: {data.updatedAt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative hidden sm:block">
                <span className="sr-only">Cerca nel gestionale</span>
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a858c]"
                />
                <input
                  className="h-10 w-56 rounded-full border border-[#dfd0d4] bg-white pl-9 pr-4 text-sm outline-none transition focus:border-[#a72d60] focus:ring-2 focus:ring-[#a72d60]/15"
                  placeholder="Cerca ordini, SKU…"
                  type="search"
                />
              </label>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#a72d60] px-4 text-sm font-semibold text-white transition hover:bg-[#8f244f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a72d60]"
                type="button"
              >
                <Gem aria-hidden="true" className="size-4" />
                Nuovo prodotto
              </button>
            </div>
          </header>

          <div className="mt-6">
            <AdminNotice title="Modalità demo · Supabase non collegato">
              Modifiche, ordini e clienti restano locali. Collega le variabili Supabase per attivare dati e accessi reali.
            </AdminNotice>
          </div>

          <section aria-label="Indicatori principali" className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {data.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </section>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
            <section className="overflow-hidden rounded-[24px] border border-[#eadfe1] bg-white shadow-[0_18px_50px_rgba(91,41,60,0.05)]">
              <div className="flex items-center justify-between border-b border-[#eee2e3] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-serif text-xl">Ordini recenti</h2>
                  <p className="mt-1 text-xs text-[#8b767d]">Flusso operativo dimostrativo</p>
                </div>
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#a72d60]" type="button">
                  Vedi tutti <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-[#fcf8f7] text-[10px] uppercase tracking-[0.15em] text-[#8b767d]">
                    <tr>
                      <th className="px-6 py-3 font-semibold" scope="col">Ordine</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Cliente</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Stato</th>
                      <th className="px-4 py-3 text-right font-semibold" scope="col">Totale</th>
                      <th className="w-12 px-4 py-3"><span className="sr-only">Apri</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e7e8]">
                    {data.orders.map((order) => {
                      const status = orderStatus[order.status];
                      return (
                        <tr key={order.id} className="transition hover:bg-[#fffaf9]">
                          <td className="px-6 py-4">
                            <p className="font-semibold">{order.number}</p>
                            <p className="mt-1 text-xs text-[#907d84]">{order.createdAt}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p>{order.customerName}</p>
                            <p className="mt-1 text-xs text-[#907d84]">
                              {order.items} {order.items === 1 ? "articolo" : "articoli"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.style}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold">
                            {formatMoney(order.totalAmount, order.currency)}
                          </td>
                          <td className="px-4 py-4">
                            <button aria-label={`Apri ordine ${order.number}`} className="grid size-8 place-items-center rounded-full text-[#8b767d] hover:bg-[#f7ecef] hover:text-[#a72d60]" type="button">
                              <ChevronRight aria-hidden="true" className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#eadfe1] bg-white p-5 shadow-[0_18px_50px_rgba(91,41,60,0.05)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl">Collegamenti</h2>
                  <p className="mt-1 text-xs text-[#8b767d]">Stato dei servizi</p>
                </div>
                <span className="grid size-9 place-items-center rounded-full bg-[#fff1f5] text-[#a72d60]">
                  <Settings2 aria-hidden="true" className="size-4" />
                </span>
              </div>
              <ul className="mt-5">
                {data.integrations.map((integration) => (
                  <IntegrationStatus key={integration.id} integration={integration} />
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-[24px] border border-[#eadfe1] bg-white p-5 shadow-[0_18px_50px_rgba(91,41,60,0.05)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl">Scorte da controllare</h2>
                <p className="mt-1 text-xs text-[#8b767d]">Varianti sotto la soglia dimostrativa</p>
              </div>
              <Boxes aria-hidden="true" className="size-5 text-[#a72d60]" />
            </div>
            <ul className="mt-5 grid gap-3 lg:grid-cols-3">
              {data.stockAlerts.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#fcf8f7] px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.productName}</p>
                    <p className="mt-1 truncate text-xs text-[#8b767d]">{item.variantName} · {item.sku}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#fff0e6] px-2.5 py-1 text-xs font-bold text-[#a44d17]">
                    {item.available} pz
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
