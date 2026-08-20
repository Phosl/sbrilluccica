import { handleContactForm } from "@/lib/integrations/resend/form-handlers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleContactForm(request);
}
