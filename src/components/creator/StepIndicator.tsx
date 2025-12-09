"use client";

import type { Step } from "@/app/create/page";

interface StepIndicatorProps {
    currentStep: Step;
    onStepClick: (step: Step) => void;
    hasWorkshopPlan: boolean;
    hasPoster: boolean;
}

const STEPS: { id: Step; label: string; labelEn: string; icon: string }[] = [
    { id: "topic", label: "الفكرة", labelEn: "Topic", icon: "💡" },
    { id: "workshop", label: "الخطة", labelEn: "Plan", icon: "📋" },
    { id: "poster", label: "الملصق", labelEn: "Poster", icon: "🎨" },
];

export function StepIndicator({
    currentStep,
    onStepClick,
    hasWorkshopPlan,
    hasPoster,
}: StepIndicatorProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    const isStepAccessible = (step: Step): boolean => {
        if (step === "topic") return true;
        if (step === "workshop") return true; // Can always go to workshop
        if (step === "poster") return hasWorkshopPlan; // Need plan for poster
        return false;
    };

    const isStepComplete = (step: Step): boolean => {
        if (step === "topic") return !!hasWorkshopPlan || currentIndex > 0;
        if (step === "workshop") return hasWorkshopPlan;
        if (step === "poster") return hasPoster;
        return false;
    };

    return (
        <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
                const isCurrent = step.id === currentStep;
                const isComplete = isStepComplete(step.id);
                const isAccessible = isStepAccessible(step.id);
                const isLast = index === STEPS.length - 1;

                return (
                    <div key={step.id} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <button
                            onClick={() => isAccessible && onStepClick(step.id)}
                            disabled={!isAccessible}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isCurrent
                                        ? "bg-accent text-white shadow-lg shadow-accent/30 scale-110"
                                        : isComplete
                                            ? "bg-accent/20 text-accent"
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
    );
}
