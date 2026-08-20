begin;

do $$
begin
  create type public.address_type as enum ('shipping', 'billing');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.cart_status as enum ('active', 'converted', 'abandoned', 'expired');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.order_source as enum ('storefront', 'wix_import', 'manual');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.order_payment_status as enum (
    'pending',
    'paid',
    'failed',
    'canceled',
    'partially_refunded',
    'refunded'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.order_fulfillment_status as enum (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'canceled',
    'returned'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.checkout_status as enum (
    'created',
    'open',
    'completed',
    'expired',
    'failed'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.shipment_status as enum (
    'pending',
    'shipped',
    'delivered',
    'returned'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.webhook_processing_status as enum (
    'received',
    'processed',
    'failed',
    'ignored'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.promotion_type as enum ('percentage', 'fixed_amount', 'free_shipping');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.subscriber_status as enum (
    'pending',
    'subscribed',
    'unsubscribed',
    'suppressed'
  );
exception
  when duplicate_object then null;
end
$$;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  type public.address_type not null default 'shipping',
  full_name text not null,
  company text,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  postal_code text not null,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index addresses_one_default_per_type_idx
on public.addresses (user_id, type)
where is_default;

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  guest_token_hash text,
  status public.cart_status not null default 'active',
  currency text not null default 'EUR' check (currency = 'EUR'),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner_required check (
    user_id is not null or guest_token_hash is not null
  )
);

create unique index carts_one_active_per_user_idx
on public.carts (user_id)
where status = 'active' and user_id is not null;

create unique index carts_guest_token_hash_idx
on public.carts (guest_token_hash)
where guest_token_hash is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  customer_email text not null,
  source public.order_source not null default 'storefront',
  payment_status public.order_payment_status not null default 'pending',
  fulfillment_status public.order_fulfillment_status not null default 'pending',
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  presentment_currency text check (
    presentment_currency is null or presentment_currency ~ '^[A-Z]{3}$'
  ),
  presentment_total_cents integer check (
    presentment_total_cents is null or presentment_total_cents >= 0
  ),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  notes text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_matches_parts check (
    total_cents = subtotal_cents - discount_cents + shipping_cents + tax_cents
  )
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_payment_fulfillment_idx
on public.orders (payment_status, fulfillment_status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text not null,
  image_url text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(snapshot) = 'object'),
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

create table public.order_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  type public.address_type not null,
  full_name text not null,
  company text,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  postal_code text not null,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  phone text,
  unique (order_id, type)
);

create table public.checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  status public.checkout_status not null default 'created',
  idempotency_key text not null unique,
  stripe_checkout_session_id text unique,
  expires_at timestamptz not null,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index checkout_attempts_expiry_idx
on public.checkout_attempts (status, expires_at);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.shipment_status not null default 'pending',
  carrier text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  payment_status public.order_payment_status,
  fulfillment_status public.order_fulfillment_status,
  note text,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'resend')),
  provider_event_id text not null,
  event_type text not null,
  status public.webhook_processing_status not null default 'received',
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.promotion_type not null,
  percentage_basis_points integer check (
    percentage_basis_points is null
    or percentage_basis_points between 1 and 10000
  ),
  amount_cents integer check (amount_cents is null or amount_cents > 0),
  currency text check (currency is null or currency = 'EUR'),
  minimum_subtotal_cents integer not null default 0 check (minimum_subtotal_cents >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_value_matches_type check (
    (type = 'percentage' and percentage_basis_points is not null and amount_cents is null)
    or (type = 'fixed_amount' and amount_cents is not null and percentage_basis_points is null)
    or (type = 'free_shipping' and amount_cents is null and percentage_basis_points is null)
  ),
  constraint promotions_dates_valid check (
    starts_at is null or ends_at is null or starts_at < ends_at
  )
);

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_it text not null,
  name_en text not null,
  country_codes text[] not null check (cardinality(country_codes) > 0),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.shipping_zones (id) on delete cascade,
  name_it text not null,
  name_en text not null,
  price_cents integer not null check (price_cents >= 0),
  free_over_cents integer check (free_over_cents is null or free_over_cents >= 0),
  min_delivery_days integer check (min_delivery_days is null or min_delivery_days > 0),
  max_delivery_days integer check (max_delivery_days is null or max_delivery_days > 0),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipping_rates_delivery_range check (
    min_delivery_days is null
    or max_delivery_days is null
    or min_delivery_days <= max_delivery_days
  )
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'it' check (locale in ('it', 'en')),
  status public.subscriber_status not null default 'pending',
  consent_source text not null,
  consent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  resend_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_translations (
  page_id uuid not null references public.pages (id) on delete cascade,
  locale text not null check (locale in ('it', 'en')),
  title text not null,
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  seo_title text not null default '',
  seo_description text not null default '',
  primary key (page_id, locale)
);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique check (source_path like '/%'),
  destination_path text not null check (destination_path like '/%'),
  permanent boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_logs_resource_idx
on public.audit_logs (resource_type, resource_id, created_at desc);

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();
create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();
create trigger checkout_attempts_set_updated_at
before update on public.checkout_attempts
for each row execute function public.set_updated_at();
create trigger shipments_set_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();
create trigger promotions_set_updated_at
before update on public.promotions
for each row execute function public.set_updated_at();
create trigger shipping_zones_set_updated_at
before update on public.shipping_zones
for each row execute function public.set_updated_at();
create trigger shipping_rates_set_updated_at
before update on public.shipping_rates
for each row execute function public.set_updated_at();
create trigger newsletter_subscribers_set_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();
create trigger pages_set_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_addresses enable row level security;
alter table public.checkout_attempts enable row level security;
alter table public.shipments enable row level security;
alter table public.order_status_history enable row level security;
alter table public.webhook_events enable row level security;
alter table public.promotions enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.pages enable row level security;
alter table public.page_translations enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_logs enable row level security;

create policy addresses_own_all
on public.addresses for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy carts_own_all
on public.carts for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy cart_items_own_all
on public.cart_items for all to authenticated
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  )
);

create policy wishlist_items_own_all
on public.wishlist_items for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy orders_select_own
on public.orders for select to authenticated
using (user_id = auth.uid());

create policy orders_admin_all
on public.orders for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy order_items_select_own
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);

create policy order_items_admin_all
on public.order_items for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy order_addresses_select_own
on public.order_addresses for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_addresses.order_id and orders.user_id = auth.uid()
  )
);

create policy order_addresses_admin_all
on public.order_addresses for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy checkout_attempts_admin_select
on public.checkout_attempts for select to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy shipments_select_own
on public.shipments for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = shipments.order_id and orders.user_id = auth.uid()
  )
);

create policy shipments_admin_all
on public.shipments for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy order_status_history_select_own
on public.order_status_history for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_status_history.order_id and orders.user_id = auth.uid()
  )
);

create policy order_status_history_admin_all
on public.order_status_history for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy webhook_events_admin_select
on public.webhook_events for select to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy promotions_admin_all
on public.promotions for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy shipping_zones_public_select
on public.shipping_zones for select to anon, authenticated
using (active);

create policy shipping_zones_admin_all
on public.shipping_zones for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy shipping_rates_public_select
on public.shipping_rates for select to anon, authenticated
using (
  active
  and exists (
    select 1 from public.shipping_zones
    where shipping_zones.id = shipping_rates.zone_id and shipping_zones.active
  )
);

create policy shipping_rates_admin_all
on public.shipping_rates for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy newsletter_subscribers_admin_all
on public.newsletter_subscribers for all to authenticated
using (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
);

create policy pages_public_select
on public.pages for select to anon, authenticated
using (published);

create policy pages_admin_all
on public.pages for all to authenticated
using (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
);

create policy page_translations_public_select
on public.page_translations for select to anon, authenticated
using (
  exists (
    select 1 from public.pages
    where pages.id = page_translations.page_id and pages.published
  )
);

create policy page_translations_admin_all
on public.page_translations for all to authenticated
using (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
);

create policy redirects_public_select
on public.redirects for select to anon, authenticated
using (active);

create policy redirects_admin_all
on public.redirects for all to authenticated
using (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'editor']::public.admin_role[])
);

create policy audit_logs_owner_select
on public.audit_logs for select to authenticated
using (public.has_admin_role(array['owner']::public.admin_role[]));

grant select on public.shipping_zones, public.shipping_rates, public.pages,
  public.page_translations, public.redirects to anon, authenticated;

grant select, insert, update, delete on
  public.addresses,
  public.carts,
  public.cart_items,
  public.wishlist_items,
  public.orders,
  public.order_items,
  public.order_addresses,
  public.checkout_attempts,
  public.shipments,
  public.order_status_history,
  public.webhook_events,
  public.promotions,
  public.shipping_zones,
  public.shipping_rates,
  public.newsletter_subscribers,
  public.pages,
  public.page_translations,
  public.redirects,
  public.audit_logs
to authenticated;

grant all on
  public.addresses,
  public.carts,
  public.cart_items,
  public.wishlist_items,
  public.orders,
  public.order_items,
  public.order_addresses,
  public.checkout_attempts,
  public.shipments,
  public.order_status_history,
  public.webhook_events,
  public.promotions,
  public.shipping_zones,
  public.shipping_rates,
  public.newsletter_subscribers,
  public.pages,
  public.page_translations,
  public.redirects,
  public.audit_logs
to service_role;

commit;
