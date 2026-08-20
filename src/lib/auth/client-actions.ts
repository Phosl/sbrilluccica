import { getBrowserSupabaseClient } from "./browser";

export type AuthActionResult =
  | { ok: true; mode: "supabase" }
  | { ok: true; mode: "mock"; message: string }
  | { ok: false; message: string };

function localePath(locale: "it" | "en", path: string) {
  return locale === "en" ? `/en${path}` : path;
}

export async function sendMagicLink(
  email: string,
  locale: "it" | "en" = "it",
): Promise<AuthActionResult> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      message: "Modalità demo: nessuna email di accesso è stata inviata.",
    };
  }

  const redirectTo = new URL(localePath(locale, "/account"), window.location.origin);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo.toString() },
  });

  if (error) return { ok: false, message: "Invio del link non riuscito." };
  return { ok: true, mode: "supabase" };
}

export async function signInWithGoogle(
  locale: "it" | "en" = "it",
): Promise<AuthActionResult> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return {
      ok: true,
      mode: "mock",
      message: "Modalità demo: collega Supabase per usare Google.",
    };
  }

  const redirectTo = new URL(localePath(locale, "/account"), window.location.origin);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() },
  });

  if (error) return { ok: false, message: "Accesso con Google non riuscito." };
  return { ok: true, mode: "supabase" };
}
