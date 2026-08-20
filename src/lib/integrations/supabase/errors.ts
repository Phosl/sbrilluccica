export type DatabaseErrorLike = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
};

export type DatabaseErrorKind =
  | "missing_schema"
  | "insufficient_permissions"
  | "conflict"
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

const CONFLICT_CODES = new Set(["23503", "23505"]);

export const PUBLIC_DATABASE_ERROR_MESSAGE =
  "Questa funzione non è disponibile in questo momento. Riprova tra poco.";

export const ADMIN_DATABASE_ERROR_MESSAGES: Record<DatabaseErrorKind, string> = {
  missing_schema:
    "La funzione richiede lo schema Supabase aggiornato. Applica la migrazione prevista e ricarica la pagina.",
  insufficient_permissions:
    "Il tuo ruolo non dispone dei permessi necessari. Verifica le policy RLS o accedi con un profilo autorizzato.",
  conflict:
    "Il dato è cambiato o esiste già. Aggiorna la pagina e controlla i valori prima di riprovare.",
  unknown:
    "Supabase non ha completato l’operazione. Riprova e controlla i log server se il problema continua.",
};

export function classifyDatabaseError(
  error: DatabaseErrorLike | null | undefined,
): DatabaseErrorKind {
  if (!error) return "unknown";

  const code = error.code?.toUpperCase();
  if (code && MISSING_SCHEMA_CODES.has(code)) return "missing_schema";
  if (code === "42501") return "insufficient_permissions";
  if (code && CONFLICT_CODES.has(code)) return "conflict";

  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  if (
    /schema cache|does not exist|could not find (the )?(table|function|column)/.test(
      message,
    )
  ) {
    return "missing_schema";
  }

  if (/permission denied|row-level security|violates row-level security/.test(message)) {
    return "insufficient_permissions";
  }

  return "unknown";
}

export function getAdminDatabaseErrorMessage(
  error: DatabaseErrorLike | null | undefined,
) {
  return ADMIN_DATABASE_ERROR_MESSAGES[classifyDatabaseError(error)];
}

export function toSafeDatabaseLog(error: DatabaseErrorLike, context: {
  scope: string;
  operation: string;
  resource: string;
  requestId?: string;
}) {
  return {
    ...context,
    code: error.code ?? "UNKNOWN",
    kind: classifyDatabaseError(error),
  };
}
