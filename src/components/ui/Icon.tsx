import React from "react";

interface IconProps {
  name:
    | "ubicacion"
    | "activar"
    | "avion"
    | "europa-mundo"
    | "mapa"
    | "pago-seguro"
    | "qr-code"
    | "soporte"
    | "equipaje"
    | "pasaporte"
    | "conectado"
    | "celular"
    | "esim-chip"
    | "senal-wifi"
    | "check"
    | "seguridad"
    | "valoracion"
    | "2-minutos"
    | "info-tooltip"
    | "compartir"
    | "comprar"
    | "comparar"
    | "planes-lista"
    | "cta-accion"
    | "faq";
  size?: "sm" | "md" | "lg" | "xl";
  color?: "navy" | "dorado" | "white" | "gray" | "success";
  className?: string;
}

const ICON_MAP: Record<string, string> = {
  ubicacion: "/icons/ubicacion.svg",
  activar: "/icons/activacion-rapida.svg",
  avion: "/icons/viaje.svg",
  "europa-mundo": "/icons/cobertura-ue.svg",
  mapa: "/icons/compatibilidad.svg",
  "pago-seguro": "/icons/pago-seguro.svg",
  "qr-code": "/icons/qr-email.svg",
  soporte: "/icons/soporte.svg",
  equipaje: "/icons/red-4g-5g.svg",
  pasaporte: "/icons/roaming.svg",
  conectado: "/icons/sin-renovacion.svg",
  celular: "/icons/numero-espanol.svg",
  "esim-chip": "/icons/compatibilidad.svg",
  "senal-wifi": "/icons/red-4g-5g.svg",
  check: "/icons/sin-renovacion.svg",
  seguridad: "/icons/pago-seguro.svg",
  valoracion: "/icons/cobertura-ue.svg",
  "2-minutos": "/icons/activacion-rapida.svg",
  "info-tooltip": "/icons/compatibilidad.svg",
  compartir: "/icons/cobertura-ue.svg",
  comprar: "/icons/viaje.svg",
  comparar: "/icons/compatibilidad.svg",
  "planes-lista": "/icons/cobertura-ue.svg",
  "cta-accion": "/icons/activacion-rapida.svg",
  faq: "/icons/compatibilidad.svg",
};

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const COLOR_MAP = {
  navy: "[&>svg]:stroke-[#1B2F4E] [&>svg]:fill-none",
  dorado: "[&>svg]:stroke-[#C9973A] [&>svg]:fill-none",
  white: "[&>svg]:stroke-white [&>svg]:fill-none",
  gray: "[&>svg]:stroke-[#64748B] [&>svg]:fill-none",
  success: "[&>svg]:stroke-[#059669] [&>svg]:fill-[#059669]",
};

export default function Icon({
  name,
  size = "md",
  color = "navy",
  className = "",
}: IconProps) {
  const iconPath = ICON_MAP[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <img
      src={iconPath}
      alt={name}
      className={`${SIZE_MAP[size]} ${COLOR_MAP[color]} ${className}`}
      style={{ minWidth: SIZE_MAP[size].split(" ")[0] }}
    />
  );
}
