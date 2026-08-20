begin;

do $$
begin
  create type public.inventory_reservation_status as enum (
    'active',
    'released',
    'committed',
    'expired'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.inventory_movement_type as enum (
    'adjustment',
    'sale',
    'refund',
    'restock'
  );
exception
  when duplicate_object then null;
end
$$;

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  checkout_attempt_id uuid not null references public.checkout_attempts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  quantity integer not null check (quantity > 0),
  status public.inventory_reservation_status not null default 'active',
  expires_at timestamptz not null,
  release_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (checkout_attempt_id, variant_id)
);

create index inventory_reservations_active_variant_idx
on public.inventory_reservations (variant_id, expires_at)
where status = 'active';

create index inventory_reservations_expiry_idx
on public.inventory_reservations (expires_at)
where status = 'active';

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  reservation_id uuid references public.inventory_reservations (id) on delete set null,
  type public.inventory_movement_type not null,
  quantity_delta integer not null check (quantity_delta <> 0),
  stock_after integer not null check (stock_after >= 0),
  reason text,
  idempotency_key text unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_movements_variant_created_idx
on public.inventory_movements (variant_id, created_at desc);

create trigger inventory_reservations_set_updated_at
before update on public.inventory_reservations
for each row execute function public.set_updated_at();

alter table public.inventory_reservations enable row level security;
alter table public.inventory_movements enable row level security;

create policy inventory_reservations_admin_select
on public.inventory_reservations for select to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'order_manager']::public.admin_role[]
  )
);

create policy inventory_movements_admin_select
on public.inventory_movements for select to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'order_manager']::public.admin_role[]
  )
);

grant select on public.inventory_reservations, public.inventory_movements
to authenticated;
grant all on public.inventory_reservations, public.inventory_movements
to service_role;

create or replace function public.reserve_inventory(
  p_checkout_attempt_id uuid,
  p_items jsonb,
  p_expires_at timestamptz default (now() + interval '30 minutes')
)
returns table (
  reservation_id uuid,
  variant_id uuid,
  quantity integer,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item record;
  stock_on_hand integer;
  reserved_quantity integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using
      errcode = '22023',
      message = 'Reservation items must be a non-empty JSON array.';
  end if;

  if p_expires_at <= now() or p_expires_at > now() + interval '31 minutes' then
    raise exception using
      errcode = '22023',
      message = 'Reservation expiry must be within the next 31 minutes.';
  end if;

  if not exists (
    select 1
    from public.checkout_attempts
    where id = p_checkout_attempt_id
      and status in ('created', 'open')
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Checkout attempt is not reservable.';
  end if;

  if exists (
    select 1
    from public.inventory_reservations
    where checkout_attempt_id = p_checkout_attempt_id
  ) then
    return query
    select
      inventory_reservations.id,
      inventory_reservations.variant_id,
      inventory_reservations.quantity,
      inventory_reservations.expires_at
    from public.inventory_reservations
    where checkout_attempt_id = p_checkout_attempt_id
      and status = 'active'
    order by inventory_reservations.variant_id;
    return;
  end if;

  for item in
    select
      parsed.variant_id,
      sum(parsed.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as parsed(variant_id uuid, quantity integer)
    group by parsed.variant_id
    order by parsed.variant_id
  loop
    if item.quantity is null or item.quantity <= 0 then
      raise exception using
        errcode = '22023',
        message = 'Reservation quantity must be positive.';
    end if;

    select product_variants.stock_on_hand
    into stock_on_hand
    from public.product_variants
    where product_variants.id = item.variant_id
      and product_variants.active
    for update;

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'Variant is not available.';
    end if;

    select coalesce(sum(inventory_reservations.quantity), 0)::integer
    into reserved_quantity
    from public.inventory_reservations
    where inventory_reservations.variant_id = item.variant_id
      and inventory_reservations.status = 'active'
      and inventory_reservations.expires_at > now();

    if stock_on_hand - reserved_quantity < item.quantity then
      raise exception using
        errcode = 'P0001',
        message = 'Insufficient inventory.';
    end if;

    insert into public.inventory_reservations (
      checkout_attempt_id,
      variant_id,
      quantity,
      expires_at
    )
    values (
      p_checkout_attempt_id,
      item.variant_id,
      item.quantity,
      p_expires_at
    );
  end loop;

  update public.checkout_attempts
  set status = 'open'
  where id = p_checkout_attempt_id and status = 'created';

  return query
  select
    inventory_reservations.id,
    inventory_reservations.variant_id,
    inventory_reservations.quantity,
    inventory_reservations.expires_at
  from public.inventory_reservations
  where checkout_attempt_id = p_checkout_attempt_id
    and status = 'active'
  order by inventory_reservations.variant_id;
end;
$$;

create or replace function public.release_inventory_reservations(
  p_checkout_attempt_id uuid,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  released_count integer;
begin
  update public.inventory_reservations
  set
    status = 'released',
    release_reason = nullif(trim(p_reason), '')
  where checkout_attempt_id = p_checkout_attempt_id
    and status = 'active';

  get diagnostics released_count = row_count;
  return released_count;
end;
$$;

create or replace function public.commit_inventory_reservations(
  p_checkout_attempt_id uuid,
  p_order_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  reservation record;
  committed_count integer := 0;
  resulting_stock integer;
begin
  if not exists (
    select 1 from public.orders
    where id = p_order_id and payment_status = 'paid'
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'A paid order is required to commit inventory.';
  end if;

  if not exists (
    select 1
    from public.inventory_reservations
    where checkout_attempt_id = p_checkout_attempt_id
      and status = 'active'
  ) then
    select count(*)::integer
    into committed_count
    from public.inventory_reservations
    where checkout_attempt_id = p_checkout_attempt_id
      and order_id = p_order_id
      and status = 'committed';
    return committed_count;
  end if;

  for reservation in
    select id, variant_id, quantity
    from public.inventory_reservations
    where checkout_attempt_id = p_checkout_attempt_id
      and status = 'active'
    order by variant_id
    for update
  loop
    update public.product_variants
    set stock_on_hand = stock_on_hand - reservation.quantity
    where id = reservation.variant_id
      and stock_on_hand >= reservation.quantity
    returning stock_on_hand into resulting_stock;

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'Inventory changed before commit.';
    end if;

    insert into public.inventory_movements (
      variant_id,
      order_id,
      reservation_id,
      type,
      quantity_delta,
      stock_after,
      reason,
      idempotency_key
    )
    values (
      reservation.variant_id,
      p_order_id,
      reservation.id,
      'sale',
      -reservation.quantity,
      resulting_stock,
      'checkout_completed',
      format('checkout:%s:variant:%s', p_checkout_attempt_id, reservation.variant_id)
    );

    update public.inventory_reservations
    set status = 'committed', order_id = p_order_id
    where id = reservation.id;

    committed_count := committed_count + 1;
  end loop;

  update public.checkout_attempts
  set status = 'completed', order_id = p_order_id
  where id = p_checkout_attempt_id;

  return committed_count;
end;
$$;

create or replace function public.expire_inventory_reservations(
  p_now timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  expired_count integer;
begin
  update public.inventory_reservations
  set status = 'expired', release_reason = 'reservation_expired'
  where status = 'active' and expires_at <= p_now;

  get diagnostics expired_count = row_count;

  update public.checkout_attempts
  set status = 'expired'
  where status in ('created', 'open')
    and expires_at <= p_now;

  return expired_count;
end;
$$;

revoke all on function public.reserve_inventory(uuid, jsonb, timestamptz)
from public, anon, authenticated;
revoke all on function public.release_inventory_reservations(uuid, text)
from public, anon, authenticated;
revoke all on function public.commit_inventory_reservations(uuid, uuid)
from public, anon, authenticated;
revoke all on function public.expire_inventory_reservations(timestamptz)
from public, anon, authenticated;

grant execute on function public.reserve_inventory(uuid, jsonb, timestamptz)
to service_role;
grant execute on function public.release_inventory_reservations(uuid, text)
to service_role;
grant execute on function public.commit_inventory_reservations(uuid, uuid)
to service_role;
grant execute on function public.expire_inventory_reservations(timestamptz)
to service_role;

commit;
