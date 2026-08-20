import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin";
import { getAdminAccess } from "@/lib/auth/admin";
import { isLocale, localizedPath } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const access = await getAdminAccess();
  if (!access.authorized) redirect(`${localizedPath(locale, "/account")}?next=${encodeURIComponent(localizedPath(locale, "/admin"))}`);
  return <AdminDashboard />;
}
