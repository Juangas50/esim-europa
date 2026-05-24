export type Locale = "es" | "pt";

export type PlanType = "prepago" | "dataonly";

export interface Plan {
  id: string;
  slug: string;
  name: string;
  type: PlanType;
  data_gb: number;
  duration_days: number;
  activation_days: number; // días para activar desde la compra
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
  customer_email_confirm: string;
  customer_country: string;
  activation_date?: string; // solo para prepago
  device_confirmed: boolean;
  payment_method: "stripe" | "mercadopago";
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
