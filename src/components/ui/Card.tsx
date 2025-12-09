import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "bordered";
    padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = "default",
            padding = "md",
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = "rounded-2xl transition-all duration-200";

        const variantStyles = {
            default: "bg-background-secondary",
            elevated: "bg-background-secondary shadow-lg hover:shadow-xl",
            bordered: "bg-background-secondary border border-border",
        };

        const paddingStyles = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export { Card };
