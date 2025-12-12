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
import { EnhancedWorkshopPDF } from "@/components/pdf/EnhancedWorkshopPDF";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";
import type { ValidationResult } from "@/lib/validation/workshopValidator";

export default function ImportPage() {
    const [jsonInput, setJsonInput] = useState("");
    const [parsedWorkshop, setParsedWorkshop] = useState<WorkshopPlanData | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [importMode, setImportMode] = useState<"paste" | "upload">("paste");
    const [isValidating, setIsValidating] = useState(false);
    const { showToast } = useToast();

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
                                        document={<EnhancedWorkshopPDF plan={parsedWorkshop} />}
                                        fileName={`workshop-${parsedWorkshop.title.ar.replace(/\s+/g, '-')}-enhanced.pdf`}
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
