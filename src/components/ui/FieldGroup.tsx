import { ReactNode } from "react";

interface FieldGroupProps {
    label: string;
    sublabel?: string;
    htmlFor?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}

export function FieldGroup({
    label,
    sublabel,
    htmlFor,
    error,
    required,
    children,
}: FieldGroupProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-foreground"
            >
                {label}
                {required && <span className="text-error me-1">*</span>}
                {sublabel && (
                    <span className="text-foreground-secondary font-normal ms-2">
                        {sublabel}
                    </span>
                )}
            </label>
            {children}
            {error && <p className="text-sm text-error">{error}</p>}
        </div>
    );
}
