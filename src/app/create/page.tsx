"use client";

import { useState, useCallback } from "react";
import { StepIndicator } from "@/components/creator/StepIndicator";
import { TopicStep } from "@/components/creator/TopicStep";
import { WorkshopStep } from "@/components/creator/WorkshopStep";
import { PosterStep } from "@/components/creator/PosterStep";
import type { WorkshopPlanData, WorkshopActivity } from "@/app/workshop/page";

export type Step = "topic" | "workshop" | "poster";

export interface CreatorState {
    // Step 1: Topic
    topic: string;

    // Step 2: Workshop
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
    workshopPlan: WorkshopPlanData | null;

    // Step 3: Poster
    posterFormat: "facebook" | "instagram";
    posterTitle: string;
    posterDescription: string;
    posterDate: string;
    posterTime: string;
    posterPlace: string;
    generatedPosterUrl: string | null;
}

const INITIAL_STATE: CreatorState = {
    topic: "",
    duration: "60",
    ageRange: "8-10",
    workshopPlan: null,
    posterFormat: "facebook",
    posterTitle: "",
    posterDescription: "",
    posterDate: "",
    posterTime: "",
    posterPlace: "دار الثقافة بن عروس",
    generatedPosterUrl: null,
};

export default function CreatePage() {
    const [currentStep, setCurrentStep] = useState<Step>("topic");
    const [state, setState] = useState<CreatorState>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);

    const updateState = useCallback((updates: Partial<CreatorState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const goToStep = useCallback((step: Step) => {
        if (step === "poster" && state.workshopPlan) {
            // Auto-fill poster details if empty
            setState((prev) => ({
                ...prev,
                posterTitle: prev.posterTitle || prev.workshopPlan?.title.ar || `ورشة: ${prev.topic}`,
                posterDescription: prev.posterDescription || prev.topic,
            }));
        }
        setCurrentStep(step);
    }, [state.workshopPlan]);

    const handleTopicSelected = useCallback((topic: string) => {
        updateState({ topic });
        goToStep("workshop");
    }, [updateState, goToStep]);

    const handleWorkshopGenerated = useCallback((plan: WorkshopPlanData) => {
        updateState({
            workshopPlan: plan,
            // Pre-fill poster details immediately
            posterTitle: plan.title.ar,
            posterDescription: plan.title.ar // Use title as base description for simplicity
        });
    }, [updateState]);

    const handleActivityUpdated = useCallback((index: number, activity: WorkshopActivity) => {
        if (!state.workshopPlan) return;
        const newTimeline = [...state.workshopPlan.timeline];
        newTimeline[index] = activity;
        updateState({
            workshopPlan: { ...state.workshopPlan, timeline: newTimeline },
        });
    }, [state.workshopPlan, updateState]);

    const handlePosterGenerated = useCallback((url: string) => {
        updateState({ generatedPosterUrl: url });
    }, [updateState]);

    const handleReset = useCallback(() => {
        setState(INITIAL_STATE);
        setCurrentStep("topic");
    }, []);

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                                <span className="text-xl">✨</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">نيجيبة ستوديو</h1>
                                <p className="text-xs text-foreground-secondary">إنشاء محتوى الورشة</p>
                            </div>
                        </div>
                        {state.topic && (
                            <button
                                onClick={handleReset}
                                className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                            >
                                إنشاء جديد
                            </button>
                        )}
                    </div>

                    <StepIndicator
                        currentStep={currentStep}
                        onStepClick={goToStep}
                        hasWorkshopPlan={!!state.workshopPlan}
                        hasPoster={!!state.generatedPosterUrl}
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {currentStep === "topic" && (
                    <TopicStep
                        currentTopic={state.topic}
                        onTopicSelected={handleTopicSelected}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}

                {currentStep === "workshop" && (
                    <WorkshopStep
                        state={state}
                        updateState={updateState}
                        onPlanGenerated={handleWorkshopGenerated}
                        onActivityUpdated={handleActivityUpdated}
                        onBack={() => goToStep("topic")}
                        onNext={() => goToStep("poster")}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}

                {currentStep === "poster" && (
                    <PosterStep
                        state={state}
                        updateState={updateState}
                        onPosterGenerated={handlePosterGenerated}
                        onBack={() => goToStep("workshop")}
                        onReset={handleReset}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}
            </div>
        </main>
    );
}
