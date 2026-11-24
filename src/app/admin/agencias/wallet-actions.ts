'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { walletErrorMessage, type BillingModel } from '@/lib/wallet'

// IMPORTANTE: estas acciones llaman a las funciones SQL con el cliente de SESIÓN (no service_role):
// las funciones validan auth.uid() y que el rol sea admin, y dejan al usuario en la auditoría.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type WalletOverview = {
  billingModel: BillingModel
  balance: number
  threshold: number
  topups: { id: string; amount: number; payment_reference: string; payment_date: string; created_at: string; invoice_number: string | null; invoice_date: string | null; invoice_url: string | null }[]
  movements: { id: string; kind: string; amount: number; balance_after: number; created_at: string; order_ref: string | null }[]
}

export async function getWalletOverview(agencyId: string): Promise<WalletOverview | null> {
  await requireAdmin()
  if (!UUID_RE.test(agencyId)) return null
  const supabase = await createClient()
  const { data: agency } = await supabase.from('agencies').select('billing_model').eq('id', agencyId).maybeSingle()
  const billingModel: BillingModel = agency?.billing_model === 'prepaid' ? 'prepaid' : 'postpaid'
  const [{ data: w }, { data: topups }, { data: moves }] = await Promise.all([
    supabase.from('agency_wallets').select('balance, low_balance_threshold').eq('agency_id', agencyId).maybeSingle(),
    supabase.from('wallet_topups')
      .select('id, amount, payment_reference, payment_date, created_at, invoice_number, invoice_date, invoice_url')
      .eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(50),
    supabase.from('wallet_movements')
      .select('id, kind, amount, balance_after, created_at, orders(order_ref)')
      .eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(100),
  ])
  return {
    billingModel,
    balance: Number(w?.balance ?? 0),
    threshold: Number(w?.low_balance_threshold ?? 100),
    topups: (topups || []).map(t => ({ ...t, amount: Number(t.amount) })) as WalletOverview['topups'],
    movements: ((moves || []) as unknown as { id: string; kind: string; amount: number | string; balance_after: number | string; created_at: string; orders: { order_ref: string } | null }[]).map(m => ({
      id: m.id, kind: m.kind, amount: Number(m.amount), balance_after: Number(m.balance_after),
      created_at: m.created_at, order_ref: m.orders?.order_ref ?? null,
    })),
  }
}

type Res = { ok: true } | { ok: false; error: string }

export async function configureWallet(agencyId: string, model: BillingModel, threshold: number | null): Promise<Res> {
  await requireAdmin()
  if (!UUID_RE.test(agencyId)) return { ok: false, error: 'Agencia inválida.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_configure_wallet', {
    p_agency_id: agencyId, p_billing_model: model, p_low_balance_threshold: threshold,
  })
  if (error) return { ok: false, error: walletErrorMessage(error.message) }
  revalidatePath('/admin/agencias')
  return { ok: true }
}

export async function topupWallet(agencyId: string, amount: number, reference: string, paymentDate: string): Promise<Res> {
  await requireAdmin()
  if (!UUID_RE.test(agencyId)) return { ok: false, error: 'Agencia inválida.' }
  if (!DATE_RE.test(paymentDate)) return { ok: false, error: 'La fecha del pago no es válida.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_topup_wallet', {
    p_agency_id: agencyId, p_amount: amount, p_payment_reference: reference, p_payment_date: paymentDate,
  })
  if (error) return { ok: false, error: walletErrorMessage(error.message) }
  revalidatePath('/admin/agencias')
  return { ok: true }
}

export async function attachTopupInvoice(topupId: string, number: string, date: string, url: string): Promise<Res> {
  await requireAdmin()
  if (!UUID_RE.test(topupId)) return { ok: false, error: 'Recarga inválida.' }
  if (!DATE_RE.test(date)) return { ok: false, error: 'La fecha de la factura no es válida.' }
  if (url && !/^https?:\/\//i.test(url.trim())) return { ok: false, error: 'El enlace debe empezar por http:// o https://' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_attach_topup_invoice', {
    p_topup_id: topupId, p_invoice_number: number, p_invoice_date: date, p_invoice_url: url,
  })
  if (error) return { ok: false, error: walletErrorMessage(error.message) }
  revalidatePath('/admin/agencias')
  return { ok: true }
}
