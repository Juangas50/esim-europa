"use client";

import PremiumTooltip from "./PremiumTooltip";

const CALLS_CONTENT = (
  <div className="space-y-4">
    {/* Main text */}
    <div>
      <p className="text-xs text-[var(--color-ink)] leading-relaxed mb-3">
        Todas las tarifas incluyen:
      </p>
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
          <span className="text-emerald-500 font-bold">✅</span>
          <span>Llamadas ilimitadas dentro de España</span>
        </li>
        <li className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
          <span className="text-lg">🌎</span>
          <span>Minutos internacionales incluidos</span>
        </li>
      </ul>
    </div>

    {/* Highlighted countries */}
    <div>
      <p className="text-xs font-semibold text-[var(--color-navy)] mb-2">
        Destinos destacados
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { flag: "🇦🇷", country: "Argentina" },
          { flag: "🇧🇷", country: "Brasil" },
          { flag: "🇺🇾", country: "Uruguay" },
          { flag: "🇨🇱", country: "Chile" },
          { flag: "🇵🇾", country: "Paraguay" },
        ].map((item) => (
          <div
            key={item.country}
            className="flex items-center gap-1.5 text-xs text-[var(--color-ink)]"
          >
            <span className="text-base">{item.flag}</span>
            <span>{item.country}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-ink-2)] mt-2">
        ➕ Más de 60 destinos internacionales.
      </p>
    </div>
  </div>
);

const CALLS_FOOTER =
  "Los minutos disponibles dependen de la tarifa contratada y del país de destino.";

export default function CallsTooltip() {
  return (
    <PremiumTooltip
      title="Llamadas incluidas"
      content={CALLS_CONTENT}
      footer={CALLS_FOOTER}
      cta={{
        label: "Ver detalle completo",
        href: "#faq",
      }}
      icon="ⓘ"
    >
      {/* This is just a placeholder, the trigger is handled inside */}
      <span />
    </PremiumTooltip>
  );
}
