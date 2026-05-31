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
