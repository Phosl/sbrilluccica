import { describe, expect, it } from "vitest";

import { classifyDatabaseError, toSafeDatabaseLog } from "./errors";

describe("classifyDatabaseError", () => {
  it.each(["42P01", "PGRST202", "PGRST205"])(
    "classifies %s as a missing schema",
    (code) => {
      expect(classifyDatabaseError({ code })).toBe("missing_schema");
    },
  );

  it("keeps permission errors separate from missing schema errors", () => {
    expect(classifyDatabaseError({ code: "42501" })).toBe(
      "insufficient_permissions",
    );
  });

  it("does not include database messages in structured logs", () => {
    expect(
      toSafeDatabaseLog(
        { code: "PGRST205", message: "private table and customer data" },
        { scope: "admin", operation: "select", resource: "products" },
      ),
    ).toEqual({
      scope: "admin",
      operation: "select",
      resource: "products",
      code: "PGRST205",
      kind: "missing_schema",
    });
  });
});
