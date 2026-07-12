import "flag-icons/css/flag-icons.min.css";

interface FlagIconProps {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "ES", "EU", "US")
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-3.5 h-2.5",
  md: "w-5 h-3.5",
  lg: "w-7 h-5",
};

export default function FlagIcon({ code, size = "md", className = "" }: FlagIconProps) {
  return (
    <span
      className={`fi fi-${code.toLowerCase()} inline-block ${sizeMap[size]} ${className}`}
      style={{
        lineHeight: "1",
        verticalAlign: "middle",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "1px",
        opacity: 0.95,
        filter: "saturate(0.95) brightness(1.02)",
      }}
    />
  );
}
