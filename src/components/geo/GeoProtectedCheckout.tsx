"use client";

import { useEffect, useState } from "react";
import GeoBlockedPage from "./GeoBlockedPage";

interface GeoCheckResult {
  blocked: boolean;
  country: string;
  ip: string;
}

interface GeoProtectedCheckoutProps {
  children: React.ReactNode;
}

export default function GeoProtectedCheckout({ children }: GeoProtectedCheckoutProps) {
  const [geoData, setGeoData] = useState<GeoCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkGeo() {
      try {
        const res = await fetch("/api/geo-check");
        const data = await res.json();
        setGeoData(data);
        console.log("Geo check:", data);
      } catch (error) {
        console.error("Geo check failed:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    checkGeo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-gold)]/20 border-t-[var(--color-gold)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-ink-2)]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (geoData?.blocked) {
    return <GeoBlockedPage />;
  }

  return (
    <>
      {/* Debug panel (development only) */}
      {process.env.NODE_ENV === "development" && geoData && (
        <div className="fixed top-4 right-4 bg-[var(--color-navy)] text-white px-3 py-2 rounded text-xs z-50 opacity-75">
          <div>🌍 {geoData.country} | {geoData.ip}</div>
          <div>{geoData.blocked ? "❌ BLOQUEADO" : "✅ PERMITIDO"}</div>
        </div>
      )}
      {children}
    </>
  );
}
