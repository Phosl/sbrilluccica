# Supabase handoff

The app currently uses the typed local mock. These migrations are the future
database contract; they have **not** been applied to a remote project and no
credentials are stored in this repository.

## Migration order

1. `20260820090000_catalog_and_roles.sql` — profiles, roles, bilingual catalog
2. `20260820091000_customer_commerce.sql` — carts, wishlist, orders, content
3. `20260820091500_store_credits.sql` — legacy credit ledger and reservations
4. `20260820092000_inventory_reservations.sql` — atomic stock reservations

Every public-schema table enables RLS in the migration that introduces it.
Published catalog rows are readable anonymously; addresses, carts, wishlists
and orders are owner-scoped; administrative access is role-scoped. Webhook and
inventory mutations are reserved for the server `service_role`.

## Inventory RPC contracts

- `reserve_inventory(checkout_attempt_id, items, expires_at)` locks variants,
  validates availability and creates idempotent 30-minute reservations.
- `release_inventory_reservations(checkout_attempt_id, reason)` releases active
  reservations after cancellation or a failed/expired checkout.
- `commit_inventory_reservations(checkout_attempt_id, order_id)` requires a paid
  order, decrements stock once and records inventory movements.
- `expire_inventory_reservations(now)` is the cleanup contract for a future
  scheduled server job.

The application-side equivalents live in `src/lib/domain/inventory.ts`.

## Connecting later

1. Link a dedicated Supabase project and review all commercial/legal fields.
2. Apply the migrations in a staging project first.
3. Generate TypeScript database types from the applied schema.
4. Implement the catalog adapter behind `CatalogRepository`.
5. Set `DATA_PROVIDER=supabase` only after the adapter and server environment
   variables are present. Until then, `DATA_PROVIDER=mock` is the safe default.
6. Verify the RLS matrix with anonymous, customer and each admin role before
   promoting the same migrations to production.

Do not expose a service-role key to browser code and do not import unverified
Wix consent, tax, material, provenance or sustainability data as fact.
