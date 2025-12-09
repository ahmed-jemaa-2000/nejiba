"use client";

import Link from "next/link";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
}

export function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
    return (
        <header className="mb-8">
            {backHref && (
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4 group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="rotate-180 group-hover:translate-x-1 transition-transform"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span>العودة للرئيسية</span>
                </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
            {subtitle && (
                <p className="mt-2 text-lg text-foreground-secondary">{subtitle}</p>
            )}
        </header>
    );
}
