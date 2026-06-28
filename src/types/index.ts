export type Locale = "es" | "pt";

export type PlanType = "local" | "dataonly";
export type PlanSize = "S" | "M" | "L" | "XL" | "XXL";

export interface Plan {
  id: string;
  slug: string;
  name: string;
  vodafone_code?: string;    // Código Vodafone para activación (ej: "Vodafone S", "Vodafone M")
  badge?: string | null;     // Características (una por línea) — editable en admin
  type: PlanType;
  size?: PlanSize;           // S/M/L/XL/XXL — derivado de position o badge
  position?: number;         // 1 = más izquierda, 5 = más derecha en la home
  data_gb: number;
  eu_data_gb?: number;        // GB en roaming UE (solo planes local/España)
  duration_days: number;
  activation_days: number;   // días para activar desde la compra
  price_usd: number;
  is_popular?: boolean;
  zone: "espana" | "europa";
  countries_count: number;
  features: string[];
}

export interface OrderFormData {
  plan_id: string;
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_country: string;
  activation_date?: string; // solo para prepago
  device_confirmed: boolean;
  payment_method: "stripe" | "mercadopago";
  quantity: number;          // 1–10 eSIMs por compra
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "qr_sent"
  | "active"
  | "expired"
  | "cancelled";

export interface Order {
  id: string;
  order_ref: string;
  tariff_id: string;
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_country: string;
  activation_date?: string;
  status: OrderStatus;
  payment_method: "stripe" | "mercadopago";
  payment_id?: string;
  amount_usd: number;
  qr_sent_at?: string;
  created_at: string;
}

export interface PurchaseStep {
  id: 1 | 2 | 3;
  label: string;
}
