"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2";

    // Emil Kowalski: scale(0.97) on :active, ease-out-expo
    // Reduced motion support for accessibility
    const press = "motion-safe:active:scale-[0.97] motion-reduce:active:scale-100";

    const variants = {
      primary:
        "bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)] shadow-lg",
      secondary:
        "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-medium)]",
      outline:
        "border border-[var(--color-navy)]/15 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5 bg-white",
      ghost:
        "text-[var(--color-navy)] hover:bg-[var(--color-navy)]/6",
    };

    const sizes = {
      sm: "text-sm px-4 py-2",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          base,
          press,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, box-shadow 200ms ease" }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
