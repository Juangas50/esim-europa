import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderRef(): string {
  const prefix = "R34";
  const timestamp = Date.now().toString(36).toUpperCase();
  // Use crypto.randomUUID for cryptographically secure randomness
  const random = crypto.randomUUID().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
