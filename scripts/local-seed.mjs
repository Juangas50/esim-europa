// Datos de ejemplo para el Supabase LOCAL. Lo ejecuta scripts/local-db.sh.
// Usa la service_role key del Supabase local (nunca la de producción).
// Es idempotente: se puede repetir sin duplicar agencias, tarifas ni usuarios.
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SERVICE_ROLE_KEY
if (!url || !key) { console.error('Faltan SUPABASE_URL / SERVICE_ROLE_KEY'); process.exit(1) }
if (!/127\.0\.0\.1|localhost/.test(url)) {
  console.error(`Rechazo ejecutar el seed contra ${url}: solo se permite un Supabase LOCAL.`); process.exit(1)
}

const sb = createClient(url, key, { auth: { persistSession: false } })
const PASSWORD = 'Prueba1234!'
const must = (res, what) => { if (res.error) { console.error(`Error en ${what}:`, res.error.message); process.exit(1) } return res.data }

async function ensureUser(email) {
  const created = await sb.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true })
  if (!created.error) return created.data.user.id
  // Ya existe: lo buscamos
  const list = must(await sb.auth.admin.listUsers({ page: 1, perPage: 200 }), 'listUsers')
  const found = list.users.find(u => u.email === email)
  if (!found) { console.error(`No pude crear ni encontrar ${email}:`, created.error.message); process.exit(1) }
  return found.id
}

async function ensureAgency(name, email, billing) {
  const existing = must(await sb.from('agencies').select('id').eq('name', name).maybeSingle(), 'agencies')
  if (existing) return existing.id
  return must(await sb.from('agencies').insert({ name, email, active: true, billing_model: billing }).select('id').single(), 'insert agency').id
}

// ── Tarifas (con costo de Vodafone interno) ──
const TARIFFS = [
  { name: 'Plan S', type: 'prepago', data_gb: 5, validity_days: 15, vf: 14.5, cost: 25, pvp: 39 },
  { name: 'Plan M', type: 'prepago', data_gb: 15, validity_days: 30, vf: 23, cost: 40, pvp: 59 },
  { name: 'Plan L', type: 'prepago', data_gb: 30, validity_days: 30, vf: 39, cost: 65, pvp: 95 },
  { name: 'Data 10', type: 'dataonly', data_gb: 10, validity_days: 30, vf: 9, cost: 18, pvp: 29 },
]
const tariffIds = []
for (const t of TARIFFS) {
  let row = must(await sb.from('tariffs').select('id').eq('name', t.name).maybeSingle(), 'tariffs')
  if (!row) {
    row = must(await sb.from('tariffs').insert({ name: t.name, type: t.type, data_gb: t.data_gb, validity_days: t.validity_days, active: true, price_usd: t.pvp }).select('id').single(), 'insert tariff')
  }
  tariffIds.push(row.id)
  must(await sb.from('tariff_costs').upsert({ tariff_id: row.id, vodafone_cost_usd: t.vf }, { onConflict: 'tariff_id' }), 'tariff_costs')
}

// ── Agencias ──
const agPre = await ensureAgency('Viajes Sur (prepago)', 'viajessur@ruta34.test', 'prepaid')
const agPost = await ensureAgency('Andes Travel (postpago)', 'andes@ruta34.test', 'postpaid')
for (const ag of [agPre, agPost]) {
  for (let i = 0; i < TARIFFS.length; i++) {
    must(await sb.from('agency_pricing').upsert({ agency_id: ag, tariff_id: tariffIds[i], cost_price: TARIFFS[i].cost, pvp: TARIFFS[i].pvp }, { onConflict: 'agency_id,tariff_id' }), 'agency_pricing')
  }
}

// ── Usuarios ──
const adminId = await ensureUser('admin@ruta34.test')
const preId = await ensureUser('prepago@ruta34.test')
const postId = await ensureUser('postpago@ruta34.test')
must(await sb.from('users').upsert([
  { id: adminId, agency_id: null, role: 'admin', full_name: 'Admin Ruta34', email: 'admin@ruta34.test', active: true, must_change_password: false },
  { id: preId, agency_id: agPre, role: 'partner', full_name: 'Paula (agencia prepago)', email: 'prepago@ruta34.test', active: true, must_change_password: false },
  { id: postId, agency_id: agPost, role: 'partner', full_name: 'Diego (agencia postpago)', email: 'postpago@ruta34.test', active: true, must_change_password: false },
], { onConflict: 'id' }), 'users')

// ── Wallet de la agencia prepago: saldo inicial de 500 USD (equivale a una recarga confirmada) ──
const wallet = must(await sb.from('agency_wallets').select('agency_id, balance').eq('agency_id', agPre).maybeSingle(), 'wallet')
if (!wallet) {
  must(await sb.from('agency_wallets').insert({ agency_id: agPre, balance: 0, low_balance_threshold: 100 }), 'insert wallet')
}
const topups = must(await sb.from('wallet_topups').select('id').eq('agency_id', agPre).limit(1), 'topups')
if (topups.length === 0) {
  const t = must(await sb.from('wallet_topups').insert({ agency_id: agPre, amount: 500, payment_reference: 'TRF-DEMO-001', payment_date: new Date().toISOString().slice(0, 10), created_by: adminId }).select('id').single(), 'insert topup')
  must(await sb.from('agency_wallets').update({ balance: 500 }).eq('agency_id', agPre), 'balance')
  must(await sb.from('wallet_movements').insert({ agency_id: agPre, kind: 'topup', amount: 500, balance_after: 500, topup_id: t.id, actor_id: adminId }), 'movement')
}

console.log('Datos de ejemplo cargados: 4 tarifas, 2 agencias (prepago con 500 USD y postpago), 3 usuarios.')
