const MAX_JSON_BYTES = 64 * 1024;

export class RequestValidationError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

export function assertJsonRequestIsReasonable(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new RequestValidationError("È richiesto un corpo JSON.", 415);
  }

  const rawLength = request.headers.get("content-length");
  if (rawLength && Number(rawLength) > MAX_JSON_BYTES) {
    throw new RequestValidationError("La richiesta è troppo grande.", 413);
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  assertJsonRequestIsReasonable(request);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES) {
    throw new RequestValidationError("La richiesta è troppo grande.", 413);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new RequestValidationError("Il corpo JSON non è valido.", 400);
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  let originUrl: URL;

  try {
    originUrl = new URL(origin);
  } catch {
    throw new RequestValidationError("Origine della richiesta non valida.", 403);
  }

  if (originUrl.host !== requestUrl.host || originUrl.protocol !== requestUrl.protocol) {
    throw new RequestValidationError("Origine della richiesta non consentita.", 403);
  }
}

export function getSafeRequestOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function publicErrorResponse(error: unknown) {
  if (error instanceof RequestValidationError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return Response.json(
    { error: "Non è stato possibile completare la richiesta. Riprova tra poco." },
    { status: 500 },
  );
}
