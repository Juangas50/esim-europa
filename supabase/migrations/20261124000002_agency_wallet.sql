-- ============================================================
-- RUTA34 — Wallet prepago para agencias (B2B)
--
-- Modelo:
--   * agencies.billing_model = 'prepaid' | 'postpaid' (default postpaid: no cambia
--     nada para las agencias existentes).
--   * Solo las agencias prepago tienen fila en agency_wallets.
--   * Todo movimiento de saldo queda en wallet_movements (solo inserción).
--   * Toda escritura de saldo/pedidos pasa por funciones SECURITY DEFINER;
--     los clientes (anon/authenticated) no pueden insertar pedidos ni tocar saldo.
--   * El costo de Vodafone vive en tablas SOLO ADMIN (las políticas RLS son por
--     fila: una columna nueva en orders/tariffs sería legible por las agencias).
-- ============================================================

-- ── 0. Endurecer helpers de RLS existentes (SECURITY DEFINER sin search_path) ──
alter function public.get_user_role()   set search_path = public, pg_temp;
alter function public.get_user_agency() set search_path = public, pg_temp;

-- ── 1. Agencias: modelo de facturación ────────────────────────────────────────
alter table public.agencies
  add column if not exists billing_model text not null default 'postpaid';
alter table public.agencies
  add constraint agencies_billing_model_check check (billing_model in ('prepaid', 'postpaid'));

-- ── 2. Pedidos: marcas de gestión / cancelación ───────────────────────────────
alter table public.orders
  add column if not exists management_started_at timestamptz,
  -- OJO: sin REFERENCES a users. `orders` ya tiene seller_id -> users; una 2ª/3ª clave foránea a la
  -- misma tabla hace ambiguo el embed `users(full_name)` de PostgREST (PGRST201) y rompe las
  -- consultas existentes (p. ej. /admin/pedidos). El actor queda además en admin_audit_log.
  add column if not exists management_started_by uuid,
  add column if not exists cancelled_at          timestamptz,
  add column if not exists cancelled_by          uuid;

-- ── 3. (Movido) la política orders_partner_insert se elimina en
--       20261124000003_drop_partner_order_insert.sql, que se aplica DESPUÉS de
--       desplegar el código nuevo: hasta entonces la app actual inserta pedidos
--       directamente y quitarla antes la rompería.

-- ── 4. Tablas del wallet ──────────────────────────────────────────────────────
create table public.agency_wallets (
  agency_id              uuid primary key references public.agencies(id) on delete restrict,
  balance                numeric(12,2) not null default 0 check (balance >= 0),
  low_balance_threshold  numeric(12,2) not null default 100 check (low_balance_threshold >= 0),
  low_balance_alerted_at timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger agency_wallets_updated_at
  before update on public.agency_wallets
  for each row execute function public.update_updated_at();

create table public.wallet_topups (
  id                   uuid primary key default gen_random_uuid(),
  agency_id            uuid not null references public.agencies(id),
  amount               numeric(12,2) not null check (amount > 0),
  payment_reference    text not null,
  payment_date         date not null,
  created_by           uuid not null references public.users(id),
  created_at           timestamptz not null default now(),
  -- Factura emitida en Qonto (se adjunta después de cargar el saldo)
  invoice_number       text,
  invoice_date         date,
  invoice_url          text,
  invoice_attached_at  timestamptz,
  invoice_attached_by  uuid references public.users(id)
);
create index wallet_topups_agency_idx on public.wallet_topups (agency_id, created_at desc);

create type public.wallet_movement_kind as enum
  ('topup', 'sale', 'cancel_refund', 'admin_void_refund', 'adjustment');

create table public.wallet_movements (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agencies(id),
  kind          public.wallet_movement_kind not null,
  amount        numeric(12,2) not null,            -- con signo: venta < 0, recarga/devolución > 0
  balance_after numeric(12,2) not null check (balance_after >= 0),
  order_id      uuid references public.orders(id),
  topup_id      uuid references public.wallet_topups(id),
  actor_id      uuid references public.users(id),
  created_at    timestamptz not null default now(),
  constraint wallet_movements_sign_check check (
       (kind = 'sale'  and amount < 0)
    or (kind in ('topup', 'cancel_refund', 'admin_void_refund') and amount > 0)
    or (kind = 'adjustment' and amount <> 0)
  )
);
create index wallet_movements_agency_idx on public.wallet_movements (agency_id, created_at desc);
-- Un pedido solo puede tener UNA venta y UNA devolución de cada tipo: evita descuentos/devoluciones dobles.
create unique index wallet_movements_order_kind_uq
  on public.wallet_movements (order_id, kind) where order_id is not null;
-- Y una devolución (sea cancelación o anulación) excluye a la otra.
create unique index wallet_movements_order_refund_uq
  on public.wallet_movements (order_id)
  where order_id is not null and kind in ('cancel_refund', 'admin_void_refund');

create function public._wallet_movements_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'wallet_movements es de solo inserción';
end $$;
create trigger wallet_movements_no_update_delete
  before update or delete on public.wallet_movements
  for each row execute function public._wallet_movements_immutable();

-- Costo de Vodafone (SOLO ADMIN)
create table public.tariff_costs (
  tariff_id         uuid primary key references public.tariffs(id) on delete cascade,
  vodafone_cost_usd numeric(10,2) not null check (vodafone_cost_usd >= 0),
  updated_at        timestamptz not null default now(),
  updated_by        uuid references public.users(id)
);
create table public.order_internal_costs (
  order_id          uuid primary key references public.orders(id) on delete cascade,
  vodafone_cost_usd numeric(10,2) not null,
  created_at        timestamptz not null default now()
);

-- Auditoría de acciones de admin (motivos de anulación, recargas, etc.) — SOLO ADMIN
create table public.admin_audit_log (
  id         uuid primary key default gen_random_uuid(),
  entity     text not null,
  entity_id  uuid not null,
  action     text not null,
  reason     text,
  details    jsonb,
  actor_id   uuid not null references public.users(id),
  created_at timestamptz not null default now()
);
create index admin_audit_log_entity_idx on public.admin_audit_log (entity, entity_id);

-- ── 5. RLS + privilegios ──────────────────────────────────────────────────────
alter table public.agency_wallets      enable row level security;
alter table public.wallet_topups       enable row level security;
alter table public.wallet_movements    enable row level security;
alter table public.tariff_costs        enable row level security;
alter table public.order_internal_costs enable row level security;
alter table public.admin_audit_log     enable row level security;

-- Las agencias POSTPAGO no ven nada del wallet (ni a nivel de base de datos).
create policy agency_wallets_partner_own on public.agency_wallets for select
  using (agency_id = public.get_user_agency()
         and exists (select 1 from public.agencies a where a.id = agency_id and a.billing_model = 'prepaid'));
create policy wallet_topups_partner_own on public.wallet_topups for select
  using (agency_id = public.get_user_agency()
         and exists (select 1 from public.agencies a where a.id = agency_id and a.billing_model = 'prepaid'));
create policy wallet_movements_partner_own on public.wallet_movements for select
  using (agency_id = public.get_user_agency()
         and exists (select 1 from public.agencies a where a.id = agency_id and a.billing_model = 'prepaid'));

create policy agency_wallets_admin_read    on public.agency_wallets       for select using (public.get_user_role() = 'admin');
create policy wallet_topups_admin_read     on public.wallet_topups        for select using (public.get_user_role() = 'admin');
create policy wallet_movements_admin_read  on public.wallet_movements     for select using (public.get_user_role() = 'admin');
create policy order_internal_costs_admin   on public.order_internal_costs for select using (public.get_user_role() = 'admin');
create policy admin_audit_log_admin_read   on public.admin_audit_log      for select using (public.get_user_role() = 'admin');
create policy tariff_costs_admin_all       on public.tariff_costs         for all
  using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');

-- Defensa en profundidad: ni anon ni authenticated escriben en estas tablas
-- (solo las funciones SECURITY DEFINER). Supabase concede ALL por defecto.
revoke all on public.agency_wallets, public.wallet_topups, public.wallet_movements,
              public.order_internal_costs, public.admin_audit_log from anon, authenticated;
grant select on public.agency_wallets, public.wallet_topups, public.wallet_movements,
                public.order_internal_costs, public.admin_audit_log to authenticated;
revoke all on public.tariff_costs from anon;

-- ── 6. Funciones ──────────────────────────────────────────────────────────────

-- Interna: aplica un movimiento bajo bloqueo de la fila del wallet.
create function public._wallet_apply(
  p_agency_id uuid, p_kind public.wallet_movement_kind, p_amount numeric,
  p_order_id uuid, p_topup_id uuid, p_actor_id uuid
) returns table (balance_after numeric, low_balance_alert boolean, low_balance_threshold numeric)
language plpgsql security definer set search_path = '' as $$
declare
  v_w     public.agency_wallets%rowtype;
  v_new   numeric(12,2);
  v_alert boolean;
begin
  select * into v_w from public.agency_wallets where agency_id = p_agency_id for update;
  if not found then raise exception 'WALLET_MISSING'; end if;

  v_new := v_w.balance + p_amount;
  if v_new < 0 then
    raise exception 'INSUFFICIENT_BALANCE' using detail = format('balance=%s required=%s', v_w.balance, -p_amount);
  end if;

  -- Alerta solo al CRUZAR el umbral hacia abajo por una venta, y una sola vez
  -- hasta que el saldo vuelva a estar por encima.
  v_alert := p_amount < 0 and v_new < v_w.low_balance_threshold and v_w.low_balance_alerted_at is null;

  update public.agency_wallets
     set balance = v_new,
         low_balance_alerted_at = case
           when v_alert then now()
           when v_new >= v_w.low_balance_threshold then null
           else v_w.low_balance_alerted_at end
   where agency_id = p_agency_id;

  insert into public.wallet_movements (agency_id, kind, amount, balance_after, order_id, topup_id, actor_id)
  values (p_agency_id, p_kind, p_amount, v_new, p_order_id, p_topup_id, p_actor_id);

  return query select v_new, v_alert, v_w.low_balance_threshold;
end $$;

create function public._require_admin() returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  if public.get_user_role() is distinct from 'admin' then raise exception 'FORBIDDEN'; end if;
  return auth.uid();
end $$;

-- Crear pedido de agencia (descuenta saldo si la agencia es prepago)
create function public.create_agency_order(
  p_agency_id uuid, p_tariff_id uuid,
  p_customer_name text, p_customer_lastname text, p_customer_passport text,
  p_customer_nationality text, p_customer_dob date, p_customer_email text,
  p_activation_date date
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid      uuid := auth.uid();
  v_role     text;
  v_u_agency uuid;
  v_u_active boolean;
  v_agency   public.agencies%rowtype;
  v_tariff   public.tariffs%rowtype;
  v_pricing  public.agency_pricing%rowtype;
  v_order_id uuid;
  v_ref      text;
  v_status   public.order_status;
  v_bal numeric; v_alert boolean; v_thr numeric;
  v_vcost    numeric;
  i          int;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;

  select u.role::text, u.agency_id, coalesce(u.active, true)
    into v_role, v_u_agency, v_u_active from public.users u where u.id = v_uid;
  if not found or not v_u_active then raise exception 'FORBIDDEN'; end if;
  if v_role <> 'admin' and v_u_agency is distinct from p_agency_id then raise exception 'FORBIDDEN'; end if;

  select * into v_agency from public.agencies where id = p_agency_id;
  if not found or not coalesce(v_agency.active, true) then raise exception 'AGENCY_INACTIVE'; end if;

  select * into v_tariff from public.tariffs where id = p_tariff_id and coalesce(active, true);
  if not found then raise exception 'TARIFF_UNAVAILABLE'; end if;

  select * into v_pricing from public.agency_pricing
   where agency_id = p_agency_id and tariff_id = p_tariff_id;
  if not found or v_pricing.pvp <= 0 then raise exception 'TARIFF_UNAVAILABLE'; end if;

  if btrim(coalesce(p_customer_name, '')) = '' or btrim(coalesce(p_customer_lastname, '')) = ''
     or btrim(coalesce(p_customer_email, '')) = '' then
    raise exception 'INVALID_CUSTOMER';
  end if;

  v_status := case when p_activation_date is not null then 'scheduled' else 'pending_review' end;

  for i in 1..5 loop
    v_ref := 'R34-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    begin
      insert into public.orders (
        order_ref, agency_id, seller_id, tariff_id, type,
        customer_name, customer_lastname, customer_passport, customer_nationality,
        customer_dob, customer_email, activation_date, status, pvp_at_time, cost_at_time
      ) values (
        v_ref, p_agency_id, v_uid, p_tariff_id, v_tariff.type,
        btrim(p_customer_name), btrim(p_customer_lastname), btrim(coalesce(p_customer_passport, '')),
        btrim(coalesce(nullif(p_customer_nationality, ''), 'Argentina')),
        p_customer_dob, lower(btrim(p_customer_email)), p_activation_date, v_status,
        v_pricing.pvp, v_pricing.cost_price
      ) returning id into v_order_id;
      exit;
    exception when unique_violation then
      if i = 5 then raise; end if;
    end;
  end loop;

  -- Costo interno de Vodafone congelado (solo admin lo ve). Si la tarifa aún no
  -- tiene costo configurado, la venta sigue y el reporte lo marcará "sin costo".
  select vodafone_cost_usd into v_vcost from public.tariff_costs where tariff_id = p_tariff_id;
  if found then
    insert into public.order_internal_costs (order_id, vodafone_cost_usd) values (v_order_id, v_vcost);
  end if;

  if v_agency.billing_model = 'prepaid' then
    if v_pricing.cost_price <= 0 then raise exception 'PRICE_NOT_CONFIGURED'; end if;
    select w.balance_after, w.low_balance_alert, w.low_balance_threshold
      into v_bal, v_alert, v_thr from public._wallet_apply(
      p_agency_id, 'sale', -v_pricing.cost_price, v_order_id, null, v_uid) w;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_ref', v_ref,
    'billing_model', v_agency.billing_model,
    'balance_after', v_bal,
    'low_balance_alert', coalesce(v_alert, false),
    'low_balance_threshold', v_thr
  );
end $$;

-- Cancelación por la propia agencia (solo antes de "en gestión")
create function public.cancel_agency_order(p_order_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid      uuid := auth.uid();
  v_role     text;
  v_u_agency uuid;
  v_order    public.orders%rowtype;
  v_sale     public.wallet_movements%rowtype;
  v_bal numeric; v_alert boolean; v_thr numeric;
  v_refunded boolean := false;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  select u.role::text, u.agency_id into v_role, v_u_agency from public.users u
   where u.id = v_uid and coalesce(u.active, true);
  if not found or v_role <> 'partner' then raise exception 'FORBIDDEN'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.agency_id is distinct from v_u_agency then raise exception 'FORBIDDEN'; end if;
  if v_order.status not in ('pending_review', 'scheduled') then raise exception 'NOT_CANCELLABLE'; end if;

  update public.orders set status = 'cancelled', cancelled_at = now(), cancelled_by = v_uid
   where id = p_order_id;

  select * into v_sale from public.wallet_movements where order_id = p_order_id and kind = 'sale';
  if found then
    v_refunded := true;
    select w.balance_after, w.low_balance_alert, w.low_balance_threshold
      into v_bal, v_alert, v_thr from public._wallet_apply(
      v_order.agency_id, 'cancel_refund', -v_sale.amount, p_order_id, null, v_uid) w;
  end if;

  return jsonb_build_object('order_id', p_order_id, 'refunded', v_refunded, 'balance_after', v_bal);
end $$;

-- Admin: empieza a gestionar el pedido (bloquea la cancelación de la agencia)
create function public.admin_start_management(p_order_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := public._require_admin();
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status not in ('pending_review', 'scheduled') then raise exception 'INVALID_STATE'; end if;

  update public.orders
     set status = 'in_management', management_started_at = now(), management_started_by = v_uid
   where id = p_order_id;
  insert into public.admin_audit_log (entity, entity_id, action, details, actor_id)
  values ('order', p_order_id, 'start_management', jsonb_build_object('previous_status', v_order.status), v_uid);

  return jsonb_build_object('order_id', p_order_id, 'status', 'in_management');
end $$;

-- Admin: anulación excepcional (incluso después de enviar el QR), con motivo obligatorio
create function public.admin_void_order(p_order_id uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := public._require_admin();
  v_order public.orders%rowtype;
  v_sale  public.wallet_movements%rowtype;
  v_bal numeric; v_alert boolean; v_thr numeric;
  v_refunded boolean := false;
begin
  if char_length(btrim(coalesce(p_reason, ''))) < 10 then raise exception 'REASON_REQUIRED'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status = 'cancelled' then raise exception 'ALREADY_CANCELLED'; end if;

  update public.orders set status = 'cancelled', cancelled_at = now(), cancelled_by = v_uid
   where id = p_order_id;

  select * into v_sale from public.wallet_movements where order_id = p_order_id and kind = 'sale';
  if found then
    v_refunded := true;
    select w.balance_after, w.low_balance_alert, w.low_balance_threshold
      into v_bal, v_alert, v_thr from public._wallet_apply(
      v_order.agency_id, 'admin_void_refund', -v_sale.amount, p_order_id, null, v_uid) w;
  end if;

  insert into public.admin_audit_log (entity, entity_id, action, reason, details, actor_id)
  values ('order', p_order_id, 'void_order', btrim(p_reason),
          jsonb_build_object('previous_status', v_order.status, 'refunded', case when v_refunded then -v_sale.amount else 0 end), v_uid);

  return jsonb_build_object('order_id', p_order_id, 'refunded', v_refunded, 'balance_after', v_bal);
end $$;

-- Admin: recarga manual (tras confirmar el pago)
create function public.admin_topup_wallet(
  p_agency_id uuid, p_amount numeric, p_payment_reference text, p_payment_date date
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := public._require_admin();
  v_agency public.agencies%rowtype;
  v_topup uuid;
  v_bal numeric; v_alert boolean; v_thr numeric;
begin
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then raise exception 'INVALID_AMOUNT'; end if;
  if btrim(coalesce(p_payment_reference, '')) = '' or p_payment_date is null then
    raise exception 'PAYMENT_REFERENCE_REQUIRED';
  end if;
  select * into v_agency from public.agencies where id = p_agency_id;
  if not found then raise exception 'AGENCY_NOT_FOUND'; end if;
  if v_agency.billing_model <> 'prepaid' then raise exception 'NOT_PREPAID'; end if;

  insert into public.wallet_topups (agency_id, amount, payment_reference, payment_date, created_by)
  values (p_agency_id, round(p_amount, 2), btrim(p_payment_reference), p_payment_date, v_uid)
  returning id into v_topup;

  select w.balance_after, w.low_balance_alert, w.low_balance_threshold
      into v_bal, v_alert, v_thr from public._wallet_apply(p_agency_id, 'topup', round(p_amount, 2), null, v_topup, v_uid) w;

  insert into public.admin_audit_log (entity, entity_id, action, details, actor_id)
  values ('wallet_topup', v_topup, 'topup', jsonb_build_object('agency_id', p_agency_id, 'amount', round(p_amount, 2)), v_uid);

  return jsonb_build_object('topup_id', v_topup, 'balance_after', v_bal);
end $$;

-- Admin: adjuntar los datos de la factura emitida en Qonto a una recarga
create function public.admin_attach_topup_invoice(
  p_topup_id uuid, p_invoice_number text, p_invoice_date date, p_invoice_url text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := public._require_admin();
  v_old public.wallet_topups%rowtype;
begin
  if btrim(coalesce(p_invoice_number, '')) = '' or p_invoice_date is null then
    raise exception 'INVOICE_DATA_REQUIRED';
  end if;
  select * into v_old from public.wallet_topups where id = p_topup_id for update;
  if not found then raise exception 'TOPUP_NOT_FOUND'; end if;

  update public.wallet_topups
     set invoice_number = btrim(p_invoice_number), invoice_date = p_invoice_date,
         invoice_url = nullif(btrim(coalesce(p_invoice_url, '')), ''),
         invoice_attached_at = now(), invoice_attached_by = v_uid
   where id = p_topup_id;

  insert into public.admin_audit_log (entity, entity_id, action, details, actor_id)
  values ('wallet_topup', p_topup_id, 'attach_invoice',
          jsonb_build_object('previous_number', v_old.invoice_number, 'new_number', btrim(p_invoice_number)), v_uid);

  return jsonb_build_object('topup_id', p_topup_id);
end $$;

-- Admin: modelo de facturación de la agencia y umbral de alerta
create function public.admin_configure_wallet(
  p_agency_id uuid, p_billing_model text, p_low_balance_threshold numeric default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := public._require_admin();
  v_bal numeric;
begin
  if p_billing_model not in ('prepaid', 'postpaid') then raise exception 'INVALID_MODEL'; end if;
  if p_low_balance_threshold is not null and p_low_balance_threshold < 0 then raise exception 'INVALID_THRESHOLD'; end if;
  perform 1 from public.agencies where id = p_agency_id for update;
  if not found then raise exception 'AGENCY_NOT_FOUND'; end if;

  if p_billing_model = 'prepaid' then
    insert into public.agency_wallets (agency_id) values (p_agency_id) on conflict (agency_id) do nothing;
    if p_low_balance_threshold is not null then
      update public.agency_wallets set low_balance_threshold = p_low_balance_threshold where agency_id = p_agency_id;
    end if;
  else
    select balance into v_bal from public.agency_wallets where agency_id = p_agency_id for update;
    if v_bal is not null and v_bal <> 0 then raise exception 'BALANCE_NOT_ZERO'; end if;
  end if;

  update public.agencies set billing_model = p_billing_model where id = p_agency_id;
  insert into public.admin_audit_log (entity, entity_id, action, details, actor_id)
  values ('agency', p_agency_id, 'configure_wallet',
          jsonb_build_object('billing_model', p_billing_model, 'threshold', p_low_balance_threshold), v_uid);

  return jsonb_build_object('agency_id', p_agency_id, 'billing_model', p_billing_model);
end $$;

-- ── 7. Permisos de ejecución ──────────────────────────────────────────────────
-- Supabase concede EXECUTE a anon/authenticated/service_role por defecto: se revoca explícitamente.
revoke all on function public._wallet_apply(uuid, public.wallet_movement_kind, numeric, uuid, uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._require_admin() from public, anon, authenticated, service_role;
revoke all on function public._wallet_movements_immutable() from public, anon, authenticated, service_role;

do $$
declare f text;
begin
  foreach f in array array[
    'public.create_agency_order(uuid,uuid,text,text,text,text,date,text,date)',
    'public.cancel_agency_order(uuid)',
    'public.admin_start_management(uuid)',
    'public.admin_void_order(uuid,text)',
    'public.admin_topup_wallet(uuid,numeric,text,date)',
    'public.admin_attach_topup_invoice(uuid,text,date,text)',
    'public.admin_configure_wallet(uuid,text,numeric)'
  ] loop
    execute format('revoke all on function %s from public, anon, service_role', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- ── 8. Realtime: saldo y movimientos en vivo para la agencia (respeta RLS) ────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.agency_wallets;
    alter publication supabase_realtime add table public.wallet_movements;
  end if;
end $$;
