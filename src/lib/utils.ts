import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  // Sin decimales si es número entero, con dos decimales si los tiene
  const formatted = rounded % 1 === 0
    ? rounded.toFixed(0)
    : rounded.toFixed(2);
  return `US$${formatted}`;
}

export function generateOrderRef(): string {
  const prefix = "R34";
  const timestamp = Date.now().toString(36).toUpperCase();
  // Use crypto.randomUUID for cryptographically secure randomness
  const random = crypto.randomUUID().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// URL base del sitio — usada para que los links e imágenes en emails salgan
// del dominio de envío en vez de dominios externos (wa.me, Supabase Storage),
// que Resend marca como señal de riesgo para deliverability.
export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.esimruta34.com";
}

// URL propia (no la de Supabase Storage) para el QR de un pedido — se sirve
// vía /api/qr/[orderId], que hace de proxy contra el bucket privado.
export function qrProxyUrl(orderId: string): string {
  return `${siteBaseUrl()}/api/qr/${orderId}`;
}
