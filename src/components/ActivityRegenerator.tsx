"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { WorkshopPlanData, WorkshopActivity } from "@/app/workshop/page";

interface ActivityRegeneratorProps {
    workshopPlan: WorkshopPlanData;
    activityIndex: number;
    onActivitySelected: (activity: WorkshopActivity) => void;
    onCancel: () => void;
}

type Mode = "options" | "regenerating" | "alternatives" | "custom";

export function ActivityRegenerator({
    workshopPlan,
    activityIndex,
    onActivitySelected,
    onCancel,
}: ActivityRegeneratorProps) {
    const [mode, setMode] = useState<Mode>("options");
    const [isLoading, setIsLoading] = useState(false);
    const [alternatives, setAlternatives] = useState<WorkshopActivity[]>([]);
    const [customPrompt, setCustomPrompt] = useState("");
    const [error, setError] = useState<string | null>(null);

    const regenerateSingle = async (customInstructions?: string) => {
        setMode("regenerating");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/regenerate-activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workshopPlan,
                    activityIndex,
                    customInstructions,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "فشل في تجديد النشاط");
            }

            const { activity } = await response.json();
            onActivitySelected(activity);
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ");
            setMode("options");
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlternatives = async () => {
        setMode("alternatives");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/regenerate-activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workshopPlan,
                    activityIndex,
                    getAlternatives: true,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "فشل في إنشاء البدائل");
            }

            const { alternatives: alts } = await response.json();
            setAlternatives(alts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ");
            setMode("options");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomSubmit = () => {
        if (customPrompt.trim()) {
            regenerateSingle(customPrompt);
        }
    };

    // Options Mode
    if (mode === "options") {
        return (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                <button
                    onClick={() => regenerateSingle()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all duration-200"
                >
                    <span>🔄</span>
                    <span>جدّد تلقائياً</span>
                </button>
                <button
                    onClick={loadAlternatives}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background-secondary hover:bg-background-tertiary border border-border hover:border-accent/50 rounded-lg transition-all duration-200"
                >
                    <span>🎲</span>
                    <span>3 بدائل</span>
                </button>
                <button
                    onClick={() => setMode("custom")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background-secondary hover:bg-background-tertiary border border-border hover:border-accent/50 rounded-lg transition-all duration-200"
                >
                    <span>✏️</span>
                    <span>تعديل مخصص</span>
                </button>
                <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground rounded-lg transition-all duration-200"
                >
                    <span>✕</span>
                    <span>إلغاء</span>
                </button>
                {error && (
                    <p className="w-full text-sm text-error mt-2">{error}</p>
                )}
            </div>
        );
    }

    // Regenerating Mode
    if (mode === "regenerating") {
        return (
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg animate-pulse">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-accent">جاري إنشاء نشاط جديد...</span>
            </div>
        );
    }

    // Alternatives Mode
    if (mode === "alternatives") {
        if (isLoading) {
            return (
                <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg animate-pulse">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-accent">جاري إنشاء 3 بدائل...</span>
                </div>
            );
        }

        return (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">اختر بديلاً:</h4>
                    <button
                        onClick={onCancel}
                        className="text-sm text-foreground-secondary hover:text-foreground"
                    >
                        ✕ إلغاء
                    </button>
                </div>

                <div className="grid gap-2">
                    {alternatives.map((alt, i) => (
                        <button
                            key={i}
                            onClick={() => onActivitySelected(alt)}
                            className="text-start p-3 bg-background-secondary hover:bg-background-tertiary border border-border hover:border-accent rounded-lg transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg opacity-60 group-hover:opacity-100">
                                    {i === 0 ? "🌟" : i === 1 ? "🎯" : "✨"}
                                </span>
                                <div>
                                    <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                                        {alt.title}
                                    </p>
                                    <p className="text-sm text-foreground-secondary line-clamp-2">
                                        {alt.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {error && (
                    <p className="text-sm text-error">{error}</p>
                )}
            </div>
        );
    }

    // Custom Mode
    if (mode === "custom") {
        return (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">تعليمات مخصصة:</h4>
                    <button
                        onClick={onCancel}
                        className="text-sm text-foreground-secondary hover:text-foreground"
                    >
                        ✕ إلغاء
                    </button>
                </div>

                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="مثال: اجعل النشاط أكثر حركة، أو ركز على العمل الجماعي..."
                    className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows={2}
                    autoFocus
                />

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleCustomSubmit}
                        disabled={!customPrompt.trim()}
                        loading={isLoading}
                    >
                        🔄 جدّد بهذه التعليمات
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("options")}
                    >
                        رجوع
                    </Button>
                </div>

                {error && (
                    <p className="text-sm text-error">{error}</p>
                )}
            </div>
        );
    }

    return null;
}
