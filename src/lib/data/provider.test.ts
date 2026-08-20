import { describe, expect, it } from "vitest";

import {
  classifyDataAccessError,
  getAdminDataErrorMessage,
  getPublicDataErrorMessage,
} from "./data-errors";
import { createCatalogRepository, resolveDataProvider } from "./provider";

describe("data provider", () => {
  it("uses the local mock by default", () => {
    expect(resolveDataProvider({})).toBe("mock");
    expect(createCatalogRepository("mock")).toBeDefined();
  });

  it("prefers DATA_PROVIDER while accepting the legacy alias", () => {
    expect(
      resolveDataProvider({
        DATA_PROVIDER: "mock",
        SBRILLUCCICA_DATA_SOURCE: "supabase",
      }),
    ).toBe("mock");
    expect(
      resolveDataProvider({ SBRILLUCCICA_DATA_SOURCE: "supabase" }),
    ).toBe("supabase");
  });

  it("fails explicitly when Supabase is selected before its adapter is connected", () => {
    expect(() => createCatalogRepository("supabase")).toThrow(
      /has not been connected yet/i,
    );
  });
});

describe("Supabase error boundary", () => {
  it("distinguishes missing schema from insufficient privileges", () => {
    expect(classifyDataAccessError({ code: "PGRST205" })).toBe(
      "schema_unavailable",
    );
    expect(classifyDataAccessError({ code: "42501" })).toBe(
      "permission_denied",
    );
  });

  it("keeps technical details away from public messages", () => {
    const publicMessage = getPublicDataErrorMessage("it", "schema_unavailable");
    const adminMessage = getAdminDataErrorMessage("it", "schema_unavailable");

    expect(publicMessage).not.toMatch(/supabase|schema|migration/i);
    expect(adminMessage).toMatch(/Supabase|migrazioni/i);
  });
});
