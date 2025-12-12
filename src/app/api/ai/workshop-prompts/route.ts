import { NextRequest, NextResponse } from "next/server";
import { getMaterialNamesForPrompt } from "@/lib/workshop/materials";
import { exportPDFReadyPrompt, PDF_AGE_DESCRIPTORS } from "@/lib/ai/prompts/pdfReadyWorkshopPrompt";

interface WorkshopPromptsRequest {
    topic: string;
    duration?: string;
    ageRange?: string;
    selectedMaterials?: string[];
}

/**
 * POST /api/ai/workshop-prompts
 * 
 * Exports PDF-ready prompts for use in ChatGPT UI.
 * Includes kidsBenefits, activityBenefits, and parentTips in the schema.
 */
export async function POST(request: NextRequest) {
    try {
        const body: WorkshopPromptsRequest = await request.json();

        if (!body.topic) {
            return NextResponse.json(
                { error: "Missing required field: topic" },
                { status: 400 }
            );
        }

        // Default values
        const duration = body.duration || "90";
        const ageRange = body.ageRange || "8-10";
        const durationMinutes = parseInt(duration);

        // Get age descriptors
        const ageInfo = PDF_AGE_DESCRIPTORS[ageRange] || PDF_AGE_DESCRIPTORS["8-10"];

        // Get material names if provided
        const materialNames = body.selectedMaterials
            ? getMaterialNamesForPrompt(body.selectedMaterials)
            : undefined;

        // Build PDF-ready prompts with kidsBenefits
        const promptExport = exportPDFReadyPrompt({
            topic: body.topic,
            durationMinutes,
            ageRange,
            ageDescriptionAr: ageInfo.ar,
            ageDescriptionEn: ageInfo.en,
            selectedMaterials: materialNames
        });

        return NextResponse.json({
            systemPrompt: promptExport.systemPrompt,
            userPrompt: promptExport.userPrompt,
            combined: promptExport.fullPromptForChatGPT,
            jsonSchema: promptExport.jsonSchemaExample,
            // Helpful metadata
            info: {
                topic: body.topic,
                duration: `${durationMinutes} دقيقة`,
                ageGroup: ageInfo.ar,
                materials: materialNames?.length || 0,
                features: [
                    "kidsBenefits (5 developmental areas)",
                    "activityBenefits per activity",
                    "parentTips (4+ tips)",
                    "longTermImpact",
                    "facilitatorScript with exact phrases"
                ]
            }
        });
    } catch (error) {
        console.error("Workshop prompts error:", error);
        const message = error instanceof Error ? error.message : "Failed to build prompts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
