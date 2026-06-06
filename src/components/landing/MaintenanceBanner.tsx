"use client";

import { useEffect } from "react";

export default function MaintenanceBanner() {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  useEffect(() => {
    if (isMaintenanceMode) {
      // Bloquea scroll y interacciones
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isMaintenanceMode]);

  if (!isMaintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-md text-center">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-lg bg-[#E60000] flex items-center justify-center">
              <span className="text-white text-2xl font-black">34</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-[#111111] mb-3">
            ¡Muy pronto!
          </h1>

          {/* Description */}
          <p className="text-[#555555] leading-relaxed mb-8">
            Estamos preparando todo para que compres tu eSIM de forma segura. Volvemos este fin de semana.
          </p>

          {/* Emoji */}
          <div className="text-5xl mb-6">⚡</div>

          {/* Sleep message */}
          <p className="text-sm text-[#999999] italic">
            (Mientras tanto, estamos tomando café ☕)
          </p>
        </div>
      </div>
    </div>
  );
}
