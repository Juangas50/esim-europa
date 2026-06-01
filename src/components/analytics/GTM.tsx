"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CONSENT_KEY = "ruta34_cookie_consent";

/**
 * GTM Script — only loads after the user has accepted cookies (GDPR).
 * Falls back gracefully if GTM_ID is not configured.
 */
export function GTMScript() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    // Check current consent — leer desde cookie (fuente de verdad)
    const check = () => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_KEY}=([^;]*)`));
      if (match?.[1] === "accepted") setCanLoad(true);
    };
    check();

    // Listen for consent decisions made during this session
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "accepted") setCanLoad(true);
    };
    window.addEventListener("cookie-consent", handler);
    return () => window.removeEventListener("cookie-consent", handler);
  }, []);

  if (!GTM_ID || !canLoad) return null;

  return (
    <Script
      id="gtm-head"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

/**
 * GTM noscript fallback — iframe para usuarios sin JavaScript.
 * Debe ir inmediatamente después del <body>.
 */
export function GTMNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
