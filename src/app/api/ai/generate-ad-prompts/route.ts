import { NextRequest, NextResponse } from "next/server";
import { generateAdPrompts } from "@/lib/ai/prompts/adPromptGenerator";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

interface AdPromptsRequest {
    workshop: WorkshopPlanData;
    enhance?: boolean; // Reserved for future OpenAI enhancement
}

/**
 * POST /api/ai/generate-ad-prompts
 * 
 * Generates 4 scenes for workshop video ad:
 * - 4 nanobanana image prompts
 * - 4 Veo 3 video prompts (15s each = 60s total)
 * 
 * Character: نور (Noor) - 8-year-old Pixar-style Middle Eastern girl
 */
export async function POST(request: NextRequest) {
    try {
        const body: AdPromptsRequest = await request.json();

        if (!body.workshop) {
            return NextResponse.json(
                { error: "Missing required field: workshop (JSON)" },
                { status: 400 }
            );
        }

        // Generate 4-scene prompts
        const prompts = generateAdPrompts(body.workshop);

        return NextResponse.json({
            ...prompts,
            enhanced: false
        });
    } catch (error) {
        console.error("Ad prompts generation error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate ad prompts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
