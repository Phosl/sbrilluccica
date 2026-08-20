begin;

do $$
begin
  create type public.store_credit_transaction_type as enum (
    'issue',
    'redeem',
    'refund',
    'adjustment'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.store_credit_reservation_status as enum (
    'active',
    'released',
    'committed',
    'expired'
  );
exception
  when duplicate_object then null;
end
$$;

create table public.store_credit_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  customer_email text not null,
  currency text not null default 'EUR' check (currency = 'EUR'),
  balance_cents integer not null default 0 check (balance_cents >= 0),
  reserved_cents integer not null default 0 check (reserved_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_credit_reserve_within_balance check (
    reserved_cents <= balance_cents
  )
);

create unique index store_credit_accounts_user_idx
on public.store_credit_accounts (user_id)
where user_id is not null;

create unique index store_credit_accounts_email_idx
on public.store_credit_accounts (lower(customer_email));

create table public.store_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.store_credit_accounts (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  type public.store_credit_transaction_type not null,
  amount_delta_cents integer not null check (amount_delta_cents <> 0),
  balance_after_cents integer not null check (balance_after_cents >= 0),
  reference_key text not null unique,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index store_credit_transactions_account_created_idx
on public.store_credit_transactions (account_id, created_at desc);

create table public.store_credit_reservations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.store_credit_accounts (id) on delete restrict,
  checkout_attempt_id uuid not null references public.checkout_attempts (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  status public.store_credit_reservation_status not null default 'active',
  expires_at timestamptz not null,
  release_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, checkout_attempt_id)
);

create index store_credit_reservations_expiry_idx
on public.store_credit_reservations (expires_at)
where status = 'active';

create trigger store_credit_accounts_set_updated_at
before update on public.store_credit_accounts
for each row execute function public.set_updated_at();

create trigger store_credit_reservations_set_updated_at
before update on public.store_credit_reservations
for each row execute function public.set_updated_at();

alter table public.store_credit_accounts enable row level security;
alter table public.store_credit_transactions enable row level security;
alter table public.store_credit_reservations enable row level security;

create policy store_credit_accounts_select_own
on public.store_credit_accounts for select to authenticated
using (user_id = auth.uid());

create policy store_credit_accounts_admin_all
on public.store_credit_accounts for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy store_credit_transactions_select_own
on public.store_credit_transactions for select to authenticated
using (
  exists (
    select 1 from public.store_credit_accounts
    where store_credit_accounts.id = store_credit_transactions.account_id
      and store_credit_accounts.user_id = auth.uid()
  )
);

create policy store_credit_transactions_admin_all
on public.store_credit_transactions for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy store_credit_reservations_select_own
on public.store_credit_reservations for select to authenticated
using (
  exists (
    select 1 from public.store_credit_accounts
    where store_credit_accounts.id = store_credit_reservations.account_id
      and store_credit_accounts.user_id = auth.uid()
  )
);

create policy store_credit_reservations_admin_all
on public.store_credit_reservations for all to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
)
with check (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

grant select, insert, update, delete on public.store_credit_accounts,
  public.store_credit_transactions, public.store_credit_reservations
to authenticated;

grant all on public.store_credit_accounts, public.store_credit_transactions,
  public.store_credit_reservations to service_role;

commit;
