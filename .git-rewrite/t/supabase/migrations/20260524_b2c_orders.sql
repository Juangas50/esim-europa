-- ============================================================
-- RUTA34 Telecom — B2C Orders
-- Corre en la misma instancia Supabase que el portal B2B.
-- Las columnas tariff_id referencian la tabla `tariffs` existente.
-- ============================================================

-- Tabla principal de pedidos B2C
create table if not exists b2c_orders (
  id              uuid primary key default gen_random_uuid(),
  order_ref       text unique not null,                    -- e.g. R34-ABC123-XY9Z
  tariff_id       uuid references tariffs(id),             -- plan comprado
  customer_name   text not null,
  customer_lastname text not null,
  customer_email  text not null,
  customer_country text not null,                          -- código ISO: AR, UY, CL, BR…
  activation_date date,                                    -- null = activar lo antes posible
  status          text not null default 'pending_payment'
                    check (status in (
                      'pending_payment',
                      'paid',
                      'processing',
                      'qr_sent',
                      'active',
                      'expired',
                      'cancelled'
                    )),
  payment_method  text check (payment_method in ('stripe', 'mercadopago')),
  payment_id      text,                                    -- session ID de Stripe / MP
  amount_usd      numeric(10, 2),
  qr_sent_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices para las consultas más comunes desde el portal B2B
create index if not exists b2c_orders_email_idx     on b2c_orders (customer_email);
create index if not exists b2c_orders_status_idx    on b2c_orders (status);
create index if not exists b2c_orders_created_idx   on b2c_orders (created_at desc);
create index if not exists b2c_orders_tariff_idx    on b2c_orders (tariff_id);

-- Auto-actualizar updated_at en cada UPDATE
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger b2c_orders_updated_at
  before update on b2c_orders
  for each row execute procedure update_updated_at();

-- Row Level Security: el anon key NO puede leer pedidos ajenos.
-- El service_role (usado en webhooks/API) tiene acceso total.
alter table b2c_orders enable row level security;

-- Solo el service_role bypasea RLS (comportamiento por defecto en Supabase).
-- Si en el futuro añadís auth de clientes, añadí una policy aquí.
