import { NextRequest, NextResponse } from "next/server";
import {
    regenerateActivity,
    generateAlternatives,
    type WorkshopPlanData
} from "@/lib/ai";

interface RegenerateRequest {
    workshopPlan: WorkshopPlanData;
    activityIndex: number;
    customInstructions?: string;
    getAlternatives?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured", code: "NO_API_KEY" },
                { status: 500 }
            );
        }

        const body: RegenerateRequest = await request.json();

        // Validate required fields
        if (!body.workshopPlan) {
            return NextResponse.json(
                { error: "Missing workshopPlan" },
                { status: 400 }
            );
        }

        if (typeof body.activityIndex !== "number" || body.activityIndex < 0) {
            return NextResponse.json(
                { error: "Invalid activityIndex" },
                { status: 400 }
            );
        }

        if (body.activityIndex >= body.workshopPlan.timeline.length) {
            return NextResponse.json(
                { error: "activityIndex out of range" },
                { status: 400 }
            );
        }

        console.log(
            `Regenerating activity ${body.activityIndex} for:`,
            body.workshopPlan.title.ar
        );

        // Generate alternatives or single regeneration
        if (body.getAlternatives) {
            const alternatives = await generateAlternatives(
                body.workshopPlan,
                body.activityIndex
            );
            return NextResponse.json({ alternatives });
        } else {
            const newActivity = await regenerateActivity(
                body.workshopPlan,
                body.activityIndex,
                body.customInstructions
            );
            return NextResponse.json({ activity: newActivity });
        }
    } catch (error) {
        console.error("Activity regeneration error:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, code: "REGENERATION_ERROR" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Failed to regenerate activity", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
