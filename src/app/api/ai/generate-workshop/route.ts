import { NextRequest, NextResponse } from "next/server";
import { generateWorkshopPlan, type WorkshopInput } from "@/lib/ai";
import { getMaterialNamesForPrompt } from "@/lib/workshop/materials";

interface GenerateWorkshopRequest extends WorkshopInput {
    selectedMaterials?: string[];
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

        const body: GenerateWorkshopRequest = await request.json();

        // Validate required fields
        if (!body.topic) {
            return NextResponse.json(
                { error: "Missing required field: topic" },
                { status: 400 }
            );
        }

        // Validate duration
        if (!["30", "45", "60", "90", "120"].includes(body.duration)) {
            body.duration = "90"; // Default to 90 for better quality
        }

        // Validate age range
        if (!["6-8", "8-10", "10-12", "8-14", "mixed"].includes(body.ageRange)) {
            body.ageRange = "8-10";
        }

        // Convert material IDs to names for the prompt
        const materialNames = body.selectedMaterials
            ? getMaterialNamesForPrompt(body.selectedMaterials)
            : [];

        console.log("🎓 Generating workshop plan for:", body.topic);
        console.log("📦 With", materialNames.length, "selected materials");

        const workshopPlan = await generateWorkshopPlan({
            ...body,
            selectedMaterialNames: materialNames, // Pass material names to prompt
        });

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
