import React from "react";

type LogoVariant =
  | "isotipo"
  | "horizontal-completo"
  | "horizontal-reducido"
  | "vertical-completo"
  | "principal"
  | "invertido"
  | "dorado"
  | "monocromatico-oscuro"
  | "monocromatico-blanco"
  | "sobre-gradiente";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  className?: string;
}

const LOGO_MAP: Record<LogoVariant, string> = {
  isotipo: "/logos/isotipo.svg",
  "horizontal-completo": "/logos/horizontal-completo-principal.svg",
  "horizontal-reducido": "/logos/horizontal-reducido-principal.svg",
  "vertical-completo": "/logos/vertical-completo-principal.svg",
  principal: "/logos/horizontal-completo-principal.svg",
  invertido: "/logos/horizontal-completo-invertido-fondo-navy.svg",
  dorado: "/logos/horizontal-completo-dorado-fondo-acento.svg",
  "monocromatico-oscuro": "/logos/horizontal-completo-monocromatico-oscuro.svg",
  "monocromatico-blanco": "/logos/horizontal-completo-monocromatico-blanco.svg",
  "sobre-gradiente": "/logos/horizontal-completo-sobre-gradiente.svg",
};

const SIZE_MAP: Record<LogoSize, string> = {
  xs: "h-6",
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-16",
};

export default function Logo({
  variant = "horizontal-reducido",
  size = "md",
  href = "/",
  className = "",
}: LogoProps) {
  const logoPath = LOGO_MAP[variant];

  const Logo = (
    <img
      src={logoPath}
      alt="RUTA34 Logo"
      className={`${SIZE_MAP[size]} w-auto object-contain ${className}`}
      style={{ aspectRatio: "auto" }}
    />
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {Logo}
      </a>
    );
  }

  return Logo;
}
