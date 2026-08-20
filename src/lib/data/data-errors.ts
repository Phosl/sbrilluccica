import type { Locale } from "../domain";

export interface DatabaseLikeError {
  code?: string;
  message?: string;
  details?: string | null;
}

export type DataAccessErrorCode =
  | "schema_unavailable"
  | "permission_denied"
  | "configuration_missing"
  | "unknown";

const MISSING_SCHEMA_CODES = new Set([
  "42P01",
  "42703",
  "42883",
  "PGRST200",
  "PGRST202",
  "PGRST204",
  "PGRST205",
]);

export class DataSourceUnavailableError extends Error {
  readonly code: DataAccessErrorCode;

  constructor(
    code: DataAccessErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DataSourceUnavailableError";
    this.code = code;
  }
}

export function classifyDataAccessError(
  error: DatabaseLikeError | null | undefined,
): DataAccessErrorCode {
  if (!error) return "unknown";
  if (error.code && MISSING_SCHEMA_CODES.has(error.code)) {
    return "schema_unavailable";
  }
  if (error.code === "42501") return "permission_denied";

  const normalizedMessage = `${error.message ?? ""} ${error.details ?? ""}`
    .toLowerCase()
    .replaceAll(/\s+/g, " ");

  if (
    /schema cache|does not exist|could not find (the )?(table|function|column)/.test(
      normalizedMessage,
    )
  ) {
    return "schema_unavailable";
  }
  if (/permission denied|insufficient privilege/.test(normalizedMessage)) {
    return "permission_denied";
  }

  return "unknown";
}

export function getPublicDataErrorMessage(
  locale: Locale,
  code: DataAccessErrorCode,
): string {
  void code;
  return locale === "it"
    ? "Questa funzione non è disponibile in questo momento. Riprova tra poco."
    : "This feature is not available right now. Please try again shortly.";
}

export function getAdminDataErrorMessage(
  locale: Locale,
  code: DataAccessErrorCode,
): string {
  const messages: Record<DataAccessErrorCode, Record<Locale, string>> = {
    schema_unavailable: {
      it: "La funzione richiede lo schema Supabase aggiornato. Applica le migrazioni previste e ricarica la pagina.",
      en: "This feature requires the current Supabase schema. Apply the pending migrations and reload the page.",
    },
    permission_denied: {
      it: "Il tuo ruolo non consente questa operazione. Verifica ruolo e policy RLS, quindi riprova.",
      en: "Your role cannot perform this operation. Check the role and RLS policy, then try again.",
    },
    configuration_missing: {
      it: "Il provider Supabase non è ancora collegato. Configura l’adapter e le variabili server, quindi ricarica.",
      en: "The Supabase provider is not connected yet. Configure the adapter and server variables, then reload.",
    },
    unknown: {
      it: "Operazione non riuscita. Controlla i log server usando il request ID e riprova.",
      en: "The operation failed. Check server logs using the request ID and try again.",
    },
  };

  return messages[code][locale];
}

export interface SafeDataErrorMetadata {
  scope: string;
  operation: string;
  resource: string;
  code: string;
  requestId?: string;
}

export function toSafeDataErrorMetadata(
  error: DatabaseLikeError,
  context: Omit<SafeDataErrorMetadata, "code">,
): SafeDataErrorMetadata {
  return {
    ...context,
    code: error.code ?? "unknown",
  };
}
