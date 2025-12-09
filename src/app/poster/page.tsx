"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PosterCreator } from "@/components/PosterCreator";
import { PosterPreview } from "@/components/PosterPreview";

export interface PosterData {
    format: "facebook" | "instagram";
    title: string;
    date: string;
    time: string;
    place: string;
    audience: string;
    description: string;
    descriptionFr?: string;
}

export interface GeneratedPoster {
    imageUrl: string;
    suggestedText: {
        ar: string;
        fr?: string;
    };
}

export default function PosterPage() {
    const [step, setStep] = useState<"create" | "preview">("create");
    const [posterData, setPosterData] = useState<PosterData | null>(null);
    const [generatedPoster, setGeneratedPoster] = useState<GeneratedPoster | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (data: PosterData) => {
        setPosterData(data);
        setIsGenerating(true);

        try {
            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to generate poster");
            }

            const result = await response.json();
            setGeneratedPoster(result);
            setStep("preview");
        } catch (error) {
            console.error("Generation error:", error);
            // For demo, show a placeholder
            setGeneratedPoster({
                imageUrl: `/api/placeholder/${data.format === "facebook" ? "1200/675" : "675/1200"}`,
                suggestedText: {
                    ar: `${data.title}\n📅 ${data.date}\n⏰ ${data.time}\n📍 ${data.place}`,
                    fr: data.descriptionFr ? `${data.title} - ${data.place}` : undefined,
                },
            });
            setStep("preview");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        setStep("create");
        setGeneratedPoster(null);
    };

    const handleRegenerate = () => {
        if (posterData) {
            handleGenerate(posterData);
        }
    };

    return (
        <main className="min-h-screen p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <PageHeader
                    title="إنشاء ملصق"
                    subtitle="Create Poster"
                    backHref="/"
                />

                {step === "create" && (
                    <PosterCreator
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        initialData={posterData}
                    />
                )}

                {step === "preview" && generatedPoster && posterData && (
                    <PosterPreview
                        poster={generatedPoster}
                        posterData={posterData}
                        onBack={handleBack}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isGenerating}
                    />
                )}
            </div>
        </main>
    );
}
