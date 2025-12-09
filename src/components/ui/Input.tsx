"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, type = "text", ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                className={`w-full px-4 py-3 bg-background-tertiary border rounded-xl text-foreground 
                   placeholder:text-foreground-secondary/60
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-all duration-200
                   ${error ? "border-error" : "border-border"}
                   ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
