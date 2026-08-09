"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import { readConsentCookie } from "@/components/legal/CookieBanner";
import { trackAssistantOpen } from "@/lib/assistant/telemetry";
import AssistantLauncher from "./AssistantLauncher";
import AssistantPanel from "./AssistantPanel";

/** Punto de corte de `md:` en Tailwind. Por debajo, el panel es una hoja modal. */
const MOBILE_MAX_WIDTH = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH - 1}px)`;

function subscribeViewport(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Tamaño de pantalla como fuente externa.
 *
 * En el servidor no hay ventana que medir, así que la instantánea de servidor
 * es "desktop" y React reconcilia sola tras la hidratación. Leer `innerWidth`
 * durante el render provocaría un desajuste de hidratación.
 */
function useIsMobile() {
  return useSyncExternalStore(
    subscribeViewport,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}

/**
 * Suscripción al consentimiento de cookies.
 *
 * Reutiliza el mecanismo que ya existe (`readConsentCookie` + el evento
 * `cookie-consent` que emite `CookieBanner`). Salvedad real de ese mecanismo:
 * el evento **solo se emite al aceptar**, nunca al rechazar. Para cubrir el
 * caso "rechazado" hace falta releer la cookie, y eso se hace con un sondeo
 * acotado: se apaga en cuanto hay decisión y, como red de seguridad, se
 * abandona solo a los ~2 minutos en vez de quedar vivo toda la sesión.
 */
function subscribeConsent(onChange: () => void) {
  window.addEventListener("cookie-consent", onChange);

  const poll = window.setInterval(() => {
    if (readConsentCookie() !== null) {
      window.clearInterval(poll);
      onChange();
    }
  }, 1000);
  const stopPolling = window.setTimeout(() => window.clearInterval(poll), 120_000);

  return () => {
    window.removeEventListener("cookie-consent", onChange);
    window.clearInterval(poll);
    window.clearTimeout(stopPolling);
  };
}

/** ¿Está el banner de cookies ocupando el borde inferior? */
function useCookieBannerVisible() {
  return useSyncExternalStore(
    subscribeConsent,
    () => readConsentCookie() === null,
    () => false
  );
}

/**
 * Asistente conversacional de Ruta34.
 *
 * Orquesta apertura/cierre y la devolución del foco. Toda la conversación vive
 * en `AssistantPanel`, que se monta y desmonta: al cerrarlo se descarta el hilo,
 * que es el comportamiento esperado mientras el motor es local.
 */
export default function Assistant() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const bannerVisible = useCookieBannerVisible();
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    trackAssistantOpen({ source: "launcher" });
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  // El foco vuelve al launcher cuando el panel ha terminado de salir, no cuando
  // se pide el cierre: mientras dura la animación el panel sigue montado, y
  // devolver el foco antes lo dejaría dentro de un elemento a punto de
  // desaparecer. `onExitComplete` solo se dispara tras una salida real, así que
  // tampoco roba el foco en la carga inicial.
  const restoreFocus = useCallback(() => launcherRef.current?.focus(), []);

  return (
    <>
      <AssistantLauncher
        ref={launcherRef}
        onClick={handleOpen}
        raised={bannerVisible}
        hidden={open}
      />

      <AnimatePresence onExitComplete={restoreFocus}>
        {open && <AssistantPanel onClose={handleClose} isMobile={isMobile} />}
      </AnimatePresence>
    </>
  );
}
