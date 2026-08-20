import {
  confirmNewsletterSubscription,
  verifyNewsletterToken,
} from "@/lib/integrations/resend/newsletter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const payload = token ? verifyNewsletterToken(token) : null;

  if (!payload) {
    return Response.json({ error: "Link non valido o scaduto." }, { status: 400 });
  }

  try {
    const result = await confirmNewsletterSubscription(payload);
    const destination = new URL(payload.locale === "en" ? "/en" : "/", url.origin);
    destination.searchParams.set("newsletter", "confirmed");
    if (result.mode === "mock") destination.searchParams.set("demo", "1");
    return Response.redirect(destination, 303);
  } catch {
    return Response.json(
      { error: "Iscrizione non completata. Riprova più tardi." },
      { status: 503 },
    );
  }
}
