"use client";

/**
 * Import Page
 *
 * Main page for importing workshop plans from ChatGPT JSON output
 */

import { useState, useCallback } from "react";
import { Button, Card, useToast } from "@/components/ui";
import { ImportInstructions } from "@/components/import/ImportInstructions";
import { JsonEditor } from "@/components/import/JsonEditor";
import { ValidationResults } from "@/components/import/ValidationResults";
import { WorkshopPreview } from "@/components/import/WorkshopPreview";
import { validateWorkshopPlan, validateJsonSyntax } from "@/lib/validation/workshopValidator";
import { workshopStorage } from "@/lib/storage/workshopStorage";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PremiumWorkshopPDF } from "@/components/pdf/PremiumWorkshopPDF";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";
import type { ValidationResult } from "@/lib/validation/workshopValidator";

export default function ImportPage() {
    const [jsonInput, setJsonInput] = useState("");
    const [parsedWorkshop, setParsedWorkshop] = useState<WorkshopPlanData | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [importMode, setImportMode] = useState<"paste" | "upload">("paste");
    const [isValidating, setIsValidating] = useState(false);
    const { showToast } = useToast();

    // Poster prompt generator state
    const [posterFormat, setPosterFormat] = useState<"facebook" | "instagram">("facebook");
    const [posterDate, setPosterDate] = useState("");
    const [posterTime, setPosterTime] = useState("");
    const [posterPlace, setPosterPlace] = useState("دار الثقافة بن عروس");
    const [generatedPosterPrompt, setGeneratedPosterPrompt] = useState<string | null>(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

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
                {/* CASEL Helper Banner */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎓</span>
                            <div>
                                <p className="font-bold text-foreground">هل أنت قادم من برنامج CASEL؟</p>
                                <p className="text-sm text-foreground-secondary">الصق الـ JSON الذي أنشأته من ChatGPT هنا للحصول على خطة كاملة!</p>
                            </div>
                        </div>
                        <a
                            href="/program"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-700 hover:bg-violet-500/30 transition-colors font-medium"
                        >
                            ← العودة للبرنامج
                        </a>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        📥 استيراد ورشة من JSON
                    </h1>
                    <p className="text-foreground-secondary">
                        استورد خطة ورشة تم إنشاؤها باستخدام ChatGPT
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
                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={handleSave}>
                                        💾 حفظ في المتصفح
                                    </Button>
                                    <PDFDownloadLink
                                        document={<PremiumWorkshopPDF plan={parsedWorkshop} />}
                                        fileName={`workshop-${parsedWorkshop.title.ar.replace(/\s+/g, '-')}-premium.pdf`}
                                    >
                                        {({ loading }) => (
                                            <Button variant="gradient" loading={loading}>
                                                📄 تحميل PDF محسّن
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
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
                                    <div className="space-y-3 animate-in fade-in duration-300">
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
                                            className="whitespace-pre-wrap text-sm bg-gray-900 text-green-400 p-4 rounded-xl border border-green-700 max-h-[400px] overflow-auto font-mono"
                                        >
                                            {generatedPosterPrompt}
                                        </pre>
                                        <p className="text-xs text-foreground-secondary text-center">
                                            انسخ هذا البرومبت والصقه في Nanobanana أو أي مولد صور AI
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
