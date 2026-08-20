begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.admin_role as enum (
    'owner',
    'catalog_manager',
    'order_manager',
    'editor'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.product_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.product_category as enum (
    'necklaces',
    'earrings',
    'rings',
    'bracelets',
    'accessories'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.catalog_content_status as enum ('verified', 'mock');
exception
  when duplicate_object then null;
end
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'it' check (preferred_locale in ('it', 'en')),
  newsletter_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, preferred_locale)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'locale' = 'en' then 'en'
      else 'it'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.has_admin_role(
  allowed_roles public.admin_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = auth.uid()
      and role = any (allowed_roles)
  );
$$;

revoke all on function public.has_admin_role(public.admin_role[]) from public;
grant execute on function public.has_admin_role(public.admin_role[]) to authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.product_status not null default 'draft',
  category public.product_category not null,
  content_status public.catalog_content_status not null default 'verified',
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  is_new boolean not null default false,
  source_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_published_at_required check (
    status <> 'published' or published_at is not null
  )
);

create table public.product_translations (
  product_id uuid not null references public.products (id) on delete cascade,
  locale text not null check (locale in ('it', 'en')),
  name text not null check (length(trim(name)) > 0),
  short_description text not null default '',
  description text not null default '',
  materials text,
  measurements text,
  care text,
  seo_title text not null default '',
  seo_description text not null default '',
  primary key (product_id, locale)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique check (length(trim(sku)) > 0),
  name_it text not null default 'Unica',
  name_en text not null default 'One size',
  options jsonb not null default '{}'::jsonb check (jsonb_typeof(options) = 'object'),
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (
    compare_at_price_cents is null or compare_at_price_cents > price_cents
  ),
  currency text not null default 'EUR' check (currency = 'EUR'),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  low_stock_threshold integer not null default 2 check (low_stock_threshold >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind text not null default 'image' check (kind in ('image', 'video')),
  media_url text not null,
  alt_it text not null default '',
  alt_en text not null default '',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  position integer not null default 0 check (position >= 0),
  source_kind text,
  source_url text,
  unique (product_id, position)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  published boolean not null default false,
  position integer not null default 0 check (position >= 0),
  hero_media_url text,
  hero_alt_it text not null default '',
  hero_alt_en text not null default '',
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_translations (
  collection_id uuid not null references public.collections (id) on delete cascade,
  locale text not null check (locale in ('it', 'en')),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  primary key (collection_id, locale)
);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  primary key (product_id, collection_id)
);

create index products_public_catalog_idx
on public.products (category, featured, published_at desc)
where status = 'published';

create index products_tags_idx on public.products using gin (tags);

create index product_translations_search_idx
on public.product_translations
using gin (
  to_tsvector(
    'simple',
    name || ' ' || short_description || ' ' || description
  )
);

create index product_variants_product_idx
on public.product_variants (product_id)
where active;

create index product_media_product_position_idx
on public.product_media (product_id, position);

create index product_collections_collection_position_idx
on public.product_collections (collection_id, position);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.collections enable row level security;
alter table public.collection_translations enable row level security;
alter table public.product_collections enable row level security;

create policy profiles_select_own
on public.profiles for select to authenticated
using (id = auth.uid());

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_admin_select
on public.profiles for select to authenticated
using (
  public.has_admin_role(array['owner', 'order_manager']::public.admin_role[])
);

create policy admin_roles_select_own_or_owner
on public.admin_roles for select to authenticated
using (
  user_id = auth.uid()
  or public.has_admin_role(array['owner']::public.admin_role[])
);

create policy admin_roles_owner_insert
on public.admin_roles for insert to authenticated
with check (public.has_admin_role(array['owner']::public.admin_role[]));

create policy admin_roles_owner_update
on public.admin_roles for update to authenticated
using (public.has_admin_role(array['owner']::public.admin_role[]))
with check (public.has_admin_role(array['owner']::public.admin_role[]));

create policy admin_roles_owner_delete
on public.admin_roles for delete to authenticated
using (public.has_admin_role(array['owner']::public.admin_role[]));

create policy products_public_select
on public.products for select to anon, authenticated
using (status = 'published');

create policy products_admin_select
on public.products for select to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
);

create policy products_catalog_admin_insert
on public.products for insert to authenticated
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
);

create policy products_catalog_admin_update
on public.products for update to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
);

create policy products_catalog_admin_delete
on public.products for delete to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
);

create policy product_translations_public_select
on public.product_translations for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_translations.product_id
      and products.status = 'published'
  )
);

create policy product_translations_admin_all
on public.product_translations for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
);

create policy product_variants_public_select
on public.product_variants for select to anon, authenticated
using (
  active
  and exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and products.status = 'published'
  )
);

create policy product_variants_catalog_admin_all
on public.product_variants for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
);

create policy product_media_public_select
on public.product_media for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_media.product_id
      and products.status = 'published'
  )
);

create policy product_media_catalog_admin_all
on public.product_media for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
);

create policy collections_public_select
on public.collections for select to anon, authenticated
using (published);

create policy collections_admin_all
on public.collections for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
);

create policy collection_translations_public_select
on public.collection_translations for select to anon, authenticated
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_translations.collection_id
      and collections.published
  )
);

create policy collection_translations_admin_all
on public.collection_translations for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager', 'editor']::public.admin_role[]
  )
);

create policy product_collections_public_select
on public.product_collections for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_collections.product_id
      and products.status = 'published'
  )
  and exists (
    select 1 from public.collections
    where collections.id = product_collections.collection_id
      and collections.published
  )
);

create policy product_collections_catalog_admin_all
on public.product_collections for all to authenticated
using (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
)
with check (
  public.has_admin_role(
    array['owner', 'catalog_manager']::public.admin_role[]
  )
);

grant select on
  public.products,
  public.product_translations,
  public.product_variants,
  public.product_media,
  public.collections,
  public.collection_translations,
  public.product_collections
to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.admin_roles,
  public.products,
  public.product_translations,
  public.product_variants,
  public.product_media,
  public.collections,
  public.collection_translations,
  public.product_collections
to authenticated;

commit;
