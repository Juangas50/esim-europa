"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, markMetaPixelReady, flushViewContentRetry } from "@/lib/meta/pixel";
import { useMetaEvents } from "@/hooks/useMetaEvents";

const CONSENT_KEY = "ruta34_cookie_consent";

/**
 * Meta Pixel — misma gating de consentimiento que GTM (components/analytics/GTM.tsx):
 * no carga hasta que el usuario acepta cookies.
 *
 * Este es también el único lugar que escucha cambios de consentimiento para
 * disparar flushViewContentRetry() — un solo listener, centralizado en la
 * capa de analítica, no duplicado por componente/página.
 */
export function MetaPixelScript() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const check = () => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_KEY}=([^;]*)`));
      if (match?.[1] === "accepted") {
        setCanLoad(true);
        flushViewContentRetry();
      }
    };
    check();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "accepted") {
        setCanLoad(true);
        flushViewContentRetry();
      }
    };
    window.addEventListener("cookie-consent", handler);
    return () => window.removeEventListener("cookie-consent", handler);
  }, []);

  if (!META_PIXEL_ID || !canLoad) return null;

  return (
    <>
      {/*
        Stub oficial de Meta (idéntico al snippet base) — sincrónico, no depende
        de que fbevents.js ya haya cargado. Importante: el stub debe chequear
        `callMethod` en cada llamada (no solo al definirse), porque window.fbq
        nunca se reemplaza — fbevents.js solo le agrega `callMethod` encima.
      */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `if(!window.fbq){
var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
window._fbq||(window._fbq=n);n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
}
fbq('init', '${META_PIXEL_ID}');`,
        }}
      />
      {/*
        fbevents.js real, cargado por next/script (no por el snippet manual de Meta).
        Usamos su onLoad real para saber CON CERTEZA cuándo la librería está lista
        y recién ahí marcamos el pixel como listo (ver markMetaPixelReady en
        lib/meta/pixel.ts) — evita la ventana de carrera donde un fbq('track', ...)
        disparado muy temprano (ej. Purchase en /confirmacion) se pierde porque
        quedó encolado en el stub y nunca se re-emite.
      */}
      <Script
        id="meta-pixel-lib"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.fbq?.("track", "PageView");
          markMetaPixelReady();
        }}
      />
    </>
  );
}

/** Fallback sin JS — debe ir inmediatamente después de <body>, igual que GTMNoScript. */
export function MetaPixelNoScript() {
  if (!META_PIXEL_ID) return null;
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}

/**
 * fbq('track','PageView') del snippet de arriba cubre el primer load.
 * En App Router las navegaciones entre rutas son client-side (no hay reload),
 * así que hay que disparar PageView manualmente en cada cambio de pathname.
 */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const { trackPageView } = useMetaEvents();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
