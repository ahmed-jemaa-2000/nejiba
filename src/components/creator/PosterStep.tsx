"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, Input, FieldGroup } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CreatorState } from "@/app/create/page";

interface PosterStepProps {
    state: CreatorState;
    updateState: (updates: Partial<CreatorState>) => void;
    onPosterGenerated: (url: string) => void;
    onBack: () => void;
    onNext: () => void;
    onReset: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export function PosterStep({
    state,
    updateState,
    onPosterGenerated,
    onBack,
    onNext,
    onReset,
    isLoading,
    setIsLoading,
}: PosterStepProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedText, setSuggestedText] = useState<{ ar?: string; fr?: string } | null>(null);
    const [showOverlay, setShowOverlay] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [finalPosterUrl, setFinalPosterUrl] = useState<string | null>(null);

    // Smart Context: Auto-enhance description
    useEffect(() => {
        const shouldEnhance = !state.posterDescription || state.posterDescription === state.topic;

        if (shouldEnhance && state.workshopPlan && !isEnhancing && !state.generatedPosterUrl) {
            enhanceDescription();
        }
    }, []);

    const enhanceDescription = async () => {
        setIsEnhancing(true);
        try {
            const response = await fetch("/api/ai/enhance-poster-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: state.topic,
                    workshopPlan: state.workshopPlan,
                    date: state.posterDate,
                    time: state.posterTime,
                    place: state.posterPlace
                }),
            });

            const data = await response.json();
            if (data.visualPrompt) {
                updateState({
                    posterDescription: data.visualPrompt
                });
            }
        } catch (err) {
            console.error("Smart enhancement failed:", err);
            setError("تعذر تحليل الخطة توليد الوصف. يرجى المحاولة مجدداً.");
        } finally {
            setIsEnhancing(false);
        }
    };

    // Auto-compose formatting when image changes
    useEffect(() => {
        if (state.generatedPosterUrl && showOverlay) {
            composePoster();
        } else if (state.generatedPosterUrl && !showOverlay) {
            setFinalPosterUrl(state.generatedPosterUrl);
        }
    }, [state.generatedPosterUrl, showOverlay, state.posterDate, state.posterTime, state.posterPlace, state.posterTitle]);

    const composePoster = async () => {
        if (!state.generatedPosterUrl || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        // Use proxy to avoid CORS issues with Cloudflare R2
        img.src = `/api/proxy-image?url=${encodeURIComponent(state.generatedPosterUrl)}`;

        img.onload = () => {
            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw base image
            ctx.drawImage(img, 0, 0);

            // Add Gradient Overlay at bottom for text readability
            const gradientHeight = canvas.height * 0.5;
            const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(0.8, "rgba(10, 10, 15, 0.95)");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);

            // Configuration
            const padding = canvas.width * 0.08;
            const bottomBase = canvas.height - padding;

            // Calculate responsive font sizes
            const titleSize = canvas.width * 0.08;
            const infoSize = canvas.width * 0.04;
            const brandSize = canvas.width * 0.03;

            // Draw Title
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";

            // Title
            ctx.font = `bold ${titleSize}px Tajawal, sans-serif`;
            const title = state.posterTitle || state.workshopPlan?.title.ar || `ورشة: ${state.topic}`;
            wrapText(ctx, title, canvas.width / 2, bottomBase - (infoSize * 5), canvas.width - (padding * 2), titleSize * 1.2);

            // Info Line (Date & Time)
            ctx.font = `${infoSize}px Tajawal, sans-serif`;
            ctx.fillStyle = "#e4e4e7"; // zinc-200
            const dateText = `📅 ${state.posterDate}   ⏰ ${state.posterTime}`;
            ctx.fillText(dateText, canvas.width / 2, bottomBase - (infoSize * 2.5));

            // Location
            ctx.font = `${infoSize * 0.9}px Tajawal, sans-serif`;
            ctx.fillStyle = "#a1a1aa"; // zinc-400
            const locText = `📍 ${state.posterPlace}`;
            ctx.fillText(locText, canvas.width / 2, bottomBase - (infoSize * 1.2));

            // Branding Badge
            const badgeW = canvas.width * 0.35;
            const badgeH = badgeW * 0.25;
            const badgeX = padding;
            const badgeY = padding;

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.fillStyle = "rgba(99, 102, 241, 0.9)"; // Accent color
            roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${brandSize}px Tajawal, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("نيجيبة ستوديو", badgeX + (badgeW / 2), badgeY + (badgeH / 2));
            ctx.restore();

            // Update final URL
            setFinalPosterUrl(canvas.toDataURL("image/png"));
        };
    };

    // Helper utility for text wrapping
    function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(" ");
        let line = "";
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw lines going UP from the bottom position (y)
        for (let i = lines.length - 1; i >= 0; i--) {
            ctx.fillText(lines[i], x, y - ((lines.length - 1 - i) * lineHeight));
        }
    }

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    const generatePoster = async () => {
        setIsGenerating(true);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    format: state.posterFormat,
                    title: state.posterTitle || state.workshopPlan?.title.ar || `ورشة: ${state.topic}`,
                    date: state.posterDate,
                    time: state.posterTime,
                    place: state.posterPlace,
                    audience: "children",
                    description: state.posterDescription || state.topic,
                    posterDate: state.posterDate,
                    posterTime: state.posterTime
                }),
            });

            const data = await response.json();

            if (data.imageUrl) {
                onPosterGenerated(data.imageUrl);
                setSuggestedText(data.suggestedText);
            } else {
                throw new Error("No image URL returned");
            }
        } catch (err) {
            console.error("Poster generation error:", err);
            setError("حدث خطأ أثناء إنشاء الملصق. يرجى المحاولة مجدداً.");
        } finally {
            setIsGenerating(false);
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!finalPosterUrl) return;

        const a = document.createElement("a");
        a.href = finalPosterUrl;
        a.download = `${state.topic.replace(/\s+/g, "-")}-poster.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Show generated poster
    if (state.generatedPosterUrl) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Hidden Canvas for Composition */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Success Header */}
                <div className="text-center space-y-2">
                    <span className="text-5xl">🎉</span>
                    <h2 className="text-2xl font-bold text-foreground">تم إنشاء المحتوى بنجاح!</h2>
                    <p className="text-foreground-secondary">
                        ورشة + ملصق جاهزين للاستخدام
                    </p>
                </div>

                {/* Poster Preview */}
                <Card variant="bordered" padding="md">
                    <div className="flex justify-end mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOverlay}
                                onChange={(e) => setShowOverlay(e.target.checked)}
                                className="w-4 h-4 rounded border-border bg-background-tertiary text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-foreground">عرض النصوص (تراكب ذكي)</span>
                        </label>
                    </div>

                    <div className={`relative rounded-xl overflow-hidden shadow-2xl mx-auto border border-border ${state.posterFormat === "facebook" ? "aspect-video w-full" : "aspect-[9/16] w-full max-w-sm"
                        }`}>
                        {finalPosterUrl ? (
                            <img
                                src={finalPosterUrl}
                                alt="Final Poster"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-background-tertiary">
                                <LoadingSpinner message="جاري دمج النصوص..." />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button onClick={handleDownload} fullWidth icon={<span>⬇️</span>}>
                            تحميل الملصق النهائي
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onNext}
                            fullWidth
                            className="bg-accent hover:bg-accent-hover text-white"
                            icon={<span>📦</span>}
                        >
                            إنشاء حقيبة المحتوى (6 أيام)
                        </Button>
                    </div>
                </Card>

                {/* Suggested Text */}
                {suggestedText?.ar && (
                    <Card variant="bordered" padding="md">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-foreground">📝 نص للنشر</h3>
                            <button
                                onClick={() => copyText(suggestedText.ar!)}
                                className="text-sm text-accent hover:text-accent-hover transition-colors"
                            >
                                📋 نسخ
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-foreground-secondary bg-background-tertiary p-4 rounded-lg font-sans">
                            {suggestedText?.ar || "لا يوجد نص مقترح"}
                        </pre>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-center mt-8">
                    <Button variant="secondary" onClick={onReset} icon={<span>✨</span>}>
                        بدء مشروع جديد
                    </Button>
                </div>
            </div>
        );
    }

    // Poster Settings Form
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">إنشاء ملصق الورشة</h2>
                <p className="text-foreground-secondary">
                    أضف تفاصيل الموعد وسننشئ ملصقاً احترافياً
                </p>
            </div>

            {/* Editable Title & Description */}
            <div className="grid gap-4">
                <FieldGroup label="عنوان الملصق" required>
                    <Input
                        value={state.posterTitle}
                        onChange={(e) => updateState({ posterTitle: e.target.value })}
                        placeholder="عنوان الورشة"
                    />
                </FieldGroup>

                <FieldGroup label="وصف الموضوع (للذكاء الاصطناعي)" required>
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                value={state.posterDescription}
                                onChange={(e) => updateState({ posterDescription: e.target.value })}
                                placeholder="وصف موضوع الورشة لتوليد الصورة..."
                                disabled={isEnhancing}
                                className={isEnhancing ? "pr-10" : ""}
                            />
                            {isEnhancing && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-background-secondary/80 px-2 py-1 rounded text-xs text-accent animate-pulse">
                                    <span>✨ جاري تحليل الخطة...</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={enhanceDescription}
                                disabled={isEnhancing}
                                className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                            >
                                <span>🔄</span>
                                إعادة توليد الوصف الذكي
                            </button>
                        </div>
                    </div>
                </FieldGroup>
            </div>

            {/* Format Selection */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => updateState({ posterFormat: "facebook" })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${state.posterFormat === "facebook"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                        }`}
                >
                    <span className="text-2xl block mb-2">📘</span>
                    <p className="font-medium text-foreground">فيسبوك</p>
                    <p className="text-xs text-foreground-secondary">16:9 أفقي</p>
                </button>
                <button
                    onClick={() => updateState({ posterFormat: "instagram" })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${state.posterFormat === "instagram"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                        }`}
                >
                    <span className="text-2xl block mb-2">📸</span>
                    <p className="font-medium text-foreground">إنستغرام</p>
                    <p className="text-xs text-foreground-secondary">9:16 عمودي</p>
                </button>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup label="التاريخ" required>
                    <Input
                        type="date"
                        value={state.posterDate}
                        onChange={(e) => updateState({ posterDate: e.target.value })}
                    />
                </FieldGroup>
                <FieldGroup label="الوقت" required>
                    <Input
                        type="time"
                        value={state.posterTime}
                        onChange={(e) => updateState({ posterTime: e.target.value })}
                    />
                </FieldGroup>
            </div>

            {/* Place */}
            <FieldGroup label="المكان">
                <Input
                    value={state.posterPlace}
                    onChange={(e) => updateState({ posterPlace: e.target.value })}
                    placeholder="دار الثقافة بن عروس"
                />
            </FieldGroup>

            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" onClick={onBack} fullWidth>
                    ← الخطوة السابقة
                </Button>
                <Button
                    onClick={generatePoster}
                    loading={isGenerating}
                    disabled={!state.posterDate || !state.posterTime || isEnhancing}
                    fullWidth
                    icon={<span>🎨</span>}
                >
                    إنشاء الملصق
                </Button>
            </div>
        </div>
    );
}
