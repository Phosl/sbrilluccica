import "server-only";

import { getServerSupabaseClient } from "./server";

export type AdminAccess =
  | { mode: "mock"; authorized: true }
  | { mode: "supabase"; authorized: boolean };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await getServerSupabaseClient();
  if (!supabase) return { mode: "mock", authorized: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { mode: "supabase", authorized: false };

  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { mode: "supabase", authorized: Boolean(data?.role) };
}
