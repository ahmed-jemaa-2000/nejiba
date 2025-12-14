"use client";

import { useState } from "react";
import type { Step } from "@/app/create/page";

interface StepIndicatorProps {
    currentStep: Step;
    onStepClick: (step: Step) => void;
    hasWorkshopPlan: boolean;
    hasPoster: boolean;
    hasContentKit: boolean;
}

interface StepData {
    id: Step;
    label: string;
    labelEn: string;
    icon: string;
    tooltipAr: string;
    expectedOutput: string;
}

const STEPS: StepData[] = [
    {
        id: "topic",
        label: "الفكرة",
        labelEn: "Topic",
        icon: "💡",
        tooltipAr: "اختر موضوع الورشة",
        expectedOutput: "موضوع الورشة"
    },
    {
        id: "workshop",
        label: "الخطة",
        labelEn: "Plan",
        icon: "📋",
        tooltipAr: "إنشاء خطة تفصيلية + PDF",
        expectedOutput: "خطة كاملة"
    },
    {
        id: "poster",
        label: "الملصق",
        labelEn: "Poster",
        icon: "🎨",
        tooltipAr: "تصميم ملصق احترافي",
        expectedOutput: "ملصق إعلاني"
    },
    {
        id: "content-kit",
        label: "المحتوى",
        labelEn: "Content",
        icon: "📦",
        tooltipAr: "نصائح يومية + صور",
        expectedOutput: "5 نصائح"
    },
];

export function StepIndicator({
    currentStep,
    onStepClick,
    hasWorkshopPlan,
    hasPoster,
    hasContentKit,
}: StepIndicatorProps) {
    const [hoveredStep, setHoveredStep] = useState<Step | null>(null);
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    const isStepAccessible = (step: Step): boolean => {
        if (step === "topic") return true;
        if (step === "workshop") return true;
        if (step === "poster") return hasWorkshopPlan;
        if (step === "content-kit") return hasPoster;
        return false;
    };

    const isStepComplete = (step: Step): boolean => {
        if (step === "topic") return !!hasWorkshopPlan || currentIndex > 0;
        if (step === "workshop") return hasWorkshopPlan;
        if (step === "poster") return hasPoster;
        if (step === "content-kit") return hasContentKit;
        return false;
    };

    // Determine next recommended step
    const getNextRecommendedStep = (): Step | null => {
        if (!hasWorkshopPlan && currentStep !== "workshop") return "workshop";
        if (hasWorkshopPlan && !hasPoster && currentStep !== "poster") return "poster";
        if (hasPoster && !hasContentKit && currentStep !== "content-kit") return "content-kit";
        return null;
    };

    const nextRecommended = getNextRecommendedStep();
    const completedCount = [hasWorkshopPlan, hasPoster, hasContentKit].filter(Boolean).length + (currentIndex > 0 ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Progress Summary */}
            <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span>{completedCount} من 4 خطوات مكتملة</span>
                <span className="text-accent">⏱️ ~5 دقائق إجمالي</span>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const isCurrent = step.id === currentStep;
                    const isComplete = isStepComplete(step.id);
                    const isAccessible = isStepAccessible(step.id);
                    const isLast = index === STEPS.length - 1;
                    const isNextRecommended = step.id === nextRecommended;
                    const isHovered = hoveredStep === step.id;

                    return (
                        <div key={step.id} className="flex items-center flex-1 relative">
                            {/* Step Button with Tooltip */}
                            <div className="relative">
                                <button
                                    onClick={() => isAccessible && onStepClick(step.id)}
                                    onMouseEnter={() => setHoveredStep(step.id)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                    disabled={!isAccessible}
                                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isCurrent
                                                ? "bg-accent text-white shadow-lg shadow-accent/30 scale-110"
                                                : isComplete
                                                    ? "bg-accent/20 text-accent"
                                                    : isNextRecommended
                                                        ? "bg-background-tertiary text-foreground-secondary animate-pulse-border"
                                                        : "bg-background-tertiary text-foreground-secondary"
                                            }`}
                                    >
                                        {isComplete && !isCurrent ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`text-xs font-medium transition-colors ${isCurrent ? "text-accent" : "text-foreground-secondary"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </button>

                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                                        <div className="bg-background-secondary border border-border rounded-lg px-3 py-2 shadow-xl min-w-max">
                                            <p className="text-sm font-medium text-foreground mb-1">{step.tooltipAr}</p>
                                            <p className="text-xs text-accent">→ {step.expectedOutput}</p>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                            <div className="w-2 h-2 bg-background-secondary border-r border-b border-border rotate-45" />
                                        </div>
                                    </div>
                                )}

                                {/* Next recommended indicator */}
                                {isNextRecommended && !isCurrent && (
                                    <span className="absolute -top-1 -right-1 text-xs">
                                        👆
                                    </span>
                                )}
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 mx-2">
                                    <div
                                        className={`h-1 rounded-full transition-all duration-500 ${index < currentIndex ? "bg-accent" : "bg-border"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

