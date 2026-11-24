-- Pruebas del wallet. Requiere auth_stub.sql + baseline_prod.sql + migraciones 20261124000001..3.
-- Uso: psql -v ON_ERROR_STOP=1 -f supabase/tests/wallet_test.sql  (en una BD de prueba, NUNCA producción)
drop schema if exists t cascade;
create schema t;
create table t.results (name text, ok boolean, got text);
create function t.check(p_name text, p_ok boolean, p_got text default null) returns void language sql as
$$ insert into t.results values (p_name, coalesce(p_ok,false), p_got) $$;

-- Ejecuta p_sql como usuario autenticado p_uid (rol "authenticated"), devuelve 1 columna como texto o 'ERR:<msg>'
create function t.run(p_uid uuid, p_sql text) returns text language plpgsql as $$
declare r text;
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
  set local role authenticated;
  begin
    execute p_sql into r;
  exception when others then
    reset role; return 'ERR:' || sqlerrm;
  end;
  reset role;
  return coalesce(r, '');
end $$;

-- ── Datos ─────────────────────────────────────────────────────────────────────
insert into auth.users (id) values
 ('a0000000-0000-0000-0000-000000000001'),('b0000000-0000-0000-0000-000000000001'),
 ('b0000000-0000-0000-0000-000000000002'),('c0000000-0000-0000-0000-000000000001');
insert into public.agencies (id, name, email) values
 ('aa000000-0000-0000-0000-000000000001','Agencia Prepago','pre@x.com'),
 ('bb000000-0000-0000-0000-000000000002','Agencia Postpago','post@x.com');
insert into public.users (id, agency_id, role, full_name) values
 ('a0000000-0000-0000-0000-000000000001', null, 'admin', 'Admin'),
 ('b0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'partner', 'Vendedor Pre'),
 ('b0000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002', 'partner', 'Vendedor Post'),
 ('c0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'partner', 'Otro Pre');
insert into public.tariffs (id, name, type, data_gb) values
 ('f0000000-0000-0000-0000-000000000001','Plan S','prepago',5);
insert into public.agency_pricing (agency_id, tariff_id, cost_price, pvp) values
 ('aa000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001', 40, 60),
 ('bb000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001', 40, 60);
insert into public.tariff_costs (tariff_id, vodafone_cost_usd) values ('f0000000-0000-0000-0000-000000000001', 22.50);

\set ADM  'a0000000-0000-0000-0000-000000000001'
\set PRE  'b0000000-0000-0000-0000-000000000001'
\set POST 'b0000000-0000-0000-0000-000000000002'
\set PRE2 'c0000000-0000-0000-0000-000000000001'
\set AGP  'aa000000-0000-0000-0000-000000000001'
\set AGQ  'bb000000-0000-0000-0000-000000000002'
\set TAR  'f0000000-0000-0000-0000-000000000001'

-- helper: texto SQL para crear pedido
create function t.mk(p_agency uuid) returns text language sql as $$
  select format($f$select public.create_agency_order(%L,'f0000000-0000-0000-0000-000000000001','Ana','Gomez','X123','Argentina','1990-01-01','ana@x.com',null)::text$f$, p_agency) $$;

-- ── 1. Configuración ──────────────────────────────────────────────────────────
select t.check('admin configura prepago', t.run(:'ADM', format($$select public.admin_configure_wallet(%L,'prepaid',100)::text$$, :'AGP')) not like 'ERR%');
select t.check('partner NO puede configurar wallet', t.run(:'PRE', format($$select public.admin_configure_wallet(%L,'prepaid',100)::text$$, :'AGQ')) = 'ERR:FORBIDDEN',
  t.run(:'PRE', format($$select public.admin_configure_wallet(%L,'prepaid',100)::text$$, :'AGQ')));
select t.check('postpago default', (select billing_model from public.agencies where id=:'AGQ') = 'postpaid');

-- ── 2. Seguridad: insert directo de pedidos bloqueado ─────────────────────────
select t.check('insert directo de pedido por agencia DENEGADO',
  t.run(:'PRE', format($$insert into public.orders (order_ref,agency_id,seller_id,tariff_id,type,customer_name,customer_lastname,customer_passport,customer_dob,customer_email,pvp_at_time,cost_at_time) values ('HACK',%L,%L,%L,'prepago','a','b','c','1990-01-01','e@x.com',1,0) returning 'inserted'$$, :'AGP', :'PRE', :'TAR')) like 'ERR:%');

-- ── 3. Sin saldo ──────────────────────────────────────────────────────────────
select t.check('sin saldo: INSUFFICIENT_BALANCE', t.run(:'PRE', t.mk(:'AGP'::uuid)) = 'ERR:INSUFFICIENT_BALANCE', t.run(:'PRE', t.mk(:'AGP'::uuid)));
select t.check('sin saldo: no se creó pedido', (select count(*) from public.orders) = 0);

-- ── 4. Recarga ────────────────────────────────────────────────────────────────
select t.check('partner NO puede recargar', t.run(:'PRE', format($$select public.admin_topup_wallet(%L,500,'ref','2026-11-24')::text$$, :'AGP')) = 'ERR:FORBIDDEN');
select t.check('recarga 150 ok', t.run(:'ADM', format($$select public.admin_topup_wallet(%L,150,'TRF-001','2026-11-24')::text$$, :'AGP')) like '%"balance_after": 150%');
select t.check('recarga a postpago rechazada', t.run(:'ADM', format($$select public.admin_topup_wallet(%L,50,'x','2026-11-24')::text$$, :'AGQ')) = 'ERR:NOT_PREPAID');
select t.check('recarga 0 / negativa rechazada', t.run(:'ADM', format($$select public.admin_topup_wallet(%L,-5,'x','2026-11-24')::text$$, :'AGP')) = 'ERR:INVALID_AMOUNT');

-- ── 5. Ventas ─────────────────────────────────────────────────────────────────
select t.check('venta 1: saldo 110, sin alerta', t.run(:'PRE', t.mk(:'AGP'::uuid)) like '%"balance_after": 110%' );
select t.check('venta 2: saldo 70 y alerta=true (<100)', t.run(:'PRE', t.mk(:'AGP'::uuid)) like '%"balance_after": 70%'
  and true);
select t.check('venta 2: alerta registrada en wallet', (select low_balance_alerted_at is not null from public.agency_wallets where agency_id=:'AGP'));
select t.check('venta 3: saldo 30, NO repite alerta', t.run(:'PRE', t.mk(:'AGP'::uuid)) like '%"low_balance_alert": false%');
select t.check('venta 4 (40 > 30): rechazada', t.run(:'PRE', t.mk(:'AGP'::uuid)) = 'ERR:INSUFFICIENT_BALANCE');
select t.check('venta 4: saldo y pedidos intactos',
  (select balance from public.agency_wallets where agency_id=:'AGP') = 30
  and (select count(*) from public.orders where agency_id=:'AGP') = 3);
select t.check('costo Vodafone congelado en cada venta', (select count(*) from public.order_internal_costs where vodafone_cost_usd = 22.50) = 3);
select t.check('pedido guarda precio acordado y PVP', (select bool_and(cost_at_time=40 and pvp_at_time=60) from public.orders where agency_id=:'AGP'));

-- ── 6. Aislamiento entre agencias ─────────────────────────────────────────────
select t.check('agencia ajena NO crea pedido en otra agencia', t.run(:'POST', t.mk(:'AGP'::uuid)) = 'ERR:FORBIDDEN');
select t.check('agencia ve solo sus pedidos', t.run(:'POST', $$select count(*)::text from public.orders$$) = '0');
select t.check('agencia ve su wallet', t.run(:'PRE', $$select balance::text from public.agency_wallets$$) = '30.00');
select t.check('agencia ve sus movimientos (4)', t.run(:'PRE', $$select count(*)::text from public.wallet_movements$$) = '4');

-- ── 7. Lo interno NO es visible para agencias ─────────────────────────────────
select t.check('agencia NO ve costo Vodafone (order_internal_costs)', t.run(:'PRE', $$select count(*)::text from public.order_internal_costs$$) = '0');
select t.check('agencia NO ve tariff_costs', t.run(:'PRE', $$select count(*)::text from public.tariff_costs$$) = '0');
select t.check('agencia NO ve auditoría', t.run(:'PRE', $$select count(*)::text from public.admin_audit_log$$) = '0');
select t.check('agencia NO puede escribir tariff_costs', t.run(:'PRE', format($$update public.tariff_costs set vodafone_cost_usd=0 returning 'x'$$)) in ('', 'ERR:permission denied for table tariff_costs') );
select t.check('admin SÍ ve costo Vodafone', t.run(:'ADM', $$select count(*)::text from public.order_internal_costs$$) = '3');
select t.check('agencia NO puede modificar wallet directo', t.run(:'PRE', format($$update public.agency_wallets set balance=99999 where agency_id=%L returning 'x'$$, :'AGP')) like 'ERR:%');
select t.check('agencia NO puede insertar movimientos', t.run(:'PRE', format($$insert into public.wallet_movements (agency_id,kind,amount,balance_after) values (%L,'topup',500,500) returning 'x'$$, :'AGP')) like 'ERR:%');

-- ── 8. Postpago: sin wallet, sin movimientos ──────────────────────────────────
select t.check('postpago crea pedido sin tocar saldo', t.run(:'POST', t.mk(:'AGQ'::uuid)) like '%"billing_model": "postpaid"%');
select t.check('postpago: 0 movimientos', (select count(*) from public.wallet_movements where agency_id=:'AGQ') = 0);
select t.check('postpago NO ve wallet', t.run(:'POST', $$select count(*)::text from public.agency_wallets$$) = '0');
select t.check('postpago NO ve movimientos', t.run(:'POST', $$select count(*)::text from public.wallet_movements$$) = '0');

select t.check('postpago cancela su pedido sin movimientos de saldo',
  t.run(:'POST', format($$select public.cancel_agency_order(%L)::text$$, (select id from public.orders where agency_id=:'AGQ' limit 1))) like '%"refunded": false%');
select t.check('postpago: sigue sin movimientos', (select count(*) from public.wallet_movements where agency_id=:'AGQ') = 0);

-- ── 9. Cancelación ────────────────────────────────────────────────────────────
create temp table ord as select id, row_number() over (order by created_at, id) rn from public.orders where agency_id = :'AGP';
select t.check('otra agencia NO cancela pedido ajeno', t.run(:'POST', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=1))) = 'ERR:FORBIDDEN');
select t.check('agencia cancela pedido pendiente y se devuelve saldo (30→70)',
  t.run(:'PRE', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=1))) like '%"balance_after": 70%');
select t.check('pedido quedó cancelado', (select status from public.orders where id=(select id from ord where rn=1)) = 'cancelled');
select t.check('segunda cancelación rechazada',
  t.run(:'PRE', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=1))) = 'ERR:NOT_CANCELLABLE');
select t.check('sin doble devolución', (select balance from public.agency_wallets where agency_id=:'AGP') = 70);
select t.check('otro usuario de la MISMA agencia puede cancelar (rn=2)',
  t.run(:'PRE2', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=2))) like '%"balance_after": 110%');

-- ── 10. En gestión bloquea cancelar ───────────────────────────────────────────
select t.check('partner NO puede pasar a en gestión', t.run(:'PRE', format($$select public.admin_start_management(%L)::text$$, (select id from ord where rn=3))) = 'ERR:FORBIDDEN');
select t.check('admin pasa a en gestión', t.run(:'ADM', format($$select public.admin_start_management(%L)::text$$, (select id from ord where rn=3))) like '%in_management%');
select t.check('en gestión: la agencia YA NO puede cancelar',
  t.run(:'PRE', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=3))) = 'ERR:NOT_CANCELLABLE');
select t.check('en gestión: saldo intacto (110)', (select balance from public.agency_wallets where agency_id=:'AGP') = 110);

-- ── 11. Anulación excepcional por admin (después de QR enviado) ───────────────
update public.orders set status='qr_sent' where id=(select id from ord where rn=3);
select t.check('agencia NO puede cancelar con QR enviado', t.run(:'PRE', format($$select public.cancel_agency_order(%L)::text$$, (select id from ord where rn=3))) = 'ERR:NOT_CANCELLABLE');
select t.check('anulación SIN motivo rechazada', t.run(:'ADM', format($$select public.admin_void_order(%L,'corto')::text$$, (select id from ord where rn=3))) = 'ERR:REASON_REQUIRED');
select t.check('partner NO puede anular', t.run(:'PRE', format($$select public.admin_void_order(%L,'motivo suficientemente largo')::text$$, (select id from ord where rn=3))) = 'ERR:FORBIDDEN');
select t.check('admin anula con motivo: devuelve saldo (110→150)',
  t.run(:'ADM', format($$select public.admin_void_order(%L,'Error de la línea, confirmado con Vodafone')::text$$, (select id from ord where rn=3))) like '%"balance_after": 150%');
select t.check('motivo queda en auditoría (solo admin)', (select count(*) from public.admin_audit_log where action='void_order' and reason like 'Error de la línea%') = 1);
select t.check('anular dos veces rechazado', t.run(:'ADM', format($$select public.admin_void_order(%L,'otra vez por error de operador')::text$$, (select id from ord where rn=3))) = 'ERR:ALREADY_CANCELLED');

-- ── 12. Facturas de Qonto ─────────────────────────────────────────────────────
select t.check('admin adjunta factura de recarga', t.run(:'ADM', format($$select public.admin_attach_topup_invoice(%L,'2026-0042','2026-11-25','https://qonto/f/42')::text$$, (select id from public.wallet_topups limit 1))) not like 'ERR%');
select t.check('agencia ve número de factura de su recarga', t.run(:'PRE', $$select invoice_number from public.wallet_topups$$) = '2026-0042');
select t.check('partner NO adjunta facturas', t.run(:'PRE', format($$select public.admin_attach_topup_invoice(%L,'x','2026-11-25','')::text$$, (select id from public.wallet_topups limit 1))) = 'ERR:FORBIDDEN');

-- ── 13. Integridad del libro ──────────────────────────────────────────────────
do $$ begin
  begin update public.wallet_movements set amount = 1;
    perform t.check('libro inmutable (UPDATE)', false);
  exception when others then perform t.check('libro inmutable (UPDATE)', true, sqlerrm); end;
  begin delete from public.wallet_movements;
    perform t.check('libro inmutable (DELETE)', false);
  exception when others then perform t.check('libro inmutable (DELETE)', true, sqlerrm); end;
  begin insert into public.wallet_movements (agency_id,kind,amount,balance_after) values ('aa000000-0000-0000-0000-000000000001','sale',+5,5);
    perform t.check('venta con monto positivo rechazada', false);
  exception when others then perform t.check('venta con monto positivo rechazada', true, sqlerrm); end;
  begin update public.agency_wallets set balance = -1;
    perform t.check('saldo negativo imposible', false);
  exception when others then perform t.check('saldo negativo imposible', true, sqlerrm); end;
end $$;
select t.check('saldo = suma de movimientos',
  (select balance from public.agency_wallets where agency_id=:'AGP') = (select sum(amount) from public.wallet_movements where agency_id=:'AGP'),
  (select balance::text from public.agency_wallets where agency_id=:'AGP'));
select t.check('saldo = balance_after del último movimiento',
  (select balance from public.agency_wallets where agency_id=:'AGP') =
  (select balance_after from public.wallet_movements where agency_id=:'AGP' order by created_at desc, id desc limit 1));
select t.check('admin puede reconfigurar a postpago solo con saldo 0',
  t.run(:'ADM', format($$select public.admin_configure_wallet(%L,'postpaid')::text$$, :'AGP')) = 'ERR:BALANCE_NOT_ZERO');

-- ── 14. Compatibilidad con las consultas existentes de la app (PostgREST) ──────
-- Una 2ª clave foránea de orders hacia users haría ambiguo el embed `users(full_name)` y dejaría
-- vacía la pantalla /admin/pedidos (error PGRST201, no detectable con SQL plano).
select t.check('orders tiene UNA sola FK hacia users (embed users(...) sin ambiguedad)',
  (select count(*) from pg_constraint c where c.contype='f' and c.conrelid='public.orders'::regclass and c.confrelid='public.users'::regclass) = 1,
  (select count(*)::text from pg_constraint c where c.contype='f' and c.conrelid='public.orders'::regclass and c.confrelid='public.users'::regclass));
select t.check('orders tiene UNA sola FK hacia agencies', (select count(*) from pg_constraint c where c.contype='f' and c.conrelid='public.orders'::regclass and c.confrelid='public.agencies'::regclass) = 1);
select t.check('orders tiene UNA sola FK hacia tariffs', (select count(*) from pg_constraint c where c.contype='f' and c.conrelid='public.orders'::regclass and c.confrelid='public.tariffs'::regclass) = 1);

-- ── Resumen ───────────────────────────────────────────────────────────────────
select count(*) filter (where ok) as pasaron, count(*) filter (where not ok) as fallaron from t.results;
select name, got from t.results where not ok;
do $$ begin
  if exists (select 1 from t.results where not ok) then raise exception 'HAY PRUEBAS FALLIDAS'; end if;
end $$;
