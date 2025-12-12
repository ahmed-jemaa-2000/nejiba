import { NextRequest, NextResponse } from "next/server";
import type { WorkshopInput } from "@/lib/ai";
import { exportWorkshopPromptsForUI } from "@/lib/ai/openai";
import { getMaterialNamesForPrompt } from "@/lib/workshop/materials";

interface WorkshopPromptsRequest extends WorkshopInput {
    selectedMaterials?: string[];
    format?: "text" | "json"; // NEW: Support JSON format for external use
}

export async function POST(request: NextRequest) {
    try {
        const body: WorkshopPromptsRequest = await request.json();

        if (!body.topic) {
            return NextResponse.json(
                { error: "Missing required field: topic" },
                { status: 400 }
            );
        }

        if (!["30", "45", "60", "90", "120"].includes(body.duration)) {
            body.duration = "90";
        }

        if (!["6-8", "8-10", "10-12", "8-14", "mixed"].includes(body.ageRange)) {
            body.ageRange = "8-10";
        }

        const materialNames = body.selectedMaterials
            ? getMaterialNamesForPrompt(body.selectedMaterials)
            : [];

        const prompts = exportWorkshopPromptsForUI({
            ...body,
            selectedMaterialNames: materialNames,
        }, body.format || "text");

        return NextResponse.json(prompts);
    } catch (error) {
        console.error("Workshop prompts error:", error);
        const message = error instanceof Error ? error.message : "Failed to build prompts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
