import type { MetaCustomData, MetaEventName, MetaUserData } from "./events";

/**
 * capi.ts — usa META_ACCESS_TOKEN (secreto). Solo importar desde Route Handlers,
 * Server Actions o Server Components — nunca desde un archivo "use client".
 */

const GRAPH_API_VERSION = "v21.0";

/**
 * SHA-256 hex digest — Web Crypto API (Node 19+ y Edge runtime), sin depender
 * de `node:crypto` para que el route handler pueda correr en cualquiera de los dos.
 */
async function hashSha256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface SendMetaCapiEventInput {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl?: string;
  customData?: MetaCustomData;
  userData?: MetaUserData;
  eventTime?: number; // segundos epoch — default: ahora
}

/**
 * Envía un evento a Meta Conversions API. Nunca lanza — un fallo acá no debe
 * romper el flujo que lo llama (checkout, webhook, etc). Los errores solo se logean.
 */
export async function sendMetaCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  customData,
  userData,
  eventTime,
}: SendMetaCapiEventInput): Promise<void> {
  const datasetId = process.env.META_DATASET_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!datasetId || !accessToken) {
    console.warn("[meta-capi] Falta META_DATASET_ID o META_ACCESS_TOKEN — evento no enviado:", eventName);
    return;
  }

  try {
    const hashedUserData: Record<string, unknown> = {
      fbp: userData?.fbp,
      fbc: userData?.fbc,
      client_ip_address: userData?.client_ip_address,
      client_user_agent: userData?.client_user_agent,
    };
    if (userData?.em) hashedUserData.em = await hashSha256(userData.em);
    if (userData?.ph) hashedUserData.ph = await hashSha256(userData.ph.replace(/[^\d]/g, ""));
    if (userData?.external_id) hashedUserData.external_id = await hashSha256(userData.external_id);

    // Limpiar undefined — Meta rechaza campos null/undefined explícitos en algunos casos
    Object.keys(hashedUserData).forEach((k) => hashedUserData[k] === undefined && delete hashedUserData[k]);

    const body = {
      data: [
        {
          event_name: eventName,
          event_id: eventId,
          event_time: eventTime ?? Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: hashedUserData,
          custom_data: customData ?? {},
        },
      ],
      ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
    };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${datasetId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[meta-capi] Error de Graph API:", res.status, errText, "| event:", eventName, eventId);
      return;
    }

    console.log("[meta-capi] Evento enviado:", eventName, "| event_id:", eventId);
  } catch (err) {
    console.error("[meta-capi] Excepción enviando evento:", eventName, err);
  }
}
