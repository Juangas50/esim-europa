-- ============================================================
-- RUTA34 Telecom — Campo position para ordenar tarifas en la home
-- 1 = más a la izquierda, 5 = más a la derecha
-- Planes sin position se muestran al final ordenados por precio.
-- ============================================================

ALTER TABLE public.tariffs
  ADD COLUMN IF NOT EXISTS position integer
    CHECK (position BETWEEN 1 AND 10);

COMMENT ON COLUMN public.tariffs.position IS
  'Posición en la home (1 = izquierda, 5 = derecha). Nulo = al final por precio. Determina también la talla S/M/L/XL/XXL.';
