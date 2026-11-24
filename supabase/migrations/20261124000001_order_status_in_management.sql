-- ============================================================
-- RUTA34 — Estado "en gestión" para pedidos B2B (agencias)
-- Cuando un admin empieza a tramitar la línea, el pedido pasa a
-- `in_management` y la agencia ya no puede cancelarlo.
--
-- Va en su propio archivo: Postgres no permite usar un valor de enum
-- recién añadido dentro de la misma transacción que lo crea.
-- ============================================================

alter type public.order_status add value if not exists 'in_management' after 'scheduled';
