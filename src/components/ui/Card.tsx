import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[var(--color-border)] shadow-sm rounded-lg p-6",
        hover && "transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}
