# Wallet prepago de agencias: orden de despliegue

Migraciones (en `supabase/migrations/`, se aplican a mano, nunca con el MCP en producción):

1. `20261124000001_order_status_in_management.sql`: valor nuevo `in_management` del enum.
2. `20261124000002_agency_wallet.sql`: tablas, funciones, RLS. **Compatible con la app actual**: todas las agencias existentes quedan `postpaid` y la política de inserción directa sigue activa.
3. `20261124000003_drop_partner_order_insert.sql`: quita la política `orders_partner_insert`. **Solo después de desplegar la app nueva**, porque la app anterior inserta pedidos directamente.

Orden seguro (sin ventana de fallo):

1. Aplicar 1 y 2 (prueba antes en local: `supabase/tests/`).
2. Desplegar la app (merge del PR a `main`).
3. Comprobar una venta de una agencia postpago y una prepago.
4. Aplicar 3.

Antes de que una agencia use el wallet:

- Admin → Tarifas: cargar el **costo de Vodafone** de cada tarifa (si falta, la venta funciona pero el margen no se calcula).
- Admin → Agencias → Wallet: pasarla a **Prepago** y registrar la primera recarga (previa confirmación del pago); luego adjuntar la factura emitida en Qonto.

Realtime: la migración 2 añade `agency_wallets` y `wallet_movements` a la publicación `supabase_realtime`. Si no se ve el saldo en vivo, revisar Database → Replication.

## Pruebas SQL locales (sin Supabase)

`supabase/tests/prod_baseline_stub.sql` reconstruye el esquema de producción mínimo y simula los roles de Supabase.
`supabase/tests/wallet_test.sql` ejecuta 61 comprobaciones (RLS, saldo, cancelaciones, anulaciones, aislamiento entre agencias).
No cubre PostgREST, Realtime ni la interfaz: para eso hace falta `supabase start` con un volcado real del esquema (`supabase db dump --schema public`).
