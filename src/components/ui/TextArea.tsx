"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className = "", error, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`w-full px-4 py-3 bg-background-tertiary border rounded-xl text-foreground 
                   placeholder:text-foreground-secondary/60
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-all duration-200 resize-y min-h-[100px]
                   ${error ? "border-error" : "border-border"}
                   ${className}`}
                {...props}
            />
        );
    }
);

TextArea.displayName = "TextArea";

export { TextArea };
