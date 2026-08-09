-- ============================================================
-- RUTA34 Telecom — B2C: pasaporte y fecha de nacimiento
--
-- El formulario de compra pide ambos datos como obligatorios desde el día uno
-- (src/components/purchase/StepData.tsx), pero se perdían en el navegador: el
-- POST a /api/checkout nunca los enviaba y la tabla no tenía dónde guardarlos.
-- Resultado: todo pedido B2C anterior a esta migración tiene ambos campos en
-- null y el dato NO es recuperable — nunca llegó al servidor. Para regularizar
-- el histórico hay que pedírselo al cliente por email.
--
-- Nullable a propósito: las filas ya existentes no pueden completarse, así que
-- un NOT NULL rompería la tabla. La obligatoriedad se valida en el checkout.
-- ============================================================

alter table public.b2c_orders
  add column if not exists customer_passport text,
  add column if not exists customer_dob      date;

comment on column public.b2c_orders.customer_passport is
  'N° de pasaporte del titular. Requisito para registrar la línea española. Null en pedidos previos a 2026-08-09.';

comment on column public.b2c_orders.customer_dob is
  'Fecha de nacimiento del titular. El checkout exige +18. Null en pedidos previos a 2026-08-09.';
