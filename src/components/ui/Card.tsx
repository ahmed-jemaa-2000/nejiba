import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "bordered" | "glass" | "glow";
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = "default",
            padding = "md",
            hover = false,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = "rounded-2xl transition-all duration-300";

        const variantStyles = {
            default: "bg-background-secondary",
            elevated: "bg-background-secondary shadow-lg hover:shadow-xl",
            bordered: "bg-background-secondary/80 border border-border backdrop-blur-sm",
            glass: "bg-background-secondary/40 backdrop-blur-xl border border-white/10 shadow-xl",
            glow: "bg-gradient-to-br from-background-secondary to-background-tertiary border border-accent/20 shadow-lg shadow-accent/5",
        };

        const paddingStyles = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        const hoverStyles = hover
            ? "hover:-translate-y-1 hover:shadow-2xl hover:border-accent/30 cursor-pointer"
            : "";

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export { Card };
