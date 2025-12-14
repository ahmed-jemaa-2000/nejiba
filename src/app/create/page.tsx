"use client";

import { useState, useCallback, useEffect } from "react";
import { StepIndicator } from "@/components/creator/StepIndicator";
import { TopicStep } from "@/components/creator/TopicStep";
import { WorkshopStep } from "@/components/creator/WorkshopStep";
import { PosterStep } from "@/components/creator/PosterStep";
import { ContentKitStep } from "@/components/creator/ContentKitStep";
import { StepGuide } from "@/components/creator/StepGuide";
import { PipelineOverview } from "@/components/creator/PipelineOverview";
import { StepNotification } from "@/components/ui/StepNotification";
import type { WorkshopPlanData, WorkshopActivity } from "@/app/workshop/page";

import type { DailyTip } from "@/lib/ai/openai";

export type Step = "topic" | "workshop" | "poster" | "content-kit";

export interface CreatorState {
    // Step 1: Topic
    topic: string;

    // Step 2: Workshop
    duration: "45" | "60" | "90";
    ageRange: "6-8" | "8-10" | "10-12" | "8-14" | "mixed";
    selectedMaterials: string[];
    workshopPlan: WorkshopPlanData | null;

    // Step 3: Poster
    posterFormat: "facebook" | "instagram";
    posterStyleId: string;
    posterColorMood: string;
    posterVisualElement: string;
    posterTitle: string;
    posterDescription: string;
    posterDate: string;
    posterTime: string;
    posterPlace: string;
    generatedPosterUrl: string | null;

    // Step 4: Content Kit (Daily Tips)
    dailyTips: Array<DailyTip & { imageUrl?: string }> | null;
}

const INITIAL_STATE: CreatorState = {
    topic: "",
    duration: "90",
    ageRange: "8-14",
    selectedMaterials: [],
    workshopPlan: null,
    posterFormat: "facebook",
    posterStyleId: "bright-playful",
    posterColorMood: "auto",
    posterVisualElement: "auto",
    posterTitle: "",
    posterDescription: "",
    posterDate: "",
    posterTime: "",
    posterPlace: "دار الثقافة بن عروس",
    generatedPosterUrl: null,
    dailyTips: null,
};

export default function CreatePage() {
    const [currentStep, setCurrentStep] = useState<Step>("topic");
    const [state, setState] = useState<CreatorState>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);

    // Guidance system state
    const [showPipelineOverview, setShowPipelineOverview] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationStep, setNotificationStep] = useState<Step>("topic");
    const [isFirstVisit, setIsFirstVisit] = useState(true);

    // Show pipeline overview on first visit
    useEffect(() => {
        if (isFirstVisit) {
            const hasVisited = localStorage.getItem("nejiba-pipeline-intro-seen");
            if (!hasVisited) {
                // Small delay for smooth entrance
                const timer = setTimeout(() => {
                    setShowPipelineOverview(true);
                }, 500);
                return () => clearTimeout(timer);
            }
            setIsFirstVisit(false);
        }
    }, [isFirstVisit]);

    const handleOverviewClose = () => {
        setShowPipelineOverview(false);
        localStorage.setItem("nejiba-pipeline-intro-seen", "true");
        setIsFirstVisit(false);
    };

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
            posterDescription: plan.title.ar
        });
        // Show "What's Next" notification
        setNotificationStep("workshop");
        setShowNotification(true);
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
        // Show "What's Next" notification
        setNotificationStep("poster");
        setShowNotification(true);
    }, [updateState]);

    const handleContentKitGenerated = useCallback(() => {
        // Show completion notification
        setNotificationStep("content-kit");
        setShowNotification(true);
    }, []);

    const handleReset = useCallback(() => {
        setState(INITIAL_STATE);
        setCurrentStep("topic");
    }, []);

    const handleNotificationAction = useCallback(() => {
        // Navigate to next step based on current notification
        if (notificationStep === "workshop") {
            goToStep("poster");
        } else if (notificationStep === "poster") {
            goToStep("content-kit");
        }
    }, [notificationStep, goToStep]);

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
                        <div className="flex items-center gap-2">
                            {/* Help button */}
                            <button
                                onClick={() => setShowPipelineOverview(true)}
                                className="w-8 h-8 rounded-full bg-background-tertiary hover:bg-border flex items-center justify-center text-foreground-secondary hover:text-accent transition-colors"
                                title="عرض دليل الخطوات"
                            >
                                ؟
                            </button>
                            {state.topic && (
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                                >
                                    إنشاء جديد
                                </button>
                            )}
                        </div>
                    </div>

                    <StepIndicator
                        currentStep={currentStep}
                        onStepClick={goToStep}
                        hasWorkshopPlan={!!state.workshopPlan}
                        hasPoster={!!state.generatedPosterUrl}
                        hasContentKit={!!state.dailyTips}
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Step Guide - Contextual help */}
                <StepGuide currentStep={currentStep} />

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
                        onNext={() => goToStep("content-kit")}
                        onReset={handleReset}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}

                {currentStep === "content-kit" && (
                    <ContentKitStep
                        state={state}
                        updateState={(updates) => {
                            updateState(updates);
                            if (updates.dailyTips) {
                                handleContentKitGenerated();
                            }
                        }}
                        onBack={() => goToStep("poster")}
                        onReset={handleReset}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                )}
            </div>

            {/* Pipeline Overview Modal */}
            <PipelineOverview
                isOpen={showPipelineOverview}
                onClose={handleOverviewClose}
                onStart={handleOverviewClose}
            />

            {/* Step Notification */}
            <StepNotification
                show={showNotification}
                currentStep={notificationStep}
                onDismiss={() => setShowNotification(false)}
                onAction={handleNotificationAction}
            />
        </main>
    );
}

