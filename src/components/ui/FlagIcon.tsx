import "flag-icons/css/flag-icons.min.css";

interface FlagIconProps {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "ES", "EU", "US")
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-3",
  md: "w-6 h-4.5",
  lg: "w-8 h-6",
};

export default function FlagIcon({ code, size = "md", className = "" }: FlagIconProps) {
  return (
    <span
      className={`fi fi-${code.toLowerCase()} inline-block ${sizeMap[size]} ${className}`}
      style={{ lineHeight: 0 }}
    />
  );
}
