"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectOption {
    value: string;
    label: string;
    sublabel?: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, placeholder, className = "", onChange, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={`w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-foreground 
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-all duration-200 cursor-pointer
                   appearance-none ${className}`}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                        {option.sublabel && ` - ${option.sublabel}`}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = "Select";

export { Select };
