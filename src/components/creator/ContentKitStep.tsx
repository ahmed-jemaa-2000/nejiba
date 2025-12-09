"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CreatorState } from "@/app/create/page";
import type { DailyTip } from "@/lib/ai/openai";

interface ContentKitStepProps {
    state: CreatorState;
    updateState: (updates: Partial<CreatorState>) => void;
    onBack: () => void;
    onReset: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export function ContentKitStep({
    state,
    updateState,
    onBack,
    onReset,
    isLoading,
    setIsLoading,
}: ContentKitStepProps) {
    const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
    const [imageErrors, setImageErrors] = useState<Record<number, string>>({});
    const [enhancingPrompts, setEnhancingPrompts] = useState<Record<number, boolean>>({});

    const handlePromptChange = (index: number, newPrompt: string) => {
        if (!state.dailyTips) return;
        const newTips = [...state.dailyTips];
        newTips[index] = { ...newTips[index], imagePrompt: newPrompt };
        updateState({ dailyTips: newTips });
    };

    const enhancePrompt = async (index: number, currentPrompt: string) => {
        setEnhancingPrompts(prev => ({ ...prev, [index]: true }));
        try {
            const response = await fetch("/api/ai/enhance-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: currentPrompt }),
            });
            const data = await response.json();
            if (data.enhanced) {
                handlePromptChange(index, data.enhanced);
            }
        } catch (error) {
            console.error("Failed to enhance prompt", error);
        } finally {
            setEnhancingPrompts(prev => ({ ...prev, [index]: false }));
        }
    };

    const generateContent = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/generate-tips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: state.topic,
                    workshopTitle: state.workshopPlan?.title.ar || state.topic
                }),
            });

            const data = await response.json();
            if (data.tips) {
                updateState({ dailyTips: data.tips });
            }
        } catch (error) {
            console.error("Failed to generate tips:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateTipImage = async (dayIndex: number, tip: DailyTip) => {
        setGeneratingImages(prev => ({ ...prev, [dayIndex]: true }));
        setImageErrors(prev => ({ ...prev, [dayIndex]: "" }));

        try {
            // Use the raw prompt feature we added to geminigen
            // We prepend "Visual Description:" to be safe if user didn't write it exactly, 
            // but generateDailyTips returns "Detailed visual description..." so we can use it.
            // We'll use the "Structured Prompt" trick if we want pass-through, but here we want 
            // the AI to do its best with the description.

            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    format: state.posterFormat, // Use same format as poster for consistency
                    title: tip.title,
                    date: `اليوم ${dayIndex + 1}`,
                    time: "نصيحة يومية",
                    place: state.posterPlace || "Nejiba Studio",
                    audience: "general",
                    description: `Design style: Daily Advice Card.\n\nVisual: ${tip.imagePrompt}`, // Force structured prompt trigger?
                }),
            });

            const data = await response.json();
            if (data.imageUrl) {
                const newTips = [...(state.dailyTips || [])];
                newTips[dayIndex] = { ...tip, imageUrl: data.imageUrl };
                updateState({ dailyTips: newTips });
            } else {
                throw new Error("No image returned");
            }

        } catch (error) {
            console.error(`Failed to generate image for day ${dayIndex}:`, error);
            setImageErrors(prev => ({ ...prev, [dayIndex]: "فشل توليد الصورة" }));
        } finally {
            setGeneratingImages(prev => ({ ...prev, [dayIndex]: false }));
        }
    };

    const handleDownload = (url: string, day: number) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `content-day-${day}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!state.dailyTips) {
        return (
            <div className="text-center py-12 animate-in fade-in space-y-6">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-3xl font-bold text-foreground">حقيبة المحتوى الأسبوعي</h2>
                <p className="text-foreground-secondary max-w-lg mx-auto">
                    سنقوم بتوليد 6 نصائح ومحتوى قيّم لنشره على مدار الأسبوع بعد الورشة، للحفاظ على تفاعل الجمهور.
                </p>
                <Button
                    size="lg"
                    onClick={generateContent}
                    loading={isLoading}
                    icon={<span>✨</span>}
                >
                    توليد المحتوى (6 أيام)
                </Button>
                <div className="mt-4">
                    <Button variant="ghost" onClick={onBack}>رجوع</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">جدول المحتوى الأسبوعي</h2>
                    <p className="text-foreground-secondary">6 منشورات جاهزة للنشر - يمكنك تعديل وصف الصورة قبل التوليد</p>
                </div>
                <Button variant="secondary" onClick={onReset}>بدء جديد</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {state.dailyTips.map((tip, index) => (
                    <Card key={index} variant="bordered" className="overflow-hidden">
                        {/* Header */}
                        <div className="bg-accent/5 p-4 border-b border-border flex justify-between items-center">
                            <span className="font-bold text-accent">اليوم {index + 1}</span>
                            <span className="text-xs text-foreground-secondary px-2 py-1 bg-background rounded-full border border-border">
                                نصيحة
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className="font-bold text-foreground mb-2">{tip.title}</h3>
                                <p className="text-sm text-foreground-secondary leading-relaxed">
                                    {tip.content}
                                </p>
                            </div>

                            {/* Image Section */}
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                                {!tip.imageUrl && (
                                    <div className="relative">
                                        <label className="text-xs text-foreground-secondary mb-1 block">وصف الصورة (Prompt):</label>
                                        <textarea
                                            value={tip.imagePrompt}
                                            onChange={(e) => handlePromptChange(index, e.target.value)}
                                            className="w-full text-xs p-2 rounded border border-border bg-background h-20 resize-none focus:ring-1 focus:ring-accent font-sans"
                                            placeholder="صف الصورة التي تريد..."
                                        />
                                        <button
                                            onClick={() => enhancePrompt(index, tip.imagePrompt)}
                                            disabled={enhancingPrompts[index]}
                                            className="absolute bottom-2 right-2 text-[10px] bg-accent/10 hover:bg-accent/20 text-accent px-2 py-1 rounded transition-colors flex items-center gap-1"
                                        >
                                            {enhancingPrompts[index] ? "..." : "✨ تحسين الوصف"}
                                        </button>
                                    </div>
                                )}

                                {tip.imageUrl ? (
                                    <div className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-background-tertiary">
                                        <img
                                            src={tip.imageUrl}
                                            alt={tip.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="sm" onClick={() => handleDownload(tip.imageUrl!, index + 1)}>
                                                ⬇️ تحميل
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    // Let's clear URL to edit prompt.
                                                    const newTips = [...state.dailyTips!];
                                                    delete newTips[index].imageUrl;
                                                    updateState({ dailyTips: newTips });
                                                }}
                                            >
                                                ✏️ تعديل
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center hover:border-accent/50 transition-colors bg-background-tertiary/50 mt-2">
                                        {imageErrors[index] ? (
                                            <div className="text-error text-sm mb-2">{imageErrors[index]}</div>
                                        ) : null}

                                        {generatingImages[index] ? (
                                            <LoadingSpinner size="sm" message="جاري الرسم..." />
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => generateTipImage(index, tip)}
                                                icon={<span>🎨</span>}
                                            >
                                                توليد الصورة
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-start">
                <Button variant="secondary" onClick={onBack}>← السابق</Button>
            </div>
        </div>
    );
}
