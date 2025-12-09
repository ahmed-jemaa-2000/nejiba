/**
 * Utility functions for Nejiba Studio
 */

/**
 * Merge class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string for display in Arabic
 */
export function formatDateArabic(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-TN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
}

/**
 * Format a time string for display in Arabic
 */
export function formatTimeArabic(timeString: string): string {
    try {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "مساءً" : "صباحًا";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    } catch {
        return timeString;
    }
}

/**
 * Generate a unique ID for elements
 */
export function generateId(prefix = "id"): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Check if we're running on the client side
 */
export function isClient(): boolean {
    return typeof window !== "undefined";
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}
