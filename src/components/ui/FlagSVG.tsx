interface FlagSVGProps {
  code: string; // ISO country code
  size?: "sm" | "md" | "lg";
  className?: string;
}

const flags: Record<string, React.ReactNode> = {
  ES: (
    <svg viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="750" height="500" fill="#FFC400" />
      <rect y="166.67" width="750" height="166.67" fill="#C60C30" />
      <rect y="333.33" width="750" height="166.67" fill="#FFC400" />
    </svg>
  ),
  EU: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#003399" />
      <circle cx="450" cy="300" r="180" fill="none" stroke="#FFD700" strokeWidth="30" />
      {[0, 51.43, 102.86, 154.29, 205.71, 257.14, 308.57].map((angle, i) => (
        <circle
          key={i}
          cx={450 + 180 * Math.cos((angle - 90) * Math.PI / 180)}
          cy={300 + 180 * Math.sin((angle - 90) * Math.PI / 180)}
          r="25"
          fill="#FFD700"
        />
      ))}
    </svg>
  ),
  US: (
    <svg viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
      <rect width="7410" height="3900" fill="#B22234" />
      <rect y="300" width="7410" height="300" fill="white" />
      <rect y="900" width="7410" height="300" fill="white" />
      <rect y="1500" width="7410" height="300" fill="white" />
      <rect y="2100" width="7410" height="300" fill="white" />
      <rect y="2700" width="7410" height="300" fill="white" />
      <rect y="3300" width="7410" height="300" fill="white" />
      <rect width="2964" height="2100" fill="#3C3B6B" />
    </svg>
  ),
  IS: (
    <svg viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="12" fill="#003399" />
      <rect y="5" width="18" height="2" fill="white" />
      <rect x="7" width="4" height="12" fill="white" />
      <rect y="5.5" width="18" height="1" fill="#FF0000" />
      <rect x="7.5" width="3" height="12" fill="#FF0000" />
    </svg>
  ),
  NO: (
    <svg viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="16" fill="#BA0C2F" />
      <rect y="6" width="22" height="4" fill="white" />
      <rect x="8" width="6" height="16" fill="white" />
      <rect y="6.5" width="22" height="3" fill="#00205B" />
      <rect x="8.5" width="5" height="16" fill="#00205B" />
    </svg>
  ),
  LI: (
    <svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="3" fill="#002B7F" />
      <rect y="1.5" width="5" height="1.5" fill="#CE1126" />
      <polygon points="0.5,0.3 0.7,1 0 1 0.5,1.5 0.2,2.2 0.5,1.5 1.2,1.5 0.7,1" fill="#FFD700" />
    </svg>
  ),
  CH: (
    <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="1000" fill="#FF0000" />
      <rect x="200" y="400" width="600" height="200" fill="white" />
      <rect x="400" y="200" width="200" height="600" fill="white" />
    </svg>
  ),
  TR: (
    <svg viewBox="0 0 4 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="4" height="3" fill="#CE1126" />
      <circle cx="1.2" cy="1.5" r="0.6" fill="white" />
      <polygon points="1.6,1.1 1.8,1.5 1.6,1.9 1.7,1.5" fill="white" />
    </svg>
  ),
  AR: (
    <svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
      <rect width="9" height="6" fill="#75AADB" />
      <rect y="2" width="9" height="2" fill="white" />
    </svg>
  ),
  BR: (
    <svg viewBox="0 0 14 10" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="10" fill="#002776" />
      <polygon points="7,1 10,9 4,9" fill="#FFD700" />
      <circle cx="7" cy="5" r="2.5" fill="#002776" />
    </svg>
  ),
  UY: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="2" fill="#0052B4" />
      {[0, 0.25, 0.5, 0.75].map((y, i) => (
        <rect key={i} y={y * 2} width="3" height="0.25" fill="white" />
      ))}
      <rect width="1" height="1" fill="white" />
      <circle cx="0.35" cy="0.35" r="0.25" fill="#FFD700" />
    </svg>
  ),
  CL: (
    <svg viewBox="0 0 4 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="4" height="3" fill="#0039A6" />
      <rect x="0" y="1" width="4" height="2" fill="white" />
      <rect x="0" y="1.4" width="4" height="1.2" fill="#D52B1E" />
      <polygon points="0.8,1.3 1,2 1.8,2 1.2,2.5 1.4,3.2 0.8,2.7 0.2,3.2 0.4,2.5 -0.2,2 0.6,2" fill="#FFD700" />
    </svg>
  ),
  PY: (
    <svg viewBox="0 0 4 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="4" height="3" fill="#CE1126" />
      <rect y="1" width="4" height="1" fill="white" />
      <rect y="2" width="4" height="1" fill="#003399" />
      <circle cx="2" cy="1.5" r="0.4" fill="#FFD700" />
    </svg>
  ),
};

const sizeMap = {
  sm: "w-4 h-3",
  md: "w-6 h-4",
  lg: "w-8 h-6",
};

export default function FlagSVG({ code, size = "md", className = "" }: FlagSVGProps) {
  const flagSVG = flags[code.toUpperCase()];

  if (!flagSVG) return null;

  return (
    <div className={`inline-flex items-center ${sizeMap[size]} ${className}`}>
      {flagSVG}
    </div>
  );
}
