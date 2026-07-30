/**
 * Analytics Helper Functions
 * Validation, privacy filters, parameter merging, and utilities
 */

import type { EventParams, SharedParams } from "./types";
import { CONVERSION_EVENTS, COOKIE_NAMES } from "./constants";

// ── Session Management ───────────────────────────────────────────────────────
let cachedSessionId: string | null = null;

export function getSessionId(): string {
  if (cachedSessionId) return cachedSessionId;

  if (typeof window === "undefined") {
    return "server-session";
  }

  const stored = getCookie(COOKIE_NAMES.SESSION_ID);
  if (stored) {
    cachedSessionId = stored;
    return stored;
  }

  const newId = generateUUID();
  setCookie(COOKIE_NAMES.SESSION_ID, newId, 30); // 30 days
  cachedSessionId = newId;
  return newId;
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Cookie Utilities ─────────────────────────────────────────────────────────
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

// ── Device Detection ─────────────────────────────────────────────────────────
export function getDeviceCategory(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  // Mobile first (smallest widths)
  if (width < 768 || /mobile|android|iphone|ipad|ipod/.test(userAgent)) {
    return "mobile";
  }

  // Tablet (medium)
  if (width < 1024 || /tablet|ipad|android/.test(userAgent)) {
    return "tablet";
  }

  return "desktop";
}

// ── Privacy Filters ─────────────────────────────────────────────────────────
const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g,
  CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
};

export function isPIIDetected(value: unknown): boolean {
  if (typeof value !== "string") return false;

  for (const pattern of Object.values(PII_PATTERNS)) {
    if (pattern.test(value)) {
      return true;
    }
  }

  return false;
}

export function sanitizeValue(value: unknown): unknown {
  if (typeof value !== "string") return value;

  if (isPIIDetected(value)) {
    console.warn("[Analytics] PII detected and filtered:", value.substring(0, 10) + "...");
    return "[FILTERED_PII]";
  }

  return value;
}

export function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip obvious sensitive fields
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("apikey")
    ) {
      continue;
    }

    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
}

// ── Parameter Validation ────────────────────────────────────────────────────
export function validateEventParams(params: EventParams): boolean {
  // Check required universal params
  if (!params.page_path || typeof params.page_path !== "string") {
    console.warn("[Analytics] Missing or invalid page_path");
    return false;
  }

  if (!params.page_title || typeof params.page_title !== "string") {
    console.warn("[Analytics] Missing or invalid page_title");
    return false;
  }

  if (!params.language || typeof params.language !== "string") {
    console.warn("[Analytics] Missing or invalid language");
    return false;
  }

  if (!params.device_category || !["desktop", "tablet", "mobile"].includes(params.device_category)) {
    console.warn("[Analytics] Missing or invalid device_category");
    return false;
  }

  return true;
}

// ── Shared Parameters Injection ──────────────────────────────────────────────
export function getSharedParams(): Partial<SharedParams> {
  const shared: Partial<SharedParams> = {
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    device_category: getDeviceCategory(),
  };

  // These will be set by the analytics context or config
  // They are NOT injected here, but should be provided by calling code
  return shared;
}

export function mergeParams(baseParams: EventParams, additionalParams: Partial<EventParams> = {}): EventParams {
  const merged = { ...baseParams, ...additionalParams };

  // Ensure all parameters are safe
  return sanitizeParams(merged) as EventParams;
}

// ── GA4 Client ID Extraction ────────────────────────────────────────────────
export function getGA4ClientId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  return match?.[1];
}

// ── Conversion Event Check ──────────────────────────────────────────────────
export function isConversionEvent(eventName: string): boolean {
  return CONVERSION_EVENTS.includes(eventName as any);
}

// ── Deduplication Check (Prevent Multiple Fires in Same Session) ────────────
const firedEvents = new Set<string>();

export function hasEventFiredInSession(eventName: string, sessionId: string): boolean {
  const key = `${sessionId}:${eventName}`;
  return firedEvents.has(key);
}

export function markEventFiredInSession(eventName: string, sessionId: string): void {
  const key = `${sessionId}:${eventName}`;
  firedEvents.add(key);
}

export function clearSessionEventHistory(sessionId: string): void {
  const keysToDelete = Array.from(firedEvents).filter((key) => key.startsWith(`${sessionId}:`));
  keysToDelete.forEach((key) => firedEvents.delete(key));
}

// ── Consent Check ───────────────────────────────────────────────────────────
export function hasAnalyticsConsent(): boolean {
  return getCookie(COOKIE_NAMES.CONSENT) === "accepted";
}

// ── JSON Safety ──────────────────────────────────────────────────────────────
export function safeStringify(obj: unknown, depth: number = 2): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    console.error("[Analytics] Failed to stringify:", err);
    return "[Circular or unstringifiable]";
  }
}

// ── Timestamp Formatting ────────────────────────────────────────────────────
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
