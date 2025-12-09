"use client";

import { useState, useEffect } from "react";
import { Button, Card, Select } from "@/components/ui";
import { WorkshopPlan } from "@/components/WorkshopPlan";
import {
    MATERIALS_LIBRARY,
    MATERIAL_CATEGORIES,
    getMaterialsByCategory,
    suggestMaterialsForTopic
} from "@/lib/workshop/materials";
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
    const [expandedCategory, setExpandedCategory] = useState<string | null>("basic");

    // Auto-suggest materials based on topic
    useEffect(() => {
        if (state.topic && state.selectedMaterials.length === 0) {
            const suggestions = suggestMaterialsForTopic(state.topic);
            updateState({ selectedMaterials: suggestions });
        }
    }, [state.topic]);

    const toggleMaterial = (materialId: string) => {
        const current = state.selectedMaterials;
        const updated = current.includes(materialId)
            ? current.filter(id => id !== materialId)
            : [...current, materialId];
        updateState({ selectedMaterials: updated });
    };

    const selectAll = (category: string) => {
        const categoryMaterials = getMaterialsByCategory(category as any).map(m => m.id);
        const current = state.selectedMaterials;
        const allSelected = categoryMaterials.every(id => current.includes(id));

        if (allSelected) {
            // Deselect all from this category
            updateState({ selectedMaterials: current.filter(id => !categoryMaterials.includes(id)) });
        } else {
            // Select all from this category
            updateState({ selectedMaterials: [...new Set([...current, ...categoryMaterials])] });
        }
    };

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
                    selectedMaterials: state.selectedMaterials, // NEW: Pass selected materials
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
                            selectedMaterials: state.selectedMaterials,
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
                        selectedMaterials: state.selectedMaterials,
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
                <p className="text-sm text-accent mt-2">مع {state.selectedMaterials.length} مادة مختارة</p>
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
            </Card>

            {/* MATERIALS SELECTOR - NEW */}
            {!state.workshopPlan && (
                <Card variant="bordered" padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                            <span>🧰</span>
                            اختر المواد المتاحة
                            <span className="text-foreground-secondary font-normal text-sm">Select Materials</span>
                        </h3>
                        <span className="text-sm text-accent bg-accent/10 px-3 py-1 rounded-full">
                            {state.selectedMaterials.length} مادة مختارة
                        </span>
                    </div>

                    <p className="text-sm text-foreground-secondary mb-4">
                        اختر المواد المتاحة لديك وسيقوم الذكاء الاصطناعي بتصميم أنشطة تناسب هذه المواد
                    </p>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {MATERIAL_CATEGORIES.map(cat => {
                            const categoryMaterials = getMaterialsByCategory(cat.id as any);
                            const selectedCount = categoryMaterials.filter(m =>
                                state.selectedMaterials.includes(m.id)
                            ).length;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${expandedCategory === cat.id
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border hover:border-accent/50 text-foreground-secondary"
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span className="text-sm">{cat.name}</span>
                                    {selectedCount > 0 && (
                                        <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">
                                            {selectedCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Materials Grid */}
                    {expandedCategory && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">
                                    {MATERIAL_CATEGORIES.find(c => c.id === expandedCategory)?.name}
                                </h4>
                                <button
                                    onClick={() => selectAll(expandedCategory)}
                                    className="text-xs text-accent hover:underline"
                                >
                                    تحديد/إلغاء الكل
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {getMaterialsByCategory(expandedCategory as any).map(material => (
                                    <button
                                        key={material.id}
                                        onClick={() => toggleMaterial(material.id)}
                                        className={`p-3 rounded-xl border text-start transition-all duration-200 ${state.selectedMaterials.includes(material.id)
                                                ? "border-accent bg-accent/10 text-foreground"
                                                : "border-border hover:border-accent/30 text-foreground-secondary hover:text-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{material.icon}</span>
                                            <div>
                                                <p className="text-sm font-medium">{material.name}</p>
                                                <p className="text-xs opacity-60">{material.nameEn}</p>
                                            </div>
                                            {state.selectedMaterials.includes(material.id) && (
                                                <span className="mr-auto text-accent">✓</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="mt-6 pt-4 border-t border-border">
                        <Button onClick={generatePlan} loading={isGenerating} fullWidth variant="gradient">
                            ✨ إنشاء خطة الورشة المفصّلة
                        </Button>
                    </div>
                </Card>
            )}

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
