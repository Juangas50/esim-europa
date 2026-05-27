-- ============================================================
-- RUTA34 Telecom — Columnas B2C en tabla tariffs existente
-- Agrega los campos que la web B2C necesita para mostrar
-- precios, zona geográfica y días de activación.
-- Ejecutar una sola vez en la misma instancia que el portal B2B.
-- ============================================================

-- Precio en USD (necesario para Stripe y para mostrar en la web)
ALTER TABLE public.tariffs
  ADD COLUMN IF NOT EXISTS price_usd numeric(10, 2);

-- Zona geográfica: 'espana' (solo España) | 'europa' (multi-país)
ALTER TABLE public.tariffs
  ADD COLUMN IF NOT EXISTS zone text
    CHECK (zone IN ('espana', 'europa'))
    DEFAULT 'europa';

-- Cuántos países cubre el plan
ALTER TABLE public.tariffs
  ADD COLUMN IF NOT EXISTS countries_count integer DEFAULT 30;

-- Días desde la compra para poder activar la eSIM
-- (prepago típico: 365 días | dataonly: 60 días)
ALTER TABLE public.tariffs
  ADD COLUMN IF NOT EXISTS activation_days integer DEFAULT 365;

-- Comentarios para el equipo
COMMENT ON COLUMN public.tariffs.price_usd IS 'Precio de venta al público en USD (web B2C)';
COMMENT ON COLUMN public.tariffs.zone IS 'Cobertura geográfica: espana = solo España, europa = multi-país';
COMMENT ON COLUMN public.tariffs.countries_count IS 'Número de países cubiertos (se muestra en la tarjeta del plan)';
COMMENT ON COLUMN public.tariffs.activation_days IS 'Días desde la compra para activar la eSIM';
