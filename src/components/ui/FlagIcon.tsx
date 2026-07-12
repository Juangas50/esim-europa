import Image from "next/image";

interface FlagIconProps {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "ES", "BR", "AR")
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 16, height: 12 },
  md: { width: 20, height: 15 },
  lg: { width: 24, height: 18 },
};

export default function FlagIcon({ code, size = "md", className = "" }: FlagIconProps) {
  const { width, height } = sizeMap[size];

  return (
    <Image
      src={`https://flagcdn.com/${width}x${height}/${code.toLowerCase()}.png`}
      alt={code}
      width={width}
      height={height}
      className={`inline-block ${className}`}
      loading="lazy"
    />
  );
}
