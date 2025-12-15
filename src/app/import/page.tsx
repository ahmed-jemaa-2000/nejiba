"use client";

/**
 * Import Page
 *
 * Main page for importing workshop plans from ChatGPT JSON output
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, useToast } from "@/components/ui";
import { ImportInstructions } from "@/components/import/ImportInstructions";
import { JsonEditor } from "@/components/import/JsonEditor";
import { ValidationResults } from "@/components/import/ValidationResults";
import { WorkshopPreview } from "@/components/import/WorkshopPreview";
import { validateWorkshopPlan, validateJsonSyntax } from "@/lib/validation/workshopValidator";
import { workshopStorage } from "@/lib/storage/workshopStorage";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PremiumWorkshopPDF } from "@/components/pdf/PremiumWorkshopPDF";
import { ImageSelector } from "@/components/video/ImageSelector";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";
import type { ValidationResult } from "@/lib/validation/workshopValidator";

export default function ImportPage() {
    const router = useRouter();
    const [jsonInput, setJsonInput] = useState("");
    const [parsedWorkshop, setParsedWorkshop] = useState<WorkshopPlanData | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [importMode, setImportMode] = useState<"paste" | "upload">("paste");
    const [isValidating, setIsValidating] = useState(false);
    const { showToast } = useToast();

    // Navigate to video page with workshop data
    const goToVideo = useCallback(() => {
        if (!parsedWorkshop) return;

        // Save to localStorage for /video page to pick up
        localStorage.setItem('nejiba_current_workshop', JSON.stringify(parsedWorkshop));
        showToast("جاري الانتقال لصفحة الفيديو...", "success");
        router.push('/video');
    }, [parsedWorkshop, router, showToast]);

    // Poster prompt generator state
    const [posterFormat, setPosterFormat] = useState<"facebook" | "instagram">("facebook");
    const [posterDate, setPosterDate] = useState("");
    const [posterTime, setPosterTime] = useState("");
    const [posterPlace, setPosterPlace] = useState("دار الثقافة بن عروس");
    const [generatedPosterPrompt, setGeneratedPosterPrompt] = useState<string | null>(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

    // Poster image generation state (GeminiGen Imagen Pro)
    interface GeneratedPosterImage {
        url: string;
        uuid: string;
        thumbnailUrl?: string;
    }
    const [posterImages, setPosterImages] = useState<GeneratedPosterImage[]>([]);
    const [selectedPosterIndex, setSelectedPosterIndex] = useState<number>(-1);
    const [isGeneratingPosterImages, setIsGeneratingPosterImages] = useState(false);
    const [posterImageError, setPosterImageError] = useState<string | null>(null);

    // Generate Nanobanana poster prompt from workshop data
    const generatePosterPrompt = useCallback(() => {
        if (!parsedWorkshop) return;

        setIsGeneratingPrompt(true);

        // Extract workshop info
        const title = parsedWorkshop.title?.ar || "ورشة أطفال";
        const titleEn = parsedWorkshop.title?.en || "Kids Workshop";
        const ageGroup = parsedWorkshop.generalInfo?.ageGroup || "8-10 سنوات";
        const duration = parsedWorkshop.generalInfo?.duration || "90 دقيقة";

        // Get first 3 activities
        const activities = (parsedWorkshop.timeline || [])
            .slice(0, 3)
            .map(a => a.title)
            .join(" | ");

        // Get materials (first 6)
        const materials = (parsedWorkshop.materials || [])
            .slice(0, 6)
            .map(m => typeof m === 'string' ? m : m.item)
            .join(", ");

        // Format dimensions
        const aspectRatio = posterFormat === "facebook" ? "16:9 horizontal" : "9:16 vertical (portrait)";
        const resolution = posterFormat === "facebook" ? "1200x675" : "1080x1920";

        // Build the Nanobanana prompt
        const prompt = `Children's creative workshop promotional poster design.

WORKSHOP DETAILS:
- Title: "${title}" (${titleEn})
- Target: Children ${ageGroup}
- Duration: ${duration}
${posterDate ? `- Date: ${posterDate}` : ""}
${posterTime ? `- Time: ${posterTime}` : ""}
${posterPlace ? `- Location: ${posterPlace}` : ""}

ACTIVITIES & THEME:
${activities}

MATERIALS FEATURED:
${materials}

VISUAL STYLE:
- Modern, vibrant, child-friendly poster design
- Bright cheerful colors (purple, blue, orange, green)
- Playful 3D or illustrated style
- Clean readable Arabic typography
- Fun decorative elements (stars, shapes, confetti)
- Workshop activity illustrations or icons
- Welcoming and exciting atmosphere

TECHNICAL:
- Format: ${aspectRatio}
- Resolution: ${resolution}
- Professional quality, print-ready
- Bold title text, clear event information
- Leave space for date/time/location text overlay

DO NOT include: realistic photographs, scary elements, dark themes`;

        setTimeout(() => {
            setGeneratedPosterPrompt(prompt);
            setIsGeneratingPrompt(false);
            showToast("تم إنشاء البرومبت بنجاح!", "success");
        }, 500);
    }, [parsedWorkshop, posterFormat, posterDate, posterTime, posterPlace, showToast]);

    // Generate 3 poster images using GeminiGen Imagen Pro
    const generatePosterImages = useCallback(async () => {
        if (!generatedPosterPrompt) {
            showToast("الرجاء إنشاء البرومبت أولاً", "error");
            return;
        }

        setIsGeneratingPosterImages(true);
        setPosterImageError(null);
        setPosterImages([]);
        setSelectedPosterIndex(-1);

        try {
            // Use the existing API route for scene images
            const response = await fetch("/api/ai/generate-scene-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imagePrompt: generatedPosterPrompt,
                    sceneNumber: 0, // Not a scene, but API requires it
                    count: 3,
                    aspectRatio: posterFormat === "facebook" ? "16:9" : "9:16"
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "فشل توليد الصور");
            }

            setPosterImages(data.images);
            showToast(`✅ تم توليد ${data.images.length} صور للملصق!`, "success");

        } catch (error) {
            const message = error instanceof Error ? error.message : "خطأ غير معروف";
            setPosterImageError(message);
            showToast(`❌ فشل توليد صور الملصق: ${message}`, "error");
        } finally {
            setIsGeneratingPosterImages(false);
        }
    }, [generatedPosterPrompt, posterFormat, showToast]);

    // Handle JSON input change
    const handleJsonChange = useCallback((value: string) => {
        setJsonInput(value);
        // Reset validation when JSON changes
        setValidationResult(null);
        setParsedWorkshop(null);
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonInput(content);
            // Try to auto-format
            try {
                const parsed = JSON.parse(content);
                const formatted = JSON.stringify(parsed, null, 2);
                setJsonInput(formatted);
            } catch {
                // Keep original if not valid JSON
            }
        };
        reader.readAsText(file);
    }, []);

    // Validate JSON
    const validateJson = useCallback(() => {
        if (!jsonInput.trim()) {
            showToast("الرجاء إدخال JSON أولاً", "error");
            return;
        }

        setIsValidating(true);

        // First check JSON syntax
        const syntaxCheck = validateJsonSyntax(jsonInput);
        if (!syntaxCheck.isValid) {
            setValidationResult({
                isValid: false,
                errors: [{
                    path: "root",
                    field: "JSON Syntax",
                    message: syntaxCheck.error || "خطأ في صيغة JSON",
                    severity: "error"
                }],
                warnings: []
            });
            setIsValidating(false);
            return;
        }

        // Parse JSON
        try {
            const parsed = JSON.parse(jsonInput);

            // Validate workshop structure
            const result = validateWorkshopPlan(parsed);
            setValidationResult(result);

            // If valid or only has warnings, set the parsed workshop
            if (result.isValid || result.errors.length === 0) {
                setParsedWorkshop(result.fixedPlan || parsed);
            }

            if (result.isValid) {
                showToast("التحقق ناجح! ✅", "success");
            } else if (result.errors.length > 0) {
                showToast(`وُجدت ${result.errors.length} أخطاء`, "error");
            }
        } catch (e) {
            setValidationResult({
                isValid: false,
                errors: [{
                    path: "root",
                    field: "JSON",
                    message: e instanceof Error ? e.message : "فشل تحليل JSON",
                    severity: "error"
                }],
                warnings: []
            });
        } finally {
            setIsValidating(false);
        }
    }, [jsonInput, showToast]);

    // Auto-fix workshop
    const handleAutoFix = useCallback(() => {
        if (!validationResult?.fixedPlan) return;

        setParsedWorkshop(validationResult.fixedPlan);
        setJsonInput(JSON.stringify(validationResult.fixedPlan, null, 2));

        // Re-validate the fixed version
        const newResult = validateWorkshopPlan(validationResult.fixedPlan);
        setValidationResult(newResult);

        showToast("تم الإصلاح التلقائي ✨", "success");
    }, [validationResult, showToast]);

    // Save to localStorage
    const handleSave = useCallback(() => {
        if (!parsedWorkshop) {
            showToast("لا توجد ورشة للحفظ", "error");
            return;
        }

        try {
            const id = workshopStorage.save(parsedWorkshop, "imported", "chatgpt");
            showToast(`تم الحفظ بنجاح! 💾 (${workshopStorage.count()} ورش محفوظة)`, "success");
        } catch (e) {
            const message = e instanceof Error ? e.message : "فشل الحفظ";
            showToast(message, "error");
        }
    }, [parsedWorkshop, showToast]);

    // Clear all
    const handleClear = useCallback(() => {
        setJsonInput("");
        setParsedWorkshop(null);
        setValidationResult(null);
    }, []);

    return (
        <main className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Progress Tracker Banner */}
                <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-500/30">
                    <div className="flex flex-col gap-4">
                        {/* Title */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                                    3
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-lg">الخطوة 3: استيراد JSON</p>
                                    <p className="text-sm text-foreground-secondary">أنت على وشك الحصول على خطة ورشة كاملة! 🎉</p>
                                </div>
                            </div>
                            <a
                                href="/program"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-500/30 transition-colors font-medium"
                            >
                                ← العودة للبرنامج (الخطوة 1)
                            </a>
                        </div>

                        {/* Steps Progress */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {/* Step 1 - Completed */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-medium">اخترت ورشة</span>
                            </div>
                            <span className="text-gray-400">→</span>
                            {/* Step 2 - Completed */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-medium">ChatGPT أنشأ JSON</span>
                            </div>
                            <span className="text-gray-400">→</span>
                            {/* Step 3 - Current */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white shadow-lg animate-pulse">
                                <span className="text-lg">📥</span>
                                <span className="text-sm font-bold">الصق JSON هنا!</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        📥 استيراد ورشة من JSON
                    </h1>
                    <p className="text-foreground-secondary">
                        انسخ JSON من ChatGPT والصقه هنا للحصول على خطة ورشة مع PDF جاهز للطباعة
                    </p>
                </div>

                {/* Instructions */}
                <ImportInstructions />

                {/* Input Mode Toggle */}
                <div className="flex gap-3 mb-4">
                    <Button
                        variant={importMode === "paste" ? "primary" : "secondary"}
                        onClick={() => setImportMode("paste")}
                    >
                        لصق JSON
                    </Button>
                    <Button
                        variant={importMode === "upload" ? "primary" : "secondary"}
                        onClick={() => setImportMode("upload")}
                    >
                        رفع ملف JSON
                    </Button>
                </div>

                {/* Upload File */}
                {importMode === "upload" && (
                    <Card variant="bordered" padding="md" className="mb-6">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-foreground-secondary
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-accent file:text-white
                                hover:file:bg-accent/90"
                        />
                    </Card>
                )}

                {/* JSON Editor */}
                {importMode === "paste" && (
                    <div className="mb-6">
                        <JsonEditor
                            value={jsonInput}
                            onChange={handleJsonChange}
                            placeholder='الصق JSON هنا...\n\nمثال:\n{\n  "title": {\n    "ar": "ورشة الشجاعة",\n    "en": "Courage Workshop"\n  },\n  ...\n}'
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                    <Button
                        variant="primary"
                        onClick={validateJson}
                        loading={isValidating}
                        disabled={!jsonInput.trim()}
                    >
                        ✅ التحقق من الصحة
                    </Button>
                    {jsonInput && (
                        <Button variant="secondary" onClick={handleClear}>
                            🗑️ مسح
                        </Button>
                    )}
                </div>

                {/* Validation Results */}
                {validationResult && (
                    <div className="mb-6">
                        <ValidationResults
                            errors={validationResult.errors}
                            warnings={validationResult.warnings}
                            onAutoFix={validationResult.fixedPlan ? handleAutoFix : undefined}
                            canAutoFix={!!validationResult.fixedPlan}
                        />
                    </div>
                )}

                {/* Workshop Preview */}
                {parsedWorkshop && validationResult?.isValid && (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-foreground">معاينة الورشة</h2>
                                <div className="flex gap-3 flex-wrap">
                                    <Button variant="secondary" onClick={handleSave}>
                                        💾 حفظ في المتصفح
                                    </Button>
                                    <PDFDownloadLink
                                        document={<PremiumWorkshopPDF plan={parsedWorkshop} />}
                                        fileName={`workshop-${parsedWorkshop.title.ar.replace(/\s+/g, '-')}-premium.pdf`}
                                    >
                                        {({ loading }) => (
                                            <Button variant="gradient" loading={loading}>
                                                📄 PDF
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                    <Button
                                        variant="primary"
                                        onClick={goToVideo}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        🎬 فيديو أمل
                                    </Button>
                                </div>
                            </div>
                            <WorkshopPreview plan={parsedWorkshop} />
                        </div>

                        {/* Poster Prompt Generator Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🎨</span>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">إنشاء برومبت للملصق</h2>
                                    <p className="text-sm text-foreground-secondary">Generate Nanobanana Poster Prompt</p>
                                </div>
                            </div>

                            <Card variant="bordered" padding="md" className="space-y-4">
                                {/* Format Selection */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">📐 صيغة الملصق</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPosterFormat("facebook")}
                                            className={`p-3 rounded-xl border-2 transition-all ${posterFormat === "facebook"
                                                ? "border-accent bg-accent/10"
                                                : "border-border hover:border-accent/50"
                                                }`}
                                        >
                                            <span className="text-xl block mb-1">📘</span>
                                            <p className="font-medium text-foreground text-sm">فيسبوك 16:9</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPosterFormat("instagram")}
                                            className={`p-3 rounded-xl border-2 transition-all ${posterFormat === "instagram"
                                                ? "border-accent bg-accent/10"
                                                : "border-border hover:border-accent/50"
                                                }`}
                                        >
                                            <span className="text-xl block mb-1">📸</span>
                                            <p className="font-medium text-foreground text-sm">إنستغرام 9:16</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">📅 التاريخ</label>
                                        <input
                                            type="date"
                                            value={posterDate}
                                            onChange={(e) => setPosterDate(e.target.value)}
                                            className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">⏰ الوقت</label>
                                        <input
                                            type="time"
                                            value={posterTime}
                                            onChange={(e) => setPosterTime(e.target.value)}
                                            className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                </div>

                                {/* Place */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">📍 المكان</label>
                                    <input
                                        type="text"
                                        value={posterPlace}
                                        onChange={(e) => setPosterPlace(e.target.value)}
                                        placeholder="دار الثقافة بن عروس"
                                        className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                                    />
                                </div>

                                {/* Generate Button */}
                                <Button
                                    variant="gradient"
                                    onClick={generatePosterPrompt}
                                    loading={isGeneratingPrompt}
                                    fullWidth
                                    size="lg"
                                >
                                    <span className="text-xl ml-2">🎨</span>
                                    إنشاء برومبت للملصق (Nanobanana)
                                </Button>

                                {/* Generated Prompt Display */}
                                {generatedPosterPrompt && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-foreground">📋 Nanobanana Prompt</h4>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedPosterPrompt);
                                                    showToast("تم نسخ البرومبت!", "success");
                                                }}
                                            >
                                                📋 نسخ البرومبت
                                            </Button>
                                        </div>
                                        <pre
                                            dir="ltr"
                                            className="whitespace-pre-wrap text-sm bg-gray-900 text-green-400 p-4 rounded-xl border border-green-700 max-h-[200px] overflow-auto font-mono"
                                        >
                                            {generatedPosterPrompt}
                                        </pre>

                                        {/* Divider */}
                                        <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                                            <span className="flex-1 h-px bg-gray-300"></span>
                                            <span>أو</span>
                                            <span className="flex-1 h-px bg-gray-300"></span>
                                        </div>

                                        {/* Generate 3 Poster Images Button */}
                                        <Button
                                            variant="gradient"
                                            onClick={generatePosterImages}
                                            loading={isGeneratingPosterImages}
                                            fullWidth
                                            size="lg"
                                            className="bg-gradient-to-r from-purple-600 to-violet-700"
                                        >
                                            <span className="text-xl ml-2">✨</span>
                                            توليد 3 خيارات للملصق بالذكاء الاصطناعي
                                        </Button>

                                        {/* Error Display */}
                                        {posterImageError && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                                ⚠️ {posterImageError}
                                            </div>
                                        )}

                                        {/* Generated Poster Images Selector */}
                                        {(posterImages.length > 0 || isGeneratingPosterImages) && (
                                            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200">
                                                <ImageSelector
                                                    images={posterImages}
                                                    selectedIndex={selectedPosterIndex}
                                                    onSelect={(index) => setSelectedPosterIndex(index)}
                                                    isLoading={isGeneratingPosterImages}
                                                    onRegenerate={generatePosterImages}
                                                    error={posterImageError || undefined}
                                                />

                                                {/* Download Selected Image */}
                                                {selectedPosterIndex >= 0 && posterImages[selectedPosterIndex] && (
                                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <p className="text-sm text-green-700 font-medium">
                                                                ✅ تم اختيار الملصق {selectedPosterIndex + 1}
                                                            </p>
                                                            <a
                                                                href={posterImages[selectedPosterIndex].url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download={`poster-${posterFormat}-${Date.now()}.png`}
                                                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                                                            >
                                                                📥 تحميل الملصق
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-xs text-foreground-secondary text-center">
                                            يمكنك نسخ البرومبت لـ Nanobanana أو توليد 3 صور مباشرة
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </>
                )}

                {/* Back to Create */}
                <div className="mt-8 text-center">
                    <a
                        href="/create"
                        className="text-accent hover:underline"
                    >
                        ← العودة إلى صفحة الإنشاء
                    </a>
                </div>
            </div>
        </main>
    );
}
