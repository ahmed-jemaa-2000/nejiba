"use client";

import { useState } from "react";
import { Button, Card, Select, useToast } from "@/components/ui";
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
    { value: "45", label: "45 دقيقة", sublabel: "ورشة متوسطة" },
    { value: "60", label: "60 دقيقة", sublabel: "ورشة كاملة" },
    { value: "90", label: "90 دقيقة", sublabel: "ورشة مطولة" },
];

const AGE_OPTIONS = [
    { value: "6-8", label: "6-8 سنة", sublabel: "أطفال صغار" },
    { value: "8-10", label: "8-10 سنة", sublabel: "أطفال" },
    { value: "10-12", label: "10-12 سنة", sublabel: "ما قبل المراهقة" },
    { value: "8-14", label: "8-14 سنة", sublabel: "ناشئة" },
    { value: "mixed", label: "أعمار مختلطة", sublabel: "6-14 سنة" },
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
    const [promptPreview, setPromptPreview] = useState<{ systemPrompt: string; userPrompt: string } | null>(null);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isPromptLoading, setIsPromptLoading] = useState(false);
    const [jsonPromptPreview, setJsonPromptPreview] = useState<{ systemPrompt: string; userPrompt: string } | null>(null);
    const [isJsonPromptOpen, setIsJsonPromptOpen] = useState(false);
    const [isJsonPromptLoading, setIsJsonPromptLoading] = useState(false);
    const { showToast } = useToast();

    const previewPrompts = async () => {
        if (!state.topic) return;

        setIsPromptLoading(true);
        try {
            const response = await fetch("/api/ai/workshop-prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: state.topic,
                    duration: state.duration,
                    ageRange: state.ageRange,
                    selectedMaterials: state.selectedMaterials,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to build prompts");
            }

            setPromptPreview(data);
            setIsPromptOpen(true);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to build prompts";
            showToast(message, "error");
        } finally {
            setIsPromptLoading(false);
        }
    };

    const previewJsonPrompts = async () => {
        if (!state.topic) return;

        setIsJsonPromptLoading(true);
        try {
            const response = await fetch("/api/ai/workshop-prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: state.topic,
                    duration: state.duration,
                    ageRange: state.ageRange,
                    selectedMaterials: state.selectedMaterials,
                    format: "json", // Request JSON format
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to build JSON prompts");
            }

            setJsonPromptPreview(data);
            setIsJsonPromptOpen(true);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to build JSON prompts";
            showToast(message, "error");
        } finally {
            setIsJsonPromptLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast("تم نسخ البرومبت", "success");
        } catch {
            showToast("فشل نسخ البرومبت", "error");
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

            {/* Generate Button Section - Simplified for non-technical users */}
            {!state.workshopPlan && (
                <Card variant="bordered" padding="md">
                    {/* MAIN ACTION: JSON Prompts for ChatGPT - BIG and prominent */}
                    <div className="mb-6">
                        <div className="text-center mb-3">
                            <h4 className="text-lg font-bold text-foreground">الخطوة التالية: انسخ واستخدم في ChatGPT</h4>
                            <p className="text-sm text-foreground-secondary">اضغط هنا للحصول على النص الجاهز للنسخ</p>
                        </div>
                        <Button
                            onClick={previewJsonPrompts}
                            loading={isJsonPromptLoading}
                            fullWidth
                            variant="gradient"
                            size="lg"
                        >
                            <span className="text-xl ml-2">📋</span>
                            معاينة JSON Prompts للاستخدام في ChatGPT
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-foreground-secondary">أو</span>
                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    {/* Secondary options - smaller, grouped */}
                    <div className="flex gap-2">
                        <Button
                            onClick={previewPrompts}
                            loading={isPromptLoading}
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                        >
                            معاينة Prompt فقط
                        </Button>
                        <Button
                            onClick={generatePlan}
                            loading={isGenerating}
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs"
                        >
                            ✨ إنشاء تلقائي (AI)
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

            {isPromptOpen && promptPreview && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card variant="glass" padding="lg" className="w-full max-w-3xl max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground">Prompt Preview</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsPromptOpen(false)}>
                                إغلاق
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-foreground">System Prompt</h4>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => copyToClipboard(promptPreview.systemPrompt)}
                                    >
                                        نسخ
                                    </Button>
                                </div>
                                <pre
                                    dir="ltr"
                                    className="whitespace-pre-wrap text-sm bg-background-tertiary/60 p-3 rounded-lg border border-border max-h-60 overflow-auto text-left"
                                >
                                    {promptPreview.systemPrompt}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-foreground">User Prompt</h4>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => copyToClipboard(promptPreview.userPrompt)}
                                    >
                                        نسخ
                                    </Button>
                                </div>
                                <pre
                                    dir="ltr"
                                    className="whitespace-pre-wrap text-sm bg-background-tertiary/60 p-3 rounded-lg border border-border max-h-60 overflow-auto text-left"
                                >
                                    {promptPreview.userPrompt}
                                </pre>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* JSON Prompt Modal */}
            {isJsonPromptOpen && jsonPromptPreview && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card variant="glass" padding="lg" className="w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground">📋 JSON Prompts for ChatGPT</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsJsonPromptOpen(false)}>
                                إغلاق
                            </Button>
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">كيفية الاستخدام:</h4>
                            <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                                <li>انسخ البرومبت الكامل أدناه (مدمج - بنقرة واحدة)</li>
                                <li>افتح ChatGPT (GPT-4 أو أحدث للحصول على أفضل النتائج)</li>
                                <li>الصق البرومبت كاملاً في ChatGPT</li>
                                <li>انتظر حتى يعطيك ChatGPT نتيجة JSON كاملة</li>
                                <li>انسخ نتيجة JSON واذهب إلى <a href="/import" className="underline font-bold">صفحة الاستيراد</a></li>
                            </ol>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                ⚠️ <strong>مهم:</strong> تأكد أن ChatGPT يعطيك JSON فقط (يبدأ بـ {"{"} وينتهي بـ {"}"}) بدون أي نص إضافي
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Combined Prompt */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-foreground">📋 Complete Prompt (Copy All)</h4>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => {
                                            const combined = `${jsonPromptPreview.systemPrompt}\n\n---\n\n${jsonPromptPreview.userPrompt}`;
                                            copyToClipboard(combined);
                                        }}
                                    >
                                        📋 نسخ الكل
                                    </Button>
                                </div>
                                <pre
                                    dir="ltr"
                                    className="whitespace-pre-wrap text-sm bg-gray-900 text-green-400 p-4 rounded-lg border border-green-700 max-h-[500px] overflow-auto text-left font-mono"
                                >
                                    {jsonPromptPreview.systemPrompt}
                                    {"\n\n---\n\n"}
                                    {jsonPromptPreview.userPrompt}
                                </pre>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button variant="secondary" onClick={() => setIsJsonPromptOpen(false)}>
                                    إغلاق
                                </Button>
                                <Button variant="gradient" onClick={() => window.location.href = '/import'}>
                                    اذهب إلى صفحة الاستيراد →
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
