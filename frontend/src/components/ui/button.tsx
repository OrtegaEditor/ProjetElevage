import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "./utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-[#2E7D32] text-white hover:bg-[#1B5E20] focus:ring-[#2E7D32]":
              variant === "primary",
            "bg-[#1E88E5] text-white hover:bg-[#1565C0] focus:ring-[#1E88E5]":
              variant === "secondary",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300":
              variant === "outline",
            "text-gray-700 hover:bg-gray-100 focus:ring-gray-300":
              variant === "ghost",
            "bg-[#E53935] text-white hover:bg-[#C62828] focus:ring-[#E53935]":
              variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
