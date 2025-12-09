"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "loading";
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: Toast["type"], duration?: number) => string;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast["type"] = "info", duration = 3000): string => {
        const id = Math.random().toString(36).slice(2);
        const toast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0 && type !== "loading") {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} dismissToast={dismissToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastContainer({ toasts, dismissToast }: { toasts: Toast[]; dismissToast: (id: string) => void }) {
    if (toasts.length === 0) return null;

    const icons = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        loading: "⏳",
    };

    const colors = {
        success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
        error: "bg-red-500/20 border-red-500/40 text-red-300",
        info: "bg-accent/20 border-accent/40 text-accent",
        loading: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300 ${colors[toast.type]}`}
                    onClick={() => dismissToast(toast.id)}
                >
                    <span className="text-lg">
                        {toast.type === "loading" ? (
                            <span className="animate-spin inline-block">⏳</span>
                        ) : (
                            icons[toast.type]
                        )}
                    </span>
                    <span className="flex-1 text-sm font-medium">{toast.message}</span>
                    {toast.type !== "loading" && (
                        <button className="text-xs opacity-60 hover:opacity-100">✕</button>
                    )}
                </div>
            ))}
        </div>
    );
}
