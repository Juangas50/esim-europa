// Utilidades compartidas del wallet prepago de agencias (ver supabase/migrations/20261124000002_agency_wallet.sql)

export type BillingModel = 'prepaid' | 'postpaid'

export const usd = (n: number | null | undefined) =>
  `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Las funciones SQL lanzan códigos como 'INSUFFICIENT_BALANCE'; PostgREST los devuelve en error.message.
const MESSAGES: Record<string, string> = {
  INSUFFICIENT_BALANCE: 'Saldo insuficiente para esta venta.',
  WALLET_MISSING: 'Tu agencia no tiene wallet configurado. Contacta a tu ejecutivo RUTA34.',
  NOT_CANCELLABLE: 'Este pedido ya no se puede cancelar: RUTA34 ya empezó a gestionarlo.',
  TARIFF_UNAVAILABLE: 'Esta tarifa no está disponible para tu agencia.',
  AGENCY_INACTIVE: 'Tu agencia está desactivada. Contacta a tu ejecutivo RUTA34.',
  PRICE_NOT_CONFIGURED: 'El precio de esta tarifa no está configurado. Contacta a tu ejecutivo RUTA34.',
  INVALID_CUSTOMER: 'Faltan datos del cliente.',
  FORBIDDEN: 'No tienes permiso para esta acción.',
  UNAUTHENTICATED: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  ORDER_NOT_FOUND: 'No encontramos el pedido.',
  INVALID_STATE: 'El pedido ya no está en un estado que permita esta acción.',
  REASON_REQUIRED: 'El motivo es obligatorio (mínimo 10 caracteres).',
  ALREADY_CANCELLED: 'El pedido ya estaba cancelado.',
  INVALID_AMOUNT: 'El monto debe ser mayor que cero.',
  PAYMENT_REFERENCE_REQUIRED: 'Indica la referencia y la fecha del pago.',
  NOT_PREPAID: 'Esta agencia no es prepago.',
  AGENCY_NOT_FOUND: 'No encontramos la agencia.',
  INVOICE_DATA_REQUIRED: 'Indica el número y la fecha de la factura.',
  TOPUP_NOT_FOUND: 'No encontramos la recarga.',
  BALANCE_NOT_ZERO: 'Para pasar a postpago el saldo del wallet debe ser cero.',
  INVALID_MODEL: 'Modelo de facturación inválido.',
  INVALID_THRESHOLD: 'El umbral de saldo bajo no puede ser negativo.',
}

export function walletErrorMessage(raw?: string | null): string {
  if (!raw) return 'No se pudo completar la acción. Intenta de nuevo.'
  for (const code of Object.keys(MESSAGES)) {
    if (raw.includes(code)) return MESSAGES[code]
  }
  return 'No se pudo completar la acción. Intenta de nuevo.'
}

export const isInsufficientBalance = (raw?: string | null) => !!raw && raw.includes('INSUFFICIENT_BALANCE')

// Estados de pedido B2B (enum order_status de la tabla `orders`)
export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente',   color: '#92580A', bg: 'rgba(201,151,58,0.14)' },
  scheduled:      { label: 'Programado',  color: '#92580A', bg: 'rgba(201,151,58,0.14)' },
  in_management:  { label: 'En gestión',  color: '#2F5086', bg: 'rgba(47,80,134,0.12)'  },
  qr_sent:        { label: 'QR enviado',  color: '#046C4E', bg: 'rgba(5,150,105,0.12)'  },
  activated:      { label: 'Activado',    color: '#046C4E', bg: 'rgba(5,150,105,0.12)'  },
  cancelled:      { label: 'Cancelado',   color: '#566377', bg: 'rgba(100,116,139,0.14)' },
}

/** La agencia puede cancelar solo mientras nadie haya empezado a gestionar el pedido. */
export const isAgencyCancellable = (status: string) => status === 'pending_review' || status === 'scheduled'
