-- ============================================================
-- RUTA34 — Las agencias ya no insertan pedidos directamente
--
-- APLICAR SOLO DESPUÉS de desplegar la versión de la app que crea pedidos con
-- create_agency_order() (migración 20261124000002).
--
-- Antes: orders_partner_insert permitía a cualquier agencia insertar pedidos con
-- cost_at_time / status arbitrarios vía API, saltándose el descuento de saldo.
-- ============================================================
drop policy if exists orders_partner_insert on public.orders;
