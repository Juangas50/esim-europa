-- ============================================================
-- RUTA34 Telecom — Locale del cliente (ES/PT)
-- El locale elegido en el checkout se perdía después del webhook
-- (no viajaba a b2c_orders ni a session.metadata de Stripe), así
-- que toda comunicación posterior (cron, reprogramación) hardcodeaba
-- /es/. Esta columna persiste el locale real para usarlo como fuente
-- de verdad en la generación de URLs del lifecycle.
-- Default 'es' para filas existentes: preserva el comportamiento
-- actual (hardcode /es/) para pedidos ya creados antes de esta migración.
-- ============================================================

alter table public.b2c_orders
  add column if not exists locale text not null default 'es'
    check (locale in ('es', 'pt'));

comment on column public.b2c_orders.locale is
  'Locale elegido por el cliente en el checkout (es/pt). Fuente de verdad para el prefijo de idioma de las URLs generadas post-compra (reprogramación, etc). No se traduce el copy de los emails en esta fase.';
