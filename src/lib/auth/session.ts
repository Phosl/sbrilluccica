import "server-only";

import { getServerSupabaseClient } from "./server";

export type AuthViewer =
  | { mode: "mock"; user: null }
  | {
      mode: "supabase";
      user: { id: string; email: string | null; displayName: string | null } | null;
    };

export async function getAuthViewer(): Promise<AuthViewer> {
  const supabase = await getServerSupabaseClient();
  if (!supabase) return { mode: "mock", user: null };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { mode: "supabase", user: null };

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return {
    mode: "supabase",
    user: { id: user.id, email: user.email ?? null, displayName },
  };
}
