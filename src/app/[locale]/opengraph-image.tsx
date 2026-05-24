import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RUTA34 Telecom — eSIM para Europa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ── Per-locale copy ──────────────────────────────────────────────────────────
const COPY = {
  es: {
    headline: "Llegás a Europa",
    accent: "y ya estás conectado.",
    sub: "eSIM instantánea · 30+ países · Desde USD 39.90",
  },
  pt: {
    headline: "Chega na Europa",
    accent: "e já está conectado.",
    sub: "eSIM instantâneo · 30+ países · A partir de USD 39,90",
  },
} as const;

// ── Image ────────────────────────────────────────────────────────────────────
export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = COPY[locale as "es" | "pt"] ?? COPY.es;

  // Inter 700 via JSDelivr (fontsource mirror) — woff is Satori-compatible
  let fontData: ArrayBuffer | undefined;
  try {
    fontData = await fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-700-normal.woff"
    ).then((r) => r.arrayBuffer());
  } catch {
    // Falls back to system-ui — image still renders, just without Inter
  }

  const fonts = fontData
    ? [
        {
          name: "Inter",
          data: fontData,
          style: "normal" as const,
          weight: 700 as const,
        },
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#111111",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Red left accent stripe ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "6px",
            height: "630px",
            backgroundColor: "#E60000",
          }}
        />

        {/* ── Blue ambient glow — top right ── */}
        <div
          style={{
            position: "absolute",
            right: "-140px",
            top: "-140px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            backgroundColor: "#6EC1E4",
            opacity: 0.07,
          }}
        />

        {/* ── Red ambient glow — bottom left ── */}
        <div
          style={{
            position: "absolute",
            left: "60px",
            bottom: "-120px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            backgroundColor: "#E60000",
            opacity: 0.06,
          }}
        />

        {/* ── Main content ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px 60px 88px",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "#E60000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              34
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.4px",
                  lineHeight: 1,
                }}
              >
                RUTA34
              </span>
              <span
                style={{
                  color: "#555555",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  lineHeight: 1,
                  marginTop: "4px",
                }}
              >
                TELECOM
              </span>
            </div>
          </div>

          {/* Headline block */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "84px",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-2.5px",
              }}
            >
              {copy.headline}
            </span>
            <span
              style={{
                color: "#E60000",
                fontSize: "84px",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-2.5px",
              }}
            >
              {copy.accent}
            </span>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                color: "#777777",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.3px",
              }}
            >
              {copy.sub}
            </span>
            <span
              style={{
                color: "#3A3A3A",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              ruta34.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
