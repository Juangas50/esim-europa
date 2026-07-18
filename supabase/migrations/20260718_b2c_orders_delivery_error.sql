-- ============================================================
-- RUTA34 Telecom — Estado de error de entrega para b2c_orders
-- Antes, si fallaba la generación/subida del QR, el email se
-- enviaba igual (o el fallo quedaba silencioso). Ahora ese fallo
-- debe abortar el envío y dejar el pedido en un estado visible
-- para el admin, con el motivo guardado.
-- ============================================================

-- 'error': el pedido quedó sin poder generar/entregar el QR y
-- necesita revisión manual antes de reintentar.
alter table public.b2c_orders drop constraint if exists b2c_orders_status_check;
alter table public.b2c_orders add constraint b2c_orders_status_check
  check (status in (
    'pending_payment',
    'paid',
    'processing',
    'qr_sent',
    'active',
    'expired',
    'cancelled',
    'error'
  ));

alter table public.b2c_orders
  add column if not exists delivery_error text;

comment on column public.b2c_orders.delivery_error is
  'Último error de generación/subida de QR o envío de entrega. NULL si no hubo fallos o si se resolvió.';
