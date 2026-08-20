import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const catalogMigration = readFileSync(
  join(migrationsDirectory, "20260820090000_catalog_and_roles.sql"),
  "utf8",
);
const commerceMigration = readFileSync(
  join(migrationsDirectory, "20260820091000_customer_commerce.sql"),
  "utf8",
);
const storeCreditMigration = readFileSync(
  join(migrationsDirectory, "20260820091500_store_credits.sql"),
  "utf8",
);
const inventoryMigration = readFileSync(
  join(migrationsDirectory, "20260820092000_inventory_reservations.sql"),
  "utf8",
);
const allMigrations = [
  catalogMigration,
  commerceMigration,
  storeCreditMigration,
  inventoryMigration,
].join("\n");

describe("Supabase authorization contract", () => {
  it("enables RLS on every table introduced in the public schema", () => {
    const tableNames = [...allMigrations.matchAll(/create table public\.(\w+)/g)].map(
      (match) => match[1],
    );

    expect(tableNames.length).toBeGreaterThan(0);
    for (const tableName of tableNames) {
      expect(allMigrations).toContain(
        `alter table public.${tableName} enable row level security;`,
      );
    }
  });

  it("limits anonymous catalog reads to published records", () => {
    expect(catalogMigration).toMatch(
      /create policy products_public_select[\s\S]+using \(status = 'published'\)/,
    );
    expect(catalogMigration).toMatch(
      /product_variants_public_select[\s\S]+and products\.status = 'published'/,
    );
  });

  it("keeps wishlists and orders scoped to the authenticated owner", () => {
    expect(commerceMigration).toMatch(
      /wishlist_items_own_all[\s\S]+using \(user_id = auth\.uid\(\)\)/,
    );
    expect(commerceMigration).toMatch(
      /orders_select_own[\s\S]+using \(user_id = auth\.uid\(\)\)/,
    );
  });

  it("gates administrative access through explicit role lists", () => {
    expect(catalogMigration).toMatch(
      /array\['owner', 'catalog_manager', 'editor'\]::public\.admin_role\[\]/,
    );
    expect(commerceMigration).toMatch(
      /array\['owner', 'order_manager'\]::public\.admin_role\[\]/,
    );
  });

  it("keeps inventory RPCs server-only", () => {
    expect(inventoryMigration).toMatch(
      /revoke all on function public\.reserve_inventory\(uuid, jsonb, timestamptz\)[\s\S]+from public, anon, authenticated/,
    );
    expect(inventoryMigration).toMatch(
      /grant execute on function public\.reserve_inventory\(uuid, jsonb, timestamptz\)[\s\S]+to service_role/,
    );
    expect(inventoryMigration).toContain("for update;");
  });
});
