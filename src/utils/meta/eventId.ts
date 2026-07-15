/**
 * Genera un event_id único para deduplicar entre Meta Pixel (browser) y
 * Conversions API (server). Mismo event_id + mismo event_name = Meta cuenta
 * el evento una sola vez, sin importar cuántas señales lo reporten.
 */
export function generateMetaEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback — no debería hacer falta en Next.js 16 (Node 19+/browsers modernos)
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
