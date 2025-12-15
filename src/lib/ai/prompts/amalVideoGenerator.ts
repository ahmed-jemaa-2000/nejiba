/**
 * Workshop Video Script Generator - Image-First Workflow
 * 
 * Generates:
 * 1. Nanobanana IMAGE prompts (to create scene images)
 * 2. Sora 2 ANIMATION prompts (to animate those images)
 * 3. Arabic voiceover scripts
 * 
 * Workflow:
 * - Generate image prompts → Create in Nanobanana
 * - Upload image URLs → Use as Sora 2 references  
 * - Generate animated videos → Add voiceover later
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VideoScene {
    sceneNumber: number;
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation';
    titleAr: string;
    titleEn: string;
    duration: number;
    // Arabic voiceover script
    arabicScript: string;
    // Nanobanana image prompt (to create the scene image)
    imagePrompt: string;
    // Sora 2 animation prompt (animates the reference image)
    animationPrompt: string;
    // Legacy field for backward compatibility
    veoPrompt: string;
}

export interface VideoScriptOutput {
    workshopTitle: string;
    characterName: string;
    location: string;
    totalDuration: string;
    scenes: VideoScene[];
}

export interface WorkshopVideoInput {
    titleAr: string;
    titleEn?: string;
    ageGroup: string;
    duration: string;
    activities: string[];
    objectives?: string[];
    // Character customization
    characterName?: string;
    characterDescription?: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

// Character interface for backward compatibility with route
export interface Character {
    id: string;
    nameAr: string;
    nameEn: string;
    age: string;
    description: string;
    visualDescription: string;
}

const DEFAULT_CHARACTER: Character = {
    id: "amal",
    nameAr: "أمل",
    nameEn: "Amal",
    age: "طالبة",
    description: "Tunisian animated character, friendly and enthusiastic workshop host",
    visualDescription: "Tunisian animated character, light olive skin, warm brown eyes, black braided hair with colorful ribbons, purple sweater with star decorations, jeans, white sneakers, friendly smile, expressive face"
};

// Exported CHARACTERS for route compatibility
export const CHARACTERS: Record<string, Character> = {
    amal: DEFAULT_CHARACTER
};

const LOCATION = "دار الثقافة بن عروس";
const LOCATION_EN = "Tunisian cultural center Ben Arous";

// ============================================================================
// EXPERT NANOBANANA IMAGE PROMPTS
// These create the scene images you'll use as Sora 2 references
// ============================================================================

function generateImagePrompt(
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    workshop: WorkshopVideoInput,
    characterDesc: string
): string {
    // Expert Nanobanana prompt format - concise but detailed
    // Include: style, character, pose, setting, lighting, composition

    const prompts = {
        welcome: `Pixar 3D animation style, ${characterDesc}, standing at colorful cultural center entrance, one hand raised waving hello, warm welcoming smile, wearing purple sweater with stars, background shows Tunisian decorated archway with morning sunlight, warm golden lighting, medium shot centered composition, high quality render, vibrant colors, 8k detailed`,

        theme: `Pixar 3D animation style, ${characterDesc}, inside bright workshop room, excited expression with hands open presenting, eyes sparkling, purple sweater with stars, surrounded by colorful art supplies and creative posters, natural window light, medium shot slightly off-center, magical wonder atmosphere, high quality render, 8k detailed`,

        activities: `Pixar 3D animation style, ${characterDesc}, at workshop table holding craft materials, engaged happy expression, giving thumbs up, purple sweater with stars, table covered with ${workshop.activities.slice(0, 2).join(" and ")} supplies, organized shelves behind, bright studio lighting, medium shot with table visible, creative fun atmosphere, high quality render, 8k detailed`,

        invitation: `Pixar 3D animation style, ${characterDesc}, waving goodbye enthusiastically with both hands, biggest joyful smile, slight bouncy pose, purple sweater with stars, standing at cultural center entrance, golden hour sunset lighting with warm glow, colorful confetti in air, full body shot centered, celebratory festive mood, high quality render, 8k detailed`
    };

    return prompts[sceneType];
}

// ============================================================================
// EXPERT SORA 2 ANIMATION PROMPTS  
// These animate your reference images - focus on MOTION not character
// ============================================================================

function generateAnimationPrompt(
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    workshop: WorkshopVideoInput
): string {
    // Critical: Emphasize character consistency, no lip-sync, and realistic quality
    const baseStyle = `[CRITICAL RULES]
1. PRESERVE CHARACTER IDENTITY: The character's FACE, APPEARANCE, CLOTHING must remain EXACTLY as shown in the reference. Do NOT change facial features.

2. SILENT CHARACTER - NO LIP MOVEMENT: Character must NOT speak, talk, or move lips. Mouth stays closed or in natural resting smile. Voiceover will be added separately in post-production.

3. BODY LANGUAGE ONLY: Express emotions through gestures, body movement, facial expressions (eyes, eyebrows, smile) - but NO mouth opening/closing as if speaking.

Style: Pixar 3D animation, photorealistic quality rendering, cinema-grade, smooth 24fps.
Duration: 15 seconds continuous motion.`;

    const prompts = {
        welcome: `${baseStyle}

CHARACTER CONSISTENCY: Keep the exact face and appearance from the reference image. Do not modify facial features.

MOTION SEQUENCE:
[0-5 sec] Character walks into frame from right side, waving arm enthusiastically
[5-10 sec] Stops at center, clasps hands together with excitement, natural smile
[10-15 sec] Opens arms wide in welcoming gesture, small happy bounce

CAMERA: Starts wide shot, gentle smooth push-in to medium shot
MOTION: Fluid natural movement, realistic gestures, bouncy playful energy
LIGHTING: Warm consistent lighting, soft natural shadows
QUALITY: Photorealistic rendering, sharp details, no artifacts`,

        theme: `${baseStyle}

CHARACTER CONSISTENCY: Keep the exact face and appearance from the reference image. Do not modify facial features.

MOTION SEQUENCE:
[0-5 sec] Character gestures dramatically with both hands, showing excitement
[5-10 sec] Points outward as if revealing something magical, slight spin
[10-15 sec] Claps hands with joy, colorful sparkles drift into view

CAMERA: Medium shot, slow gentle orbit around character
MOTION: Smooth expressive gestures, natural body language
LIGHTING: Bright cheerful daylight, soft even shadows
QUALITY: Photorealistic rendering, consistent character look`,

        activities: `${baseStyle}

CHARACTER CONSISTENCY: Keep the exact face and appearance from the reference image. Do not modify facial features.

MOTION SEQUENCE:  
[0-5 sec] Character at table, counts on fingers showing activities
[5-10 sec] Picks up craft materials from table, shows them to camera
[10-15 sec] Gives enthusiastic thumbs up, genuinely happy smile

CAMERA: Medium shot, slight tracking following hand gestures
MOTION: Quick natural hand movements, engaged facial expressions
LIGHTING: Bright studio lighting, clean professional look
QUALITY: Photorealistic, sharp focus on face and materials`,

        invitation: `${baseStyle}

CHARACTER CONSISTENCY: Keep the exact face and appearance from the reference image. Do not modify facial features.

MOTION SEQUENCE:
[0-5 sec] Character holds up craft creation proudly, showing to camera
[5-10 sec] Waves goodbye with both hands, does small excited jump
[10-15 sec] Keeps waving as camera pulls back, confetti appears

CAMERA: Starts medium shot, smooth pull-back to wide shot, slight upward tilt
MOTION: Energetic waving, bouncy jump, floating confetti particles
LIGHTING: Golden hour sunset tones, warm glowing atmosphere
QUALITY: Cinema-grade rendering, beautiful soft lighting`
    };

    return prompts[sceneType];
}

// ============================================================================
// ARABIC SCRIPTS FOR VOICEOVER
// ============================================================================

function generateArabicScript(
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    workshop: WorkshopVideoInput,
    characterName: string
): string {
    const scripts = {
        welcome: `أهلاً وسهلاً! أنا ${characterName}! مرحباً بكم في نادي الأطفال في ${LOCATION}! اليوم عندنا ورشة رائعة جداً... هيّا نكتشفها معاً!`,

        theme: `ورشتنا اليوم بعنوان: "${workshop.titleAr}"! ورشة ممتعة جداً للأطفال من ${workshop.ageGroup}. مدتها ${workshop.duration}!`,

        activities: `في هذه الورشة سنقوم بأنشطة رائعة! ${workshop.activities.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join("، ")}. كلها أنشطة ممتعة ومفيدة!`,

        invitation: `انضموا إلينا في ${LOCATION}! ننتظركم في ورشة "${workshop.titleAr}". نراكم قريباً إن شاء الله!`
    };

    return scripts[sceneType];
}

// ============================================================================
// SCENE GENERATORS
// ============================================================================

function generateScene(
    sceneNumber: number,
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    titleAr: string,
    titleEn: string,
    workshop: WorkshopVideoInput,
    characterName: string,
    characterDesc: string
): VideoScene {
    const imagePrompt = generateImagePrompt(sceneType, workshop, characterDesc);
    const animationPrompt = generateAnimationPrompt(sceneType, workshop);
    const arabicScript = generateArabicScript(sceneType, workshop, characterName);

    return {
        sceneNumber,
        sceneType,
        titleAr,
        titleEn,
        duration: 15,
        arabicScript,
        imagePrompt,
        animationPrompt,
        // veoPrompt is the animation prompt for backward compatibility
        veoPrompt: animationPrompt
    };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateWorkshopVideo(
    workshop: WorkshopVideoInput,
    options: {
        characterId?: string;
        characterName?: string;
        characterDescription?: string;
        hasReferenceImage?: boolean; // Not used but kept for compatibility
    } = {}
): VideoScriptOutput {
    // Use custom character or default - support both characterId and characterName
    const character = options.characterId ? CHARACTERS[options.characterId] || DEFAULT_CHARACTER : DEFAULT_CHARACTER;
    const characterName = options.characterName || workshop.characterName || character.nameAr;
    const characterDesc = options.characterDescription || workshop.characterDescription || character.visualDescription;

    const scenes: VideoScene[] = [
        generateScene(1, 'welcome', 'الترحيب', 'Welcome', workshop, characterName, characterDesc),
        generateScene(2, 'theme', 'موضوع الورشة', 'Workshop Theme', workshop, characterName, characterDesc),
        generateScene(3, 'activities', 'ماذا سنفعل', 'Activities', workshop, characterName, characterDesc),
        generateScene(4, 'invitation', 'الدعوة', 'Invitation', workshop, characterName, characterDesc),
    ];

    const totalSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);

    return {
        workshopTitle: workshop.titleAr,
        characterName,
        location: LOCATION,
        totalDuration: `${totalSeconds} ثانية (${scenes.length} مشاهد × 15 ثانية)`,
        scenes,
    };
}

// ============================================================================
// HELPER: Extract from WorkshopPlanData
// ============================================================================

import type { WorkshopPlanData } from "@/lib/ai/providers/base";

export function workshopPlanToVideoInput(plan: WorkshopPlanData): WorkshopVideoInput {
    // Extract main activities (skip intro/closing)
    const activities = (plan.timeline || [])
        .filter(act => {
            const type = String(act.activityType || act.blockType || '').toLowerCase();
            return !type.includes('intro') && !type.includes('closing') && !type.includes('opener');
        })
        .slice(0, 3)
        .map(act => act.title);

    // Extract objectives
    const objectives = (plan.objectives || [])
        .slice(0, 4)
        .map(obj => typeof obj === 'string' ? obj : obj.ar);

    return {
        titleAr: plan.title?.ar || "ورشة إبداعية",
        titleEn: plan.title?.en || "Creative Workshop",
        ageGroup: plan.generalInfo?.ageGroup || "10-15 سنة",
        duration: plan.generalInfo?.duration || "90 دقيقة",
        activities,
        objectives,
    };
}
