import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
    generateWorkshopVideo,
    workshopPlanToVideoInput,
    CHARACTERS,
    PLATFORM_CONFIGS,
    type WorkshopVideoInput,
    type VideoScriptOutput,
    type VideoScene,
    type VideoPlatform
} from "@/lib/ai/prompts/amalVideoGenerator";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface VideoGeneratorRequest {
    workshop?: WorkshopPlanData;
    workshopInput?: WorkshopVideoInput;
    characterId?: string;
    platform?: VideoPlatform;
    hasReferenceImage?: boolean;
    enhance?: boolean;
}

// AI Enhancement prompt for video scripts - EXPERT VERSION
const ENHANCEMENT_PROMPT = `You are an expert video script writer for children's educational promotional content in Arabic.

Your task is to enhance video scene prompts for a workshop promotion video featuring an animated character.

CRITICAL ARABIC LANGUAGE RULES:
- Use SIMPLE MODERN STANDARD ARABIC (الفصحى البسيطة)
- Make dialogue warm, exciting, and child-friendly
- Each arabicScript should be 15-20 Arabic words (fits 8 second scenes)
- Add emotional expressions: excitement, joy, curiosity
- Use rhetorical questions to engage viewers
- Include calls to action

DIALOGUE ENHANCEMENT TIPS:
- Start hooks with attention grabbers: "هل تعلمون؟", "يا أصدقاء!", "تعالوا معي!"
- Add descriptive words: "رائع", "ممتع", "مذهل", "مميز"
- End with clear invitations: "انضموا إلينا!", "لا تفوتوا!", "نراكم قريباً!"

VIDEO PROMPT (veoPrompt) RULES:
- Use "stylized 3D animated character" NOT "Pixar" or "Disney"
- Add specific camera movements and angles
- Include character emotions and gestures
- Specify lighting mood: warm, colorful, inviting
- Keep animations smooth and child-friendly
- NEVER add text overlays - visual props only

Return a JSON object with "scenes" array containing the enhanced scenes.
Each scene MUST have: sceneNumber, sceneType, titleAr, titleEn, duration, arabicScript, veoPrompt, imagePrompt`;

/**
 * Enhance video script using OpenAI
 */
async function enhanceVideoScript(script: VideoScriptOutput): Promise<VideoScriptOutput> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: ENHANCEMENT_PROMPT },
                {
                    role: "user",
                    content: `Workshop: "${script.workshopTitle}"
Character: ${script.characterName}
Location: ${script.location}

Please enhance these ${script.scenes.length} scenes:

${JSON.stringify(script.scenes, null, 2)}

Return ONLY valid JSON with "scenes" array.`
                }
            ],
            max_completion_tokens: 8000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            console.error("No response from OpenAI for enhancement");
            return script;
        }

        const parsed = JSON.parse(content);
        const enhancedScenes: VideoScene[] = parsed.scenes;

        if (Array.isArray(enhancedScenes) && enhancedScenes.length === script.scenes.length) {
            return {
                ...script,
                scenes: enhancedScenes.map((enhanced, i) => ({
                    ...script.scenes[i],
                    arabicScript: enhanced.arabicScript || script.scenes[i].arabicScript,
                    veoPrompt: enhanced.veoPrompt || script.scenes[i].veoPrompt,
                    imagePrompt: enhanced.imagePrompt || script.scenes[i].imagePrompt,
                }))
            };
        }

        console.warn("Enhancement returned unexpected format, using original");
        return script;
    } catch (error) {
        console.error("Enhancement error:", error);
        return script;
    }
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

        // Generate base video script
        let videoScript = generateWorkshopVideo(workshopInput, {
            platform: body.platform || 'sora2',
            characterId: body.characterId || 'amal',
            hasReferenceImage: body.hasReferenceImage ?? true,
        });

        // Enhance with AI if requested
        if (body.enhance) {
            videoScript = await enhanceVideoScript(videoScript);
        }

        return NextResponse.json({
            ...videoScript,
            enhanced: body.enhance ?? false
        });
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
        platforms: Object.values(PLATFORM_CONFIGS),
        defaultCharacter: 'amal',
        defaultPlatform: 'sora2',
    });
}

