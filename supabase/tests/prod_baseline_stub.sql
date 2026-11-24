-- Reconstrucción MÍNIMA del esquema de producción (leído por MCP el 2026-11-24)
-- para probar las migraciones del wallet en un Postgres local SIN Supabase.
-- No sustituye `supabase start`: no incluye PostgREST, GoTrue ni Realtime.

do $$ begin
  create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema public, auth to anon, authenticated, service_role;
-- Supabase concede ALL por defecto sobre objetos nuevos de public:
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

create type public.user_role      as enum ('admin', 'partner');
create type public.esim_type      as enum ('prepago', 'dataonly');
create type public.order_status   as enum ('pending_review','scheduled','qr_sent','activated','cancelled');

create table public.agencies (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  active boolean default true, created_at timestamptz default now());
create table public.users (
  id uuid primary key references auth.users(id), agency_id uuid references public.agencies(id),
  role public.user_role not null default 'partner', full_name text not null, active boolean default true,
  must_change_password boolean default false, email text, password_reset_token text, password_reset_expires timestamptz);
create table public.tariffs (
  id uuid primary key default gen_random_uuid(), name text not null, type public.esim_type not null,
  data_gb integer not null, validity_days integer, badge text, highlight boolean default false,
  active boolean default true, price_usd numeric);
create table public.agency_pricing (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id), tariff_id uuid not null references public.tariffs(id),
  cost_price numeric not null, pvp numeric not null, unique (agency_id, tariff_id));
create table public.orders (
  id uuid primary key default gen_random_uuid(), order_ref text unique not null,
  agency_id uuid not null references public.agencies(id), seller_id uuid not null references public.users(id),
  tariff_id uuid not null references public.tariffs(id), type public.esim_type not null,
  customer_name text not null, customer_lastname text not null, customer_passport text not null,
  customer_nationality text not null default 'Argentina', customer_dob date not null, customer_email text not null,
  activation_date date, status public.order_status not null default 'pending_review',
  pvp_at_time numeric not null, cost_at_time numeric not null, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  activation_string text, confirmation_code text);

create or replace function public.update_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create or replace function public.get_user_agency() returns uuid language sql security definer as $$
  select agency_id from users where id = auth.uid(); $$;
create or replace function public.get_user_role() returns text language sql security definer as $$
  select role::text from users where id = auth.uid(); $$;

alter table public.agencies       enable row level security;
alter table public.users          enable row level security;
alter table public.tariffs        enable row level security;
alter table public.agency_pricing enable row level security;
alter table public.orders         enable row level security;

create policy agencies_admin_all     on public.agencies for all using (get_user_role() = 'admin');
create policy agencies_partner_own   on public.agencies for select using (id = get_user_agency());
create policy pricing_admin_all      on public.agency_pricing for all using (get_user_role() = 'admin');
create policy pricing_partner_own    on public.agency_pricing for select using (agency_id = get_user_agency());
create policy orders_admin_all       on public.orders for all using (get_user_role() = 'admin');
create policy orders_partner_insert  on public.orders for insert with check (agency_id = get_user_agency());
create policy orders_partner_select  on public.orders for select using (agency_id = get_user_agency());
create policy tariffs_admin_all      on public.tariffs for all using (get_user_role() = 'admin');
create policy tariffs_partner_read   on public.tariffs for select using (get_user_role() = 'partner' and active = true);
create policy users_admin_all        on public.users for all using (get_user_role() = 'admin');
create policy users_partner_own      on public.users for select using (id = auth.uid());

create trigger orders_updated_at before update on public.orders
  for each row execute function update_updated_at();
