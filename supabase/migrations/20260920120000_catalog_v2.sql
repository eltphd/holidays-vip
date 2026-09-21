-- holidayz.vip Catalog Dev Build v1 — Whole Table + Wellness Season
-- Additive only. Leaves holidayz_waitlist untouched. Extends holidayz_orders
-- (already written by the Winter Light webhook) instead of adding a second orders table.

create table if not exists public.catalog_categories (
  id            text primary key,          -- 'winter-light' | 'whole-table' | 'wellness-season'
  display_name  text not null,
  tagline       text,
  season_start  date,
  season_end    date,
  sort_order    int  not null default 0,
  status        text not null default 'draft'
    check (status in ('draft','audit','live','archived')),
  category_rules text[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table if not exists public.catalog_kits (
  id               text primary key,        -- 'wt-open-house'
  category_id      text not null references public.catalog_categories(id),
  display_name     text not null,
  format           text not null check (format in ('make','practice','bundle')),
  domain           text,                    -- Wellness Season only
  audience         text[] not null default '{}',
  summary          text,
  contents         jsonb not null default '[]',   -- ordered list of components (or kit ids for bundles)
  design_standards jsonb not null default '{}',   -- six standards → how satisfied (text)
  asks             jsonb not null default '{}',   -- {"minutes": int, "sensory": text, "low_demand": text}
  lens_available   boolean not null default false,
  audit_owners     text[] not null default '{}',
  audit_status     text not null default 'draft'
    check (audit_status in ('draft','round1','revising','round2','approved','live')),
  deliver_by       date,
  fallback_tier    int,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.catalog_skus (
  id                  text primary key,     -- 'wt-open-house-digital'
  kit_id              text not null references public.catalog_kits(id),
  delivery            text not null check (delivery in ('digital','print','print-digital')),
  lens                text check (lens in ('affirming')),   -- null = base
  price_cents         int not null,
  currency            text not null default 'usd',
  stripe_product_name text,                 -- must be neutral for Whole Table + lens SKUs
  stripe_product_id   text,
  stripe_price_id     text,
  stripe_payment_link text,                 -- plink_… once created
  stripe_payment_url  text,                 -- https://buy.stripe.com/… (what the buy button uses)
  file_name           text,                 -- delivered file name; neutral for discreet SKUs
  status              text not null default 'hidden'
    check (status in ('hidden','preorder','live','retired')),
  deliver_by          date,
  created_at          timestamptz not null default now()
);

create index if not exists catalog_kits_category_idx on public.catalog_kits(category_id, sort_order);
create index if not exists catalog_skus_kit_idx on public.catalog_skus(kit_id);

create table if not exists public.auditors (
  id                  uuid primary key default gen_random_uuid(),
  handle              text not null,        -- first name or chosen name only
  lens_roles          text[] not null,      -- {'older-adult','adolescent','adult','gay-married','lesbian','trans','parent'}
  consent_signed_at   timestamptz,
  is_minor            boolean not null default false,
  guardian_consent_at timestamptz,
  compensation        text check (compensation in ('honorarium','kit-credit','declined')),
  credit_choice       text not null default 'anonymous'
    check (credit_choice in ('named','first-name','anonymous')),
  credit_name         text,                 -- what appears on /community-builders when credit_choice = 'named'
  contact_ref         text,                 -- pointer into Erica's private sheet, never the email
  created_at          timestamptz not null default now()
);

create table if not exists public.audit_reviews (
  id           uuid primary key default gen_random_uuid(),
  kit_id       text not null references public.catalog_kits(id),
  auditor_id   uuid not null references public.auditors(id),
  round        int  not null check (round in (1,2)),
  rubric       jsonb not null,              -- {"safety_first": 0|1|2, ...}
  blocking     boolean not null default false,
  notes        text,
  submitted_at timestamptz not null default now()
);

-- A review is blocking when any rubric item scores 0.
create or replace function public.audit_reviews_set_blocking()
returns trigger language plpgsql as $$
begin
  new.blocking := exists (
    select 1 from jsonb_each(new.rubric) as r(key, value)
    where jsonb_typeof(r.value) = 'number' and (r.value)::int = 0
  );
  return new;
end $$;

drop trigger if exists audit_reviews_blocking on public.audit_reviews;
create trigger audit_reviews_blocking
  before insert or update on public.audit_reviews
  for each row execute function public.audit_reviews_set_blocking();

-- Minor auditors need guardian consent before a review is accepted.
create or replace function public.audit_reviews_check_consent()
returns trigger language plpgsql as $$
declare a public.auditors;
begin
  select * into a from public.auditors where id = new.auditor_id;
  if a.consent_signed_at is null then
    raise exception 'auditor % has not signed consent', new.auditor_id;
  end if;
  if a.is_minor and a.guardian_consent_at is null then
    raise exception 'auditor % is a minor without guardian consent', new.auditor_id;
  end if;
  return new;
end $$;

drop trigger if exists audit_reviews_consent on public.audit_reviews;
create trigger audit_reviews_consent
  before insert on public.audit_reviews
  for each row execute function public.audit_reviews_check_consent();

-- Orders: extend the existing table the Winter Light webhook already writes.
alter table public.holidayz_orders
  add column if not exists category_id  text,
  add column if not exists lens         text check (lens in ('affirming')),
  add column if not exists discreet     boolean not null default false,
  add column if not exists deliver_by   date,
  add column if not exists delivered_at timestamptz;

create index if not exists holidayz_orders_deliver_idx
  on public.holidayz_orders(deliver_by) where delivered_at is null;

-- RLS
alter table public.catalog_categories enable row level security;
alter table public.catalog_kits       enable row level security;
alter table public.catalog_skus       enable row level security;
alter table public.auditors           enable row level security;
alter table public.audit_reviews      enable row level security;

-- Catalog: anonymous/public read only for live rows. The site renders server-side
-- with the service role so dark/pre-order pages can show non-live rows behind the flag.
drop policy if exists "public read live categories" on public.catalog_categories;
create policy "public read live categories" on public.catalog_categories
  for select to anon, authenticated using (status = 'live');

drop policy if exists "public read live kits" on public.catalog_kits;
create policy "public read live kits" on public.catalog_kits
  for select to anon, authenticated using (audit_status = 'live');

drop policy if exists "public read live skus" on public.catalog_skus;
create policy "public read live skus" on public.catalog_skus
  for select to anon, authenticated using (status = 'live');

-- auditors and audit_reviews: no policies → service role only.

comment on table public.catalog_categories is 'holidayz.vip catalog categories (Winter Light, Whole Table, Wellness Season).';
comment on table public.catalog_kits is 'holidayz.vip kits. audit_status gates the community audit flow (round1 → revising → round2 → approved → live).';
comment on table public.catalog_skus is 'holidayz.vip purchasable SKUs; one Stripe payment link per row. lens = affirming variants.';
comment on table public.auditors is 'Community builders. Handle + roles only — contact details live in Erica''s private sheet. Service role only.';
comment on table public.audit_reviews is 'Per-kit, per-auditor rubric scores. Any 0 is blocking. Service role only.';
