import { NextRequest, NextResponse } from "next/server";
import {
    generateWorkshopVideo,
    workshopPlanToVideoInput,
    CHARACTERS,
    type WorkshopVideoInput
} from "@/lib/ai/prompts/amalVideoGenerator";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

interface VideoGeneratorRequest {
    workshop?: WorkshopPlanData;
    workshopInput?: WorkshopVideoInput;
    characterId?: string;
    hasReferenceImage?: boolean;
}

/**
 * POST /api/ai/workshop-video
 * 
 * Generates Veo 2 video prompts for workshop promotions
 * featuring Amal or other characters
 */
export async function POST(request: NextRequest) {
    try {
        const body: VideoGeneratorRequest = await request.json();

        // Get workshop input either directly or from full workshop plan
        let workshopInput: WorkshopVideoInput;

        if (body.workshopInput) {
            workshopInput = body.workshopInput;
        } else if (body.workshop) {
            workshopInput = workshopPlanToVideoInput(body.workshop);
        } else {
            return NextResponse.json(
                { error: "Missing required field: workshop or workshopInput" },
                { status: 400 }
            );
        }

        // Generate video script
        const videoScript = generateWorkshopVideo(workshopInput, {
            characterId: body.characterId || 'amal',
            hasReferenceImage: body.hasReferenceImage ?? true,
        });

        return NextResponse.json(videoScript);
    } catch (error) {
        console.error("Video generation error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate video";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * GET /api/ai/workshop-video
 * 
 * Returns available characters
 */
export async function GET() {
    return NextResponse.json({
        characters: Object.values(CHARACTERS).map(c => ({
            id: c.id,
            nameAr: c.nameAr,
            nameEn: c.nameEn,
            age: c.age,
            description: c.description,
        })),
        defaultCharacter: 'amal',
    });
}
