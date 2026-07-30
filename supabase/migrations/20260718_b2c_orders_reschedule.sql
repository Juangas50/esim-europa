-- ============================================================
-- RUTA34 Telecom — Reprogramación de activación (autoservicio B2C)
-- Token único por pedido para el link de "cambiar fecha" en el email
-- de recordatorio 24h-antes, + marca de si ya se envió ese recordatorio
-- (para que el cron diario no lo reenvíe).
-- ============================================================

alter table public.b2c_orders
  add column if not exists reschedule_token uuid not null default gen_random_uuid(),
  add column if not exists reminder_sent_at timestamptz;

create unique index if not exists b2c_orders_reschedule_token_idx
  on public.b2c_orders (reschedule_token);

comment on column public.b2c_orders.reschedule_token is
  'Token opaco para el link público de reprogramación (nunca reutilizar el id del pedido, que aparece en URLs de admin).';
comment on column public.b2c_orders.reminder_sent_at is
  'Timestamp del recordatorio 24h-antes enviado por el cron diario. Se resetea a null si el cliente reprograma la fecha, para que se dispare un nuevo recordatorio.';
