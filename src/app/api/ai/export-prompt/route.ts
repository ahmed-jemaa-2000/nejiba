import { NextRequest, NextResponse } from "next/server";
import {
    quickExportPrompt,
    PDF_AGE_DESCRIPTORS,
    type PDFReadyPromptExport
} from "@/lib/ai/prompts/pdfReadyWorkshopPrompt";

/**
 * Export PDF-Ready Workshop Prompt
 * 
 * GET /api/ai/export-prompt?topic=الثقة&duration=90&age=8-10
 * 
 * Returns the complete prompt ready to paste into ChatGPT GPT-5.2
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const topic = searchParams.get("topic") || "الثقة بالنفس";
    const duration = parseInt(searchParams.get("duration") || "90");
    const age = searchParams.get("age") || "8-10";

    // Validate duration
    if (![30, 45, 60, 90, 120].includes(duration)) {
        return NextResponse.json(
            { error: "Invalid duration. Must be 30, 45, 60, 90, or 120." },
            { status: 400 }
        );
    }

    // Validate age
    if (!PDF_AGE_DESCRIPTORS[age]) {
        return NextResponse.json(
            { error: "Invalid age range. Must be 6-8, 8-10, 10-12, 8-14, or mixed." },
            { status: 400 }
        );
    }

    try {
        const exportResult: PDFReadyPromptExport = quickExportPrompt(topic, duration, age);

        return NextResponse.json({
            success: true,
            topic,
            duration,
            age,
            prompt: {
                system: exportResult.systemPrompt,
                user: exportResult.userPrompt,
                combined: exportResult.fullPromptForChatGPT,
                schemaExample: exportResult.jsonSchemaExample
            },
            instructions: {
                step1: "انسخ محتوى 'combined' بالكامل",
                step2: "الصقه في ChatGPT GPT-5.2",
                step3: "اضغط إرسال وانتظر JSON",
                step4: "انسخ JSON الناتج واستخدمه في التطبيق"
            }
        });
    } catch (error) {
        console.error("Prompt export error:", error);
        return NextResponse.json(
            { error: "Failed to export prompt" },
            { status: 500 }
        );
    }
}

/**
 * POST endpoint for more complex exports with custom materials
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            topic = "الثقة بالنفس",
            duration = 90,
            age = "8-10",
            materials = []
        } = body;

        // Import the full export function
        const { exportPDFReadyPrompt, PDF_AGE_DESCRIPTORS: ageDesc } = await import(
            "@/lib/ai/prompts/pdfReadyWorkshopPrompt"
        );

        const ageInfo = ageDesc[age] || ageDesc["8-10"];

        const exportResult = exportPDFReadyPrompt({
            topic,
            durationMinutes: duration,
            ageRange: age,
            ageDescriptionAr: ageInfo.ar,
            ageDescriptionEn: ageInfo.en,
            selectedMaterials: materials
        });

        return NextResponse.json({
            success: true,
            config: { topic, duration, age, materialsCount: materials.length },
            prompt: {
                system: exportResult.systemPrompt,
                user: exportResult.userPrompt,
                combined: exportResult.fullPromptForChatGPT,
                schemaExample: exportResult.jsonSchemaExample
            }
        });
    } catch (error) {
        console.error("Prompt export error:", error);
        return NextResponse.json(
            { error: "Failed to export prompt" },
            { status: 500 }
        );
    }
}
