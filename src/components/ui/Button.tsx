"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "gradient" | "glow";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            icon,
            fullWidth = false,
            className = "",
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center gap-3 font-medium rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

        const variantStyles = {
            primary:
                "bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-xl hover:shadow-accent/25",
            secondary:
                "bg-background-tertiary hover:bg-border border border-border hover:border-border-hover text-foreground",
            ghost:
                "bg-transparent hover:bg-background-tertiary text-foreground-secondary hover:text-foreground",
            gradient:
                "bg-gradient-to-r from-accent via-accent-hover to-accent text-white shadow-lg hover:shadow-xl hover:shadow-accent/30 bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500",
            glow:
                "bg-accent text-white shadow-lg shadow-accent/40 hover:shadow-xl hover:shadow-accent/60 ring-2 ring-accent/30 hover:ring-accent/50",
        };

        const sizeStyles = {
            sm: "px-3 py-2 text-sm min-h-[36px]",
            md: "px-4 py-2.5 text-base min-h-[44px]",
            lg: "px-6 py-3 text-lg min-h-[52px]",
            xl: "px-8 py-5 text-xl min-h-[72px]",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    icon
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };

