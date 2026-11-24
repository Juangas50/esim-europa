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

## Probar todo en local (sin tocar producción)

Requisitos: Docker Desktop abierto y Node.

```
bash scripts/local-db.sh
```

Levanta un Supabase local con el esquema real de producción (`supabase/baseline_prod.sql`, volcado del 2026-11-24) más las migraciones 1 a 3, y carga datos de ejemplo (un admin, una agencia prepago con 500 USD y una postpago). Al final imprime lo que hay que poner en `.env.local` y los usuarios de prueba. Después: `npm install` y `npm run dev`.

Qué probar, en este orden:

1. Admin → Tarifas: ver el costo de Vodafone cargado.
2. Entrar como `prepago@ruta34.test`: ver el saldo arriba, vender una eSIM y comprobar que baja; elegir un plan que no alcance y ver el aviso; cancelar un pedido pendiente y ver que se devuelve.
3. Como admin: "Empezar a gestionar" ese pedido y comprobar que la agencia ya no ve el botón de cancelar; anular otro con motivo.
4. Entrar como `postpago@ruta34.test`: no hay wallet ni saldo en ningún sitio.
5. Admin → Agencias → Wallet: recargar y adjuntar una factura.

`baseline_prod.sql` NO va en `supabase/migrations/`: producción ya tiene ese esquema y `supabase db push` intentaría aplicarlo.

## Pruebas SQL (sin Docker)

`supabase/tests/auth_stub.sql` crea lo mínimo de Supabase (roles y `auth`) en un Postgres normal; luego se aplican `baseline_prod.sql`, las migraciones y `wallet_test.sql` (61 comprobaciones: RLS, saldo, cancelaciones, anulaciones, aislamiento entre agencias). No cubre PostgREST, Realtime ni la interfaz.
