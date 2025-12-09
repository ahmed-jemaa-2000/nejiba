import { NextRequest, NextResponse } from "next/server";
import { generateWorkshopPlan, type WorkshopInput } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
    try {
        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured", code: "NO_API_KEY" },
                { status: 500 }
            );
        }

        const body: WorkshopInput = await request.json();

        // Validate required fields
        if (!body.topic) {
            return NextResponse.json(
                { error: "Missing required field: topic" },
                { status: 400 }
            );
        }

        // Validate duration
        if (!["30", "45", "60"].includes(body.duration)) {
            body.duration = "60";
        }

        // Validate age range
        if (!["6-8", "8-10", "10-12", "mixed"].includes(body.ageRange)) {
            body.ageRange = "8-10";
        }

        console.log("Generating workshop plan for:", body.topic);

        const workshopPlan = await generateWorkshopPlan(body);

        return NextResponse.json(workshopPlan);
    } catch (error) {
        console.error("Workshop generation error:", error);

        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("API key")) {
                return NextResponse.json(
                    { error: "Invalid OpenAI API key", code: "INVALID_API_KEY" },
                    { status: 401 }
                );
            }
            return NextResponse.json(
                { error: error.message, code: "GENERATION_ERROR" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate workshop plan", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
