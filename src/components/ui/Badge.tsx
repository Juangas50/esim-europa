import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "red" | "blue" | "dark" | "outline";
  className?: string;
}

export default function Badge({
  children,
  variant = "outline",
  className,
}: BadgeProps) {
  const variants = {
    red: "bg-[var(--color-gold)] text-white",
    blue: "bg-[#EBF6FC] text-[#2a7fa5]",
    dark: "bg-[var(--color-navy)] text-white",
    outline: "border border-[var(--color-navy)]/12 text-[var(--color-ink-2)] bg-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
