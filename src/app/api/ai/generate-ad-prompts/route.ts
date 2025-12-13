import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateVideoScript, SCRIPT_ENHANCEMENT_PROMPT, type VideoScript, type VideoScene } from "@/lib/ai/prompts/videoScriptGenerator";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

interface VideoScriptRequest {
    workshop: WorkshopPlanData;
    enhance?: boolean;
    includeCharacter?: boolean;
    hasReferenceImage?: boolean;
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhance video script using OpenAI GPT
 */
async function enhanceVideoScript(
    script: VideoScript,
    hasReferenceImage: boolean
): Promise<VideoScript> {
    const refContext = hasReferenceImage
        ? '\nIMPORTANT: User has uploaded a REFERENCE IMAGE of Noor. Add "[USE REFERENCE IMAGE]" at the START of each image prompt.'
        : '';

    const enhancementPrompt = `${SCRIPT_ENHANCEMENT_PROMPT}
${refContext}

Enhance these ${script.scenes.length} scenes. Keep the same structure but make prompts more vivid and detailed.

CURRENT SCENES:
${JSON.stringify(script.scenes, null, 2)}

Return a JSON object with a "scenes" key containing the enhanced scenes array.
Each scene must have: sceneNumber, sceneType, title, titleAr, description, imagePrompt, videoPrompt, arabicScript, duration (15)`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: "You are an expert video prompt engineer. Return ONLY valid JSON." },
                { role: "user", content: enhancementPrompt }
            ],
            max_completion_tokens: 16000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            console.error("No response from OpenAI for enhancement");
            return script;
        }

        const parsed = JSON.parse(content);
        const enhancedScenes: VideoScene[] = parsed.scenes || parsed;

        if (Array.isArray(enhancedScenes) && enhancedScenes.length === script.scenes.length) {
            return {
                ...script,
                scenes: enhancedScenes
            };
        }

        console.warn("Enhancement returned unexpected format");
        return script;
    } catch (error) {
        console.error("Enhancement error:", error);
        return script;
    }
}

/**
 * POST /api/ai/generate-ad-prompts
 * 
 * Generates dynamic video script for workshop presentation:
 * - Dynamic number of scenes based on activities
 * - 15 seconds per scene
 * - Arabic voiceover script included
 * - Noor as presenter (optional)
 * - Sora 2 video prompts + Nanobanana image prompts
 */
export async function POST(request: NextRequest) {
    try {
        const body: VideoScriptRequest = await request.json();

        if (!body.workshop) {
            return NextResponse.json(
                { error: "Missing required field: workshop (JSON)" },
                { status: 400 }
            );
        }

        const includeCharacter = body.includeCharacter ?? true;
        const hasReferenceImage = body.hasReferenceImage ?? false;

        // Generate video script with dynamic scenes
        let script = generateVideoScript(body.workshop, {
            includeCharacter,
            hasReferenceImage
        });

        // Enhance with AI if requested
        if (body.enhance) {
            script = await enhanceVideoScript(script, hasReferenceImage);
        }

        return NextResponse.json({
            ...script,
            enhanced: body.enhance ?? false
        });
    } catch (error) {
        console.error("Video script generation error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate video script";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
