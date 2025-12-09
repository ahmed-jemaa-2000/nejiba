"use client";

import { Button, Card } from "@/components/ui";
import type { GeneratedPoster, PosterData } from "@/app/poster/page";

interface PosterPreviewProps {
    poster: GeneratedPoster;
    posterData: PosterData;
    onBack: () => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}

export function PosterPreview({
    poster,
    posterData,
    onBack,
    onRegenerate,
    isRegenerating,
}: PosterPreviewProps) {
    const handleDownload = async () => {
        try {
            const response = await fetch(poster.imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `poster-${posterData.format}-${posterData.date}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            window.open(poster.imageUrl, "_blank");
        }
    };

    const aspectRatio = posterData.format === "facebook" ? "aspect-video" : "aspect-[9/16]";

    return (
        <div className="space-y-6">
            {/* Preview Card */}
            <Card variant="bordered" padding="none" className="overflow-hidden">
                <div className={`relative ${aspectRatio} bg-background-tertiary`}>
                    {/* Placeholder with event info overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-accent/20 to-background-tertiary">
                        <div className="space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/30 mb-4">
                                <span className="text-3xl">🎨</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                {posterData.title}
                            </h2>
                            <div className="space-y-2 text-foreground-secondary">
                                <p className="text-lg">📅 {posterData.date}</p>
                                <p className="text-lg">⏰ {posterData.time}</p>
                                <p className="text-lg">📍 {posterData.place}</p>
                            </div>
                            {posterData.description && (
                                <p className="max-w-md text-foreground-secondary/80">
                                    {posterData.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Format badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-sm">
                        {posterData.format === "facebook" ? "📘 Facebook 16:9" : "📸 Instagram 9:16"}
                    </div>
                </div>
            </Card>

            {/* Suggested Text */}
            {poster.suggestedText && (
                <Card variant="bordered" padding="md">
                    <h3 className="font-bold text-lg text-foreground mb-3">
                        النص المقترح
                        <span className="text-foreground-secondary font-normal text-sm ms-2">Suggested Text</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-background-tertiary rounded-lg">
                            <p className="text-foreground whitespace-pre-line">{poster.suggestedText?.ar || "لا يوجد نص مقترح"}</p>
                        </div>
                        {poster.suggestedText?.fr && (
                            <div className="p-3 bg-background-tertiary rounded-lg" dir="ltr">
                                <p className="text-foreground-secondary text-start">{poster.suggestedText.fr}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                            if (poster.suggestedText?.ar) {
                                navigator.clipboard.writeText(poster.suggestedText.ar);
                            }
                        }}
                    >
                        📋 نسخ النص
                    </Button>
                </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={onBack}
                >
                    ← تعديل البيانات
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={onRegenerate}
                    loading={isRegenerating}
                >
                    🔄 إنشاء جديد
                </Button>
                <Button
                    size="lg"
                    fullWidth
                    onClick={handleDownload}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                    }
                >
                    تحميل الملصق
                </Button>
            </div>
        </div>
    );
}
