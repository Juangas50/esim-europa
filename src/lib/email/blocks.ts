/**
 * Building blocks compartidos para los emails 1-6, traducidos desde los
 * Design Masters aprobados (handoff/*.dc.html) a HTML tabla-based,
 * email-safe. Se extraen acá únicamente las piezas que son realmente
 * comunes entre varios emails — ver AGENTS/contrato FASE 4B sección 4.
 *
 * Deliberadamente NO se trasladan: support.js, image-slot.js, flexbox
 * como dependencia estructural, SVG inline crítico para el layout,
 * Google Fonts. Tipografía: Georgia (headers) / Arial (cuerpo) como
 * fuentes productivas, no como fallback de un @import que no se carga.
 */

import { siteBaseUrl } from "@/lib/utils"

// ── Design tokens (del Design Master, no de la paleta anterior) ────────────
export const COLORS = {
  bg: "#F5EFE3",
  white: "#FFFFFF",
  navy: "#1C3454",
  gold: "#C79A3E",
  goldDark: "#A97F2E",
  inkBody: "#33415A",
  inkSecondary: "#5B6579",
  inkTertiary: "#9AA0AC",
  blueAccent: "#E7EDF3",
  borderGold25: "rgba(199,154,62,0.25)",
  borderGold35: "rgba(199,154,62,0.35)",
} as const

const HEADER_FONT = "Georgia, 'Times New Roman', serif"
const BODY_FONT = "Arial, Helvetica, sans-serif"

export const SUPPORT_URL = `${siteBaseUrl()}/wa`

// ── Bloqueo de dark-mode — mismo criterio que la implementación actual:
// sin esto, iOS Mail / Gmail / Outlook.com auto-invierten los colores. ──
export const LIGHT_MODE_META = `<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">`

/** Documento completo: head + outer table + header (wordmark) + footer. */
export function emailDocument(opts: {
  title: string
  headerRight: string
  bodyHtml: string
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${LIGHT_MODE_META}
<title>${opts.title}</title>
<style>
  body { margin:0; padding:0; background:${COLORS.bg}; }
  table { border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; display:block; }
  a { color:${COLORS.gold}; }
  @media only screen and (max-width:480px) {
    .r34-h1 { font-size:29px !important; line-height:1.16 !important; }
    .r34-hero { height:210px !important; }
    .r34-pad-desktop { padding-left:20px !important; padding-right:20px !important; }
    .r34-eyebrow { font-size:10.5px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
<table role="presentation" width="100%" style="background:${COLORS.bg};margin:0;padding:0;border-collapse:collapse;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:640px;background:${COLORS.bg};" class="r34-container">
<tr><td style="padding:32px 40px 20px;" class="r34-pad-desktop">
  <table role="presentation" width="100%"><tr>
    <td style="font-family:${HEADER_FONT};font-size:26px;color:${COLORS.navy};">Ruta34</td>
    <td align="right" style="font-family:${BODY_FONT};font-size:13px;color:${COLORS.inkSecondary};">${opts.headerRight}</td>
  </tr></table>
</td></tr>
${opts.bodyHtml}
<tr><td style="padding:0 40px 32px;text-align:center;border-top:1px solid ${COLORS.borderGold35};padding-top:24px;margin:0 32px;" class="r34-pad-desktop">
  <div style="font-family:${HEADER_FONT};font-size:16px;color:${COLORS.navy};">Ruta34</div>
  <div style="font-family:${BODY_FONT};font-size:10px;letter-spacing:0.1em;color:${COLORS.inkTertiary};margin-top:3px;">ESIM &middot; ESPA&Ntilde;A &middot; EUROPA</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

/** Fila de contenido genérica: <tr><td style="padding:...">innerHtml</td></tr> */
export function row(innerHtml: string, padding = "0 40px 24px"): string {
  return `<tr><td style="padding:${padding};" class="r34-pad-desktop">${innerHtml}</td></tr>`
}

export function eyebrow(text: string): string {
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
    <span style="width:18px;height:1px;background:${COLORS.gold};display:inline-block;font-size:0;line-height:0;">&nbsp;</span>
    <span class="r34-eyebrow" style="font-family:${BODY_FONT};font-size:12px;font-weight:700;letter-spacing:0.12em;color:${COLORS.navy};">${text}</span>
  </div>`
}

export function h1(html: string): string {
  return `<div class="r34-h1" style="font-family:${HEADER_FONT};font-size:34px;line-height:1.12;color:${COLORS.navy};margin-bottom:14px;">${html}</div>`
}

export function bodyText(html: string): string {
  return `<div style="font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${COLORS.inkBody};">${html}</div>`
}

export function heroImage(src: string, alt: string, desktopHeight = 340): string {
  return `<table role="presentation" width="100%" style="margin:0 0 26px;"><tr><td style="border-radius:16px;overflow:hidden;">
    <img src="${src}" alt="${alt}" width="560" height="${desktopHeight}" class="r34-hero" style="width:100%;height:${desktopHeight}px;object-fit:cover;display:block;border:0;border-radius:16px;">
  </td></tr></table>`
}

export function whiteCard(innerHtml: string, opts?: { bg?: string; padding?: string }): string {
  const bg = opts?.bg ?? COLORS.white
  const padding = opts?.padding ?? "28px 32px"
  return `<table role="presentation" width="100%" style="background:${bg};border-radius:18px;"><tr><td style="padding:${padding};">${innerHtml}</td></tr></table>`
}

export function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${COLORS.navy};color:${COLORS.bg};font-family:${BODY_FONT};font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 24px;">${label}</a>`
}

/** Variante outline (borde navy, fondo transparente) — CTA "Reprogramar activación" en Email 3/4. */
export function ctaButtonOutline(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;border:1.5px solid ${COLORS.navy};color:${COLORS.navy};font-family:${BODY_FONT};font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;padding:13px 24px;">${label}</a>`
}

const HELP_ICON_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 13v-1a8 8 0 0116 0v1" stroke="${COLORS.navy}" stroke-width="1.7"/><rect x="2.5" y="13" width="4" height="7" rx="2" fill="${COLORS.navy}"/><rect x="17.5" y="13" width="4" height="7" rx="2" fill="${COLORS.navy}"/><path d="M19.5 20v1a2 2 0 01-2 2h-4" stroke="${COLORS.navy}" stroke-width="1.7" fill="none"/></svg>`

/**
 * "¿Necesitás ayuda? Estamos para acompañarte." — idéntico en los 6 masters.
 * `orderRefFooter` reproduce la línea extra "Pedido {{orderRef}}" que
 * Email 3 agrega debajo del CTA (los demás emails no la llevan acá).
 */
export function supportBlock(orderRefFooter?: string): string {
  return whiteCard(`
    <table role="presentation" width="100%"><tr>
      <td width="52" valign="top">
        <table role="presentation" width="52" height="52" style="background:#EFE6D2;border-radius:50%;"><tr><td align="center">${HELP_ICON_SVG}</td></tr></table>
      </td>
      <td style="padding-left:16px;">
        <div style="font-family:${BODY_FONT};font-size:11px;font-weight:700;letter-spacing:0.1em;color:${COLORS.inkTertiary};margin-bottom:4px;">&iquest;NECESIT&Aacute;S AYUDA?</div>
        <div style="font-family:${HEADER_FONT};font-size:19px;color:${COLORS.navy};margin-bottom:6px;">Estamos para acompa&ntilde;arte.</div>
        <div style="font-family:${BODY_FONT};font-size:13.5px;line-height:1.5;color:${COLORS.inkSecondary};margin-bottom:16px;">Si algo no funciona como esperabas, escribinos y lo revisamos con vos.</div>
        ${ctaButton("Escribinos", SUPPORT_URL)}
        ${orderRefFooter ? `<div style="font-family:${BODY_FONT};font-size:11.5px;color:${COLORS.inkTertiary};margin-top:14px;">Pedido <span style="font-weight:700;color:${COLORS.inkSecondary};">${orderRefFooter}</span></div>` : ""}
      </td>
    </tr></table>
  `)
}

/** Bloque "DATOS PARA INSTALACIÓN MANUAL" — SM-DP+ derivado + código manual completo. */
export function manualInstallBlock(smdp: string, activationString: string): string {
  return `<div style="margin-top:16px;padding-top:14px;border-top:1px solid ${COLORS.borderGold25};">
    <span style="font-family:${BODY_FONT};font-size:10px;font-weight:700;letter-spacing:0.06em;color:${COLORS.inkTertiary};">DATOS PARA INSTALACI&Oacute;N MANUAL</span>
    <div style="font-family:${BODY_FONT};font-size:12px;color:${COLORS.inkTertiary};margin-top:6px;">Servidor SM-DP+ &middot; <span style="font-weight:700;color:${COLORS.inkSecondary};font-family:monospace;">${smdp}</span></div>
    <div style="font-family:${BODY_FONT};font-size:12px;line-height:1.45;color:${COLORS.inkTertiary};margin-top:3px;">C&oacute;digo manual &middot; <span style="font-weight:700;color:${COLORS.inkSecondary};font-family:monospace;word-break:break-all;">${activationString}</span></div>
  </div>`
}

/** Bloque "01 · CÓDIGO DE ACTIVACIÓN" + "02 · TU QR" — usado por Email 5 y Email 6. */
export function activationAndQrBlock(activationCode: string, qrCidOrUrl: string): string {
  return `<table role="presentation" width="100%"><tr>
    <td valign="top" style="width:55%;">
      <div style="font-family:${BODY_FONT};font-size:11px;font-weight:700;letter-spacing:0.08em;color:${COLORS.navy};margin-bottom:10px;">01 &middot; C&Oacute;DIGO DE ACTIVACI&Oacute;N</div>
      <table role="presentation"><tr><td style="background:${COLORS.bg};border:1px solid #EDE3CE;border-radius:14px;padding:14px 20px;">
        <div style="font-family:${HEADER_FONT};font-size:22px;letter-spacing:0.05em;color:${COLORS.navy};">${activationCode}</div>
      </td></tr></table>
      <div style="font-family:${BODY_FONT};font-size:12.5px;line-height:1.5;color:${COLORS.inkSecondary};margin-top:10px;">Tu celular te lo va a pedir durante la instalaci&oacute;n.</div>
    </td>
    <td valign="top" align="center" style="width:45%;">
      <div style="font-family:${BODY_FONT};font-size:11px;font-weight:700;letter-spacing:0.08em;color:${COLORS.navy};margin-bottom:10px;">02 &middot; TU QR</div>
      <table role="presentation"><tr><td style="background:${COLORS.white};border:1px solid #EDE7D8;border-radius:14px;padding:12px;">
        <img src="${qrCidOrUrl}" alt="C&oacute;digo QR de instalaci&oacute;n eSIM" width="150" height="150" style="width:150px;height:150px;display:block;border:0;">
      </td></tr></table>
    </td>
  </tr></table>`
}

const STEP_ICONS: Array<{ title: string; text: string; svg: string }> = [
  {
    title: "Desde este iPhone",
    text: 'Mantené presionado el QR correspondiente y elegí "Añadir eSIM".',
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.5 2.5c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.2 1-3 .8-.8 1.9-1.4 3-1.4z" fill="${COLORS.navy}"/><path d="M20.2 17.1c-.5 1.2-1.1 2.3-1.9 3.4-1 1.5-2 3-3.5 3-1.5 0-2-1-3.7-1s-2.2.9-3.6 1c-1.5.1-2.6-1.6-3.6-3-2-2.9-3.5-8.1-1.5-11.7 1-1.7 2.7-2.8 4.6-2.9 1.5 0 2.8 1 3.7 1s2.5-1.2 4.2-1c.7 0 2.7.3 4 2.2-3.5 2-2.9 6.9.3 8.4z" fill="${COLORS.navy}"/></svg>`,
  },
  {
    title: "En Android",
    text: "Buscá en Ajustes la opción para añadir una eSIM. El nombre y la ubicación pueden variar.",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 8.5h-10M6 9v9a1 1 0 001 1h1.2v2.3a1.2 1.2 0 002.4 0V19h2.8v2.3a1.2 1.2 0 002.4 0V19H17a1 1 0 001-1V9M4.5 9.3L3 6M19.5 9.3L21 6M8.5 4.3l-1-1.8M15.5 4.3l1-1.8" stroke="${COLORS.navy}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  },
  {
    title: "Desde otro dispositivo",
    text: "Abrí este email en otro equipo y escaneá el QR correspondiente.",
    svg: `<svg width="17" height="22" viewBox="0 0 24 30"><rect x="2" y="1" width="20" height="28" rx="3" fill="none" stroke="${COLORS.navy}" stroke-width="2"/><line x1="9" y1="25" x2="15" y2="25" stroke="${COLORS.navy}" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    title: "Instalación manual",
    text: "Ingresá los datos manualmente en la configuración de tu celular.",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="2" width="8" height="8" fill="${COLORS.navy}"/><rect x="14" y="2" width="8" height="8" fill="${COLORS.navy}"/><rect x="2" y="14" width="8" height="8" fill="${COLORS.navy}"/><rect x="15" y="15" width="2.5" height="2.5" fill="${COLORS.navy}"/><rect x="19" y="15" width="2.5" height="2.5" fill="${COLORS.navy}"/><rect x="15" y="19" width="2.5" height="2.5" fill="${COLORS.navy}"/><rect x="19" y="19" width="2.5" height="2.5" fill="${COLORS.navy}"/></svg>`,
  },
]

/** "03 · CÓMO INSTALARLAS" — 4 pasos, idéntico en Email 5 y Email 6. */
export function howToInstallBlock(): string {
  const cells = STEP_ICONS.map(
    (s) => `<td valign="top" style="width:25%;padding:0 10px;text-align:center;">
      <table role="presentation" width="52" height="52" style="background:#EFE6D2;border-radius:50%;margin:0 auto 12px;"><tr><td align="center">${s.svg}</td></tr></table>
      <div style="font-family:${BODY_FONT};font-size:13px;font-weight:700;color:${COLORS.navy};margin-bottom:6px;">${s.title}</div>
      <div style="font-family:${BODY_FONT};font-size:12px;line-height:1.5;color:${COLORS.inkSecondary};">${s.text}</div>
    </td>`
  ).join("")
  return whiteCard(`
    <table role="presentation" width="100%"><tr>
      <td style="width:26px;height:26px;">
        <table role="presentation" width="26" height="26" style="background:${COLORS.gold};border-radius:50%;"><tr><td align="center" style="font-family:${BODY_FONT};font-size:11px;font-weight:700;color:${COLORS.white};">03</td></tr></table>
      </td>
      <td style="padding-left:10px;font-family:${BODY_FONT};font-size:12px;font-weight:700;letter-spacing:0.1em;color:${COLORS.navy};">C&Oacute;MO INSTALARLAS</td>
    </tr></table>
    <div style="height:22px;"></div>
    <table role="presentation" width="100%"><tr>${cells}</tr></table>
  `, { padding: "36px 40px" })
}

/** "04 · CUANDO TE CONECTES" — idéntico en Email 5 y Email 6. */
export function whenConnectedBlock(): string {
  return whiteCard(`
    <table role="presentation" width="100%"><tr>
      <td style="width:26px;">
        <table role="presentation" width="26" height="26" style="background:${COLORS.gold};border-radius:50%;"><tr><td align="center" style="font-family:${BODY_FONT};font-size:11px;font-weight:700;color:${COLORS.white};">04</td></tr></table>
      </td>
      <td style="padding-left:10px;font-family:${BODY_FONT};font-size:12px;font-weight:700;letter-spacing:0.1em;color:${COLORS.navy};">CUANDO TE CONECTES</td>
    </tr></table>
    <div style="height:18px;"></div>
    <div style="font-family:${HEADER_FONT};font-size:21px;line-height:1.25;color:${COLORS.navy};margin-bottom:18px;">Activ&aacute; la conexi&oacute;n y disfrut&aacute; tu plan.</div>
    <div style="font-family:${BODY_FONT};font-size:14px;color:${COLORS.navy};line-height:1.6;margin-bottom:8px;">&#10003;&nbsp; Eleg&iacute; Ruta34 para datos m&oacute;viles.</div>
    <div style="font-family:${BODY_FONT};font-size:14px;color:${COLORS.navy};line-height:1.6;">&#10003;&nbsp; Manten&eacute; activada la itinerancia de datos de Ruta34.</div>
    <div style="font-family:${BODY_FONT};font-size:13.5px;line-height:1.6;color:${COLORS.inkSecondary};margin-top:20px;">Si viaj&aacute;s entre pa&iacute;ses incluidos en tu plan, dejala activada para seguir conectado.</div>
  `, { bg: COLORS.blueAccent, padding: "36px 40px" })
}

/** Nota editorial en itálica bajo separador dorado — patrón compartido por Email 5/6. */
export function italicNote(title: string, text: string): string {
  return `<div style="border-top:1px solid ${COLORS.gold};padding-top:18px;">
    <div style="font-family:${HEADER_FONT};font-style:italic;font-size:16px;color:${COLORS.navy};margin-bottom:10px;">${title}</div>
    <div style="font-family:${BODY_FONT};font-size:13.5px;line-height:1.6;color:${COLORS.inkSecondary};">${text}</div>
  </div>`
}

export function orderRefLine(orderRef: string): string {
  return `<span style="font-family:${BODY_FONT};">Pedido <span style="font-weight:700;color:${COLORS.navy};">${orderRef}</span></span>`
}

/** Card blanca con icono + eyebrow + valor — patrón "TU PLAN"/"FECHA DE ACTIVACIÓN"/"REFERENCIA DE PEDIDO". */
export function iconValueCard(iconSvg: string, eyebrowLabel: string, valueHtml: string, opts?: { eyebrowColor?: string }): string {
  return whiteCard(`
    <table role="presentation" width="100%"><tr>
      <td width="34" valign="top">
        <table role="presentation" width="34" height="34" style="background:#EFE6D2;border-radius:50%;"><tr><td align="center">${iconSvg}</td></tr></table>
      </td>
      <td style="padding-left:14px;">
        <div style="font-family:${BODY_FONT};font-size:10.5px;font-weight:700;letter-spacing:0.08em;color:${opts?.eyebrowColor ?? COLORS.navy};margin-bottom:3px;">${eyebrowLabel}</div>
        ${valueHtml}
      </td>
    </tr></table>
  `, { padding: "20px 26px" })
}

export const CHECK_ICON_SVG = `<svg width="16" height="13" viewBox="0 0 16 12"><path d="M1 6l4.5 4.5L15 1" stroke="${COLORS.white}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/** Card celeste con check dorado — bloque de tranquilidad ("no tenés que hacer nada"). */
export function reassuranceCard(title: string, text: string): string {
  return whiteCard(`
    <table role="presentation" width="100%"><tr>
      <td width="32" valign="top">
        <table role="presentation" width="32" height="32" style="background:${COLORS.gold};border-radius:50%;"><tr><td align="center">${CHECK_ICON_SVG}</td></tr></table>
      </td>
      <td style="padding-left:14px;">
        <div style="font-family:${HEADER_FONT};font-size:16px;color:${COLORS.navy};line-height:1.3;margin-bottom:6px;">${title}</div>
        <div style="font-family:${BODY_FONT};font-size:12.5px;line-height:1.5;color:${COLORS.inkSecondary};">${text}</div>
      </td>
    </tr></table>
  `, { bg: COLORS.blueAccent, padding: "26px 28px" })
}

/**
 * "REFERENCIAS DE PEDIDO" — lista compacta multi-eSIM, formato aprobado
 * literalmente en FASE 4B sección 5: "eSIM X de N · Ref. orderRef",
 * siempre en orden canónico (ver src/lib/esim/order.ts).
 */
export function multiRefsList(items: Array<{ label: string; orderRef: string }>): string {
  const rows = items.map(
    (it) => `<div style="font-family:${BODY_FONT};font-size:13.5px;line-height:1.8;color:${COLORS.inkSecondary};">${it.label} &middot; Ref. <span style="font-weight:700;color:${COLORS.navy};font-family:monospace;">${it.orderRef}</span></div>`
  ).join("")
  return whiteCard(`
    <div style="font-family:${BODY_FONT};font-size:10px;font-weight:700;letter-spacing:0.08em;color:${COLORS.inkTertiary};margin-bottom:10px;">REFERENCIAS DE PEDIDO</div>
    ${rows}
  `, { padding: "20px 26px" })
}

export const ICONS = {
  plan: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="12" rx="2" stroke="${COLORS.navy}" stroke-width="1.8"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="${COLORS.navy}" stroke-width="1.8"/></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="${COLORS.navy}" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="${COLORS.navy}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  receipt: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 3h8l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="${COLORS.navy}" stroke-width="1.6"/><path d="M9 12h6M9 16h6" stroke="${COLORS.navy}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
}

export const FONTS = { header: HEADER_FONT, body: BODY_FONT }
