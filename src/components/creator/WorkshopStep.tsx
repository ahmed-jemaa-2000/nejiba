"use client";

import { useState, useEffect } from "react";
import { Button, Card, Select } from "@/components/ui";
import { WorkshopPlan } from "@/components/WorkshopPlan";
import type { CreatorState } from "@/app/create/page";
import type { WorkshopPlanData, WorkshopActivity } from "@/app/workshop/page";

interface WorkshopStepProps {
    state: CreatorState;
    updateState: (updates: Partial<CreatorState>) => void;
    onPlanGenerated: (plan: WorkshopPlanData) => void;
    onActivityUpdated: (index: number, activity: WorkshopActivity) => void;
    onBack: () => void;
    onNext: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const DURATION_OPTIONS = [
    { value: "30", label: "30 دقيقة", sublabel: "ورشة قصيرة" },
    { value: "45", label: "45 دقيقة", sublabel: "ورشة متوسطة" },
    { value: "60", label: "60 دقيقة", sublabel: "ورشة كاملة" },
];

const AGE_OPTIONS = [
    { value: "6-8", label: "6-8 سنة", sublabel: "أطفال صغار" },
    { value: "8-10", label: "8-10 سنة", sublabel: "أطفال" },
    { value: "10-12", label: "10-12 سنة", sublabel: "ما قبل المراهقة" },
    { value: "mixed", label: "أعمار مختلطة", sublabel: "6-12 سنة" },
];

export function WorkshopStep({
    state,
    updateState,
    onPlanGenerated,
    onActivityUpdated,
    onBack,
    onNext,
    isLoading,
    setIsLoading,
}: WorkshopStepProps) {
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-generation removed to allow manual configuration first
    useEffect(() => {
        // Only reset generating state if needed, but do not auto-trigger
        if (!state.workshopPlan) {
            // Ready for user input
        }
    }, [state.topic]);

    const generatePlan = async () => {
        if (!state.topic) return;

        setIsGenerating(true);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/generate-workshop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: state.topic,
                    duration: state.duration,
                    ageRange: state.ageRange,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.code === "NO_API_KEY") {
                    // Use fallback to old endpoint
                    const fallbackResponse = await fetch("/api/generate-workshop", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topic: state.topic,
                            duration: state.duration,
                            ageRange: state.ageRange,
                        }),
                    });
                    const fallbackData = await fallbackResponse.json();
                    onPlanGenerated(fallbackData);
                    return;
                }
                throw new Error(data.error || "فشل في إنشاء الخطة");
            }

            const plan = await response.json();
            onPlanGenerated(plan);
        } catch (err) {
            console.error("Generation error:", err);
            setError("حدث خطأ أثناء إنشاء الخطة. جاري المحاولة مجدداً...");

            // Try fallback endpoint
            try {
                const fallbackResponse = await fetch("/api/generate-workshop", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        topic: state.topic,
                        duration: state.duration,
                        ageRange: state.ageRange,
                    }),
                });
                const fallbackData = await fallbackResponse.json();
                onPlanGenerated(fallbackData);
                setError(null);
            } catch {
                setError("حدث خطأ. يرجى المحاولة مجدداً.");
            }
        } finally {
            setIsGenerating(false);
            setIsLoading(false);
        }
    };

    // Show loading state
    if (isGenerating && !state.workshopPlan) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="relative">
                    <span className="text-6xl animate-bounce" style={{ animationDuration: "1.5s" }}>
                        📋
                    </span>
                    <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>
                </div>
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mt-6" />
                <h3 className="text-xl font-bold text-foreground mt-6">جاري إنشاء خطة الورشة</h3>
                <p className="text-foreground-secondary mt-2">لموضوع: {state.topic}</p>
                <div className="flex gap-1 mt-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-accent animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Show plan or settings
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Topic & Settings Header */}
            <Card variant="bordered" padding="md">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-foreground-secondary">الموضوع المختار</p>
                        <h2 className="text-xl font-bold text-foreground">{state.topic}</h2>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 min-w-[120px]">
                            <Select
                                value={state.duration}
                                onChange={(value) => updateState({ duration: value as CreatorState["duration"] })}
                                options={DURATION_OPTIONS}
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <Select
                                value={state.ageRange}
                                onChange={(value) => updateState({ ageRange: value as CreatorState["ageRange"] })}
                                options={AGE_OPTIONS}
                            />
                        </div>
                    </div>
                </div>

                {!state.workshopPlan && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <Button onClick={generatePlan} loading={isGenerating} fullWidth>
                            ✨ إنشاء خطة الورشة
                        </Button>
                    </div>
                )}
            </Card>

            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                    {error}
                </div>
            )}

            {/* Workshop Plan Display */}
            {state.workshopPlan && (
                <>
                    <WorkshopPlan
                        plan={state.workshopPlan}
                        input={{
                            topic: state.topic,
                            duration: state.duration,
                            ageRange: state.ageRange,
                        }}
                        onBack={onBack}
                        onRegenerate={generatePlan}
                        isRegenerating={isGenerating}
                        onUpdateActivity={onActivityUpdated}
                    />

                    {/* Navigation */}
                    <Card variant="bordered" padding="md" className="bg-gradient-to-r from-accent/10 to-transparent">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-foreground">الخطوة التالية</h3>
                                <p className="text-sm text-foreground-secondary">
                                    إنشاء ملصق احترافي لهذه الورشة
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={onNext}
                                icon={<span>🎨</span>}
                            >
                                إنشاء الملصق ←
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
