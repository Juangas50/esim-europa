"use client";

import type { MetaCustomData, MetaEventName } from "./events";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Mismo cookie que ya usa el banner de cookies / GTM — una sola fuente de verdad
// para "¿el usuario aceptó analytics?" en todo el sitio.
const CONSENT_KEY = "ruta34_cookie_consent";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function hasMetaConsent(): boolean {
  return readCookie(CONSENT_KEY) === "accepted";
}

/** Cookies que el propio Pixel setea — _fbp siempre, _fbc solo si llegó con fbclid. */
export function getFbCookies(): { fbp?: string; fbc?: string } {
  return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}

// ── Buffer propio de "pixel listo" ───────────────────────────────────────────
// El snippet oficial de Meta define window.fbq como un stub que encola llamadas
// mientras fbevents.js (script externo, async) todavía no cargó. En la práctica,
// una llamada a fbq() hecha muy temprano (ej. un evento en un useEffect que
// monta rápido, como Purchase en /confirmacion) puede caer en una ventana de
// carrera donde esa llamada encolada nunca se re-emite una vez que la librería
// real termina de cargar — se pierde en silencio, sin error.
//
// Para no depender de ese comportamiento interno, bufferizamos nosotros mismos
// cualquier llamada a fbqTrack() hasta que MetaPixelScript confirme via
// markMetaPixelReady() (disparado por el onLoad real de fbevents.js) que la
// librería está lista. Después de eso, todo pasa directo sin buffer.
let pixelReady = false;
const pendingCalls: Array<() => void> = [];

export function markMetaPixelReady(): void {
  pixelReady = true;
  const calls = pendingCalls.splice(0, pendingCalls.length);
  calls.forEach((call) => call());
}

/**
 * Wrapper de fbq — no-op seguro si el Pixel todavía no cargó (sin consentimiento)
 * o si window.fbq no existe por cualquier otro motivo (bloqueadores, etc).
 * Si se llama antes de que fbevents.js confirme estar listo, se bufferiza y se
 * reintenta automáticamente en cuanto markMetaPixelReady() se dispare.
 */
export function fbqTrack(eventName: MetaEventName, customData?: MetaCustomData, eventId?: string): void {
  if (typeof window === "undefined") return;

  const send = () => {
    if (typeof window.fbq !== "function") return;
    if (eventId) {
      window.fbq("track", eventName, customData ?? {}, { eventID: eventId });
    } else {
      window.fbq("track", eventName, customData ?? {});
    }
  };

  if (pixelReady) {
    send();
  } else {
    pendingCalls.push(send);
  }
}

// ── Reintento diferido de ViewContent tras consentimiento ───────────────────
// ViewContent es el único evento de este set que tiene sentido reintentar
// después de que el usuario acepte cookies: describe contenido que sigue
// siendo el mismo contenido visible, sin importar cuándo se otorgó el
// consentimiento. AddToCart/InitiateCheckout/Purchase NO se reintentan acá —
// son el resultado de una interacción puntual (un click) que ya ocurrió;
// reproducirlos más tarde describiría algo que no pasó en ese momento.
//
// Se guarda como mucho UNA llamada pendiente, nunca una cola: cada intento
// de ViewContent nuevo reemplaza al anterior, así que si el usuario navegó
// por varias páginas antes de aceptar, solo se reintenta el último contenido
// realmente visible — nunca una acumulación de eventos viejos o irrelevantes.
let pendingViewContentRetry: (() => void) | null = null;

/** Llamado desde useMetaEvents cuando ViewContent se intenta sin consentimiento. */
export function queueViewContentRetry(send: () => void): void {
  pendingViewContentRetry = send;
}

/**
 * Se dispara una única vez, desde MetaPixelScript, en el momento exacto en
 * que el consentimiento pasa a "accepted". Si no hay nada pendiente (caso
 * normal: el usuario rechazó, o ya había consentimiento, o no hay Pixel
 * configurado), es un no-op seguro.
 */
export function flushViewContentRetry(): void {
  const send = pendingViewContentRetry;
  pendingViewContentRetry = null;
  send?.();
}
