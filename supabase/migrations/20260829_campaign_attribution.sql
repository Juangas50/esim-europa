-- ============================================================
-- RUTA34 Telecom — Atribución de campañas (colaboración Victoria Casteluchi)
--
-- /vicky (ver src/app/vicky/route.ts) redirige a /es/compra fijando una
-- cookie httpOnly de atribución. Estas columnas/tabla permiten identificar
-- qué pedidos y cuántas visitas vienen de esa colaboración, sin exponer
-- UTMs en la URL pública que comparte la influencer.
-- ============================================================

alter table public.b2c_orders
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content  text;

comment on column public.b2c_orders.utm_campaign is
  'Campaña de atribución (ej. victoria_niza) capturada en /api/checkout desde la cookie ruta34_attribution. Null = tráfico sin campaña asociada.';

create index if not exists b2c_orders_utm_campaign_idx on public.b2c_orders (utm_campaign);

-- Conteo de visitas a URLs de campaña con redirect propio (ej. /vicky).
create table if not exists public.campaign_link_visits (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,          -- ej. 'vicky'
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  created_at    timestamptz not null default now()
);

create index if not exists campaign_link_visits_slug_idx    on public.campaign_link_visits (slug);
create index if not exists campaign_link_visits_created_idx on public.campaign_link_visits (created_at desc);

-- Row Level Security: mismo criterio que b2c_orders — solo el service_role
-- (usado en app/vicky/route.ts) escribe y lee.
alter table public.campaign_link_visits enable row level security;
