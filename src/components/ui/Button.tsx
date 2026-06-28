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
      "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    // Emil Kowalski: scale(0.97) on :active, ease-out-expo
    const press = "active:scale-[0.97]";

    const variants = {
      primary:
        "bg-[#C9973A] text-[#1B2F4E] hover:bg-[#E8C56A] shadow-[0_2px_12px_-2px_rgba(201,151,58,0.35)]",
      secondary:
        "bg-[#1B2F4E] text-white hover:bg-[#0F1A2E]",
      outline:
        "border border-[#1B2F4E]/15 text-[#1B2F4E] hover:bg-[#1B2F4E]/5 bg-white",
      ghost:
        "text-[#1B2F4E] hover:bg-[#1B2F4E]/6",
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
