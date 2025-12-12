/**
 * Ad Prompt Generator for Workshop Promotion - 4 SCENES VERSION
 * 
 * Generates for each workshop:
 * - 4 nanobanana Image Prompts (one per scene)
 * - 4 Veo 3 Video Prompts (15 seconds each = 60 seconds total)
 * 
 * Character: نور (Noor) - 8-year-old Pixar-style Middle Eastern girl
 */

import type { WorkshopPlanData } from "@/lib/ai/providers/base";

// ============================================================================
// TYPES
// ============================================================================

export interface Scene {
    sceneNumber: number;
    title: string;
    titleAr: string;
    imagePrompt: string;
    videoPrompt: string;
    duration: number; // 15 seconds each
}

export interface AdPrompts {
    workshopTitle: string;
    workshopTitleEn: string;
    characterName: string;
    totalDuration: string;
    scenes: Scene[];
    summary: string;
}

// ============================================================================
// SCENE DEFINITIONS
// ============================================================================

interface SceneTemplate {
    title: string;
    titleAr: string;
    imageDescription: (activity: string, materials: string) => string;
    videoAction: (activity: string) => string;
    mood: string;
    cameraMove: string;
}

const SCENE_TEMPLATES: SceneTemplate[] = [
    {
        title: "Opening - Curiosity",
        titleAr: "المقدمة - الفضول",
        imageDescription: (activity, materials) =>
            `standing in a colorful workshop room, looking curious and excited, eyes wide with wonder, hand on chin thinking pose`,
        videoAction: (activity) =>
            `walks into the workshop room, looks around curiously, spots something interesting, eyes light up with excitement`,
        mood: "curious, anticipating, wonder",
        cameraMove: "slow push-in from medium to close-up"
    },
    {
        title: "Discovery - Learning",
        titleAr: "الاكتشاف - التعلم",
        imageDescription: (activity, materials) =>
            `actively engaged in ${activity}, holding ${materials}, focused expression, learning something new`,
        videoAction: (activity) =>
            `picks up materials and starts ${activity}, concentrated expression, then has an "aha!" moment, smiles with understanding`,
        mood: "focused, determined, discovering",
        cameraMove: "gentle orbit around Noor, showing her work"
    },
    {
        title: "Action - Creating",
        titleAr: "العمل - الإبداع",
        imageDescription: (activity, materials) =>
            `in the middle of creating something amazing, hands busy with ${materials}, proud confident smile, showing progress`,
        videoAction: (activity) =>
            `working confidently on ${activity}, hands moving skillfully, occasionally looks at camera with proud smile, shows what she's making`,
        mood: "confident, creative, proud",
        cameraMove: "close-up on hands, then pull back to show Noor's proud face"
    },
    {
        title: "Celebration - Achievement",
        titleAr: "الاحتفال - الإنجاز",
        imageDescription: (activity, materials) =>
            `jumping with joy, arms raised in victory, biggest smile, holding completed creation, sparkles around her`,
        videoAction: (activity) =>
            `holds up finished work, jumps with joy, arms raised in victory, gives enthusiastic thumbs up to camera, winks playfully`,
        mood: "triumphant, joyful, inspiring",
        cameraMove: "zoom out to full body, then slow push-in to smiling face"
    }
];

// ============================================================================
// WORKSHOP DATA EXTRACTOR
// ============================================================================

interface WorkshopExtract {
    titleAr: string;
    titleEn: string;
    activities: Array<{ title: string; type: string; materials: string[] }>;
    mainMaterials: string[];
    ageGroup: string;
    duration: string;
}

function extractWorkshopData(workshop: WorkshopPlanData): WorkshopExtract {
    // Get activities from timeline
    const activities = (workshop.timeline || []).slice(0, 4).map(act => ({
        title: act.title,
        type: act.activityType || "نشاط إبداعي",
        materials: act.whatYouNeed || []
    }));

    // Get main materials (first 5)
    const mainMaterials = (workshop.materials || [])
        .slice(0, 5)
        .map(m => typeof m === 'string' ? m : m.item);

    return {
        titleAr: workshop.title?.ar || "ورشة الطفل القائد",
        titleEn: workshop.title?.en || "Leader Kid Workshop",
        activities,
        mainMaterials,
        ageGroup: workshop.generalInfo?.ageGroup || "8-10 سنوات",
        duration: workshop.generalInfo?.duration || "90 دقيقة"
    };
}

// ============================================================================
// IMAGE PROMPT GENERATOR
// ============================================================================

function generateSceneImagePrompt(
    sceneTemplate: SceneTemplate,
    sceneNumber: number,
    workshopData: WorkshopExtract
): string {
    // Get relevant activity for this scene
    const activity = workshopData.activities[sceneNumber - 1] || workshopData.activities[0];
    const activityDesc = activity?.title || "workshop activity";
    const materials = workshopData.mainMaterials.slice(0, 2).join(", ") || "craft supplies";

    return `Pixar-Disney 3D animated style illustration - SCENE ${sceneNumber}/4:

CHARACTER: Noor (نور)
- 8-year-old Middle Eastern girl
- Black ponytail with bright purple ribbon
- Warm brown eyes, expressive face
- Purple t-shirt with small star design
- Blue jeans, white sneakers

POSE & ACTION:
Noor is ${sceneTemplate.imageDescription(activityDesc, materials)}

SCENE: "${sceneTemplate.titleAr}" (${sceneTemplate.title})

ENVIRONMENT:
- Bright, colorful Arabic-style workshop room
- Warm natural lighting from windows
- Colorful rugs and cushions
- Child-friendly organized space
- Soft bokeh background

PROPS VISIBLE: ${materials}

MOOD: ${sceneTemplate.mood}

STYLE:
- Pixar/Disney 3D render quality
- Hyper-detailed, cinema lighting
- Soft shadows, vibrant saturated colors
- 4K, professional studio quality

COMPOSITION:
- ${sceneNumber === 1 ? 'Wide shot to establish scene' :
            sceneNumber === 4 ? 'Dynamic celebratory pose' :
                'Medium shot focused on action'}
- Rule of thirds placement
- Space at bottom for text overlay

WORKSHOP: "${workshopData.titleAr}"`;
}

// ============================================================================
// VIDEO PROMPT GENERATOR (Veo 3)
// ============================================================================

function generateSceneVideoPrompt(
    sceneTemplate: SceneTemplate,
    sceneNumber: number,
    workshopData: WorkshopExtract
): string {
    const activity = workshopData.activities[sceneNumber - 1] || workshopData.activities[0];
    const activityDesc = activity?.title || "workshop activity";
    const isLast = sceneNumber === 4;

    return `Veo 3 - 15-SECOND ANIMATED SCENE (${sceneNumber}/4)

===== CHARACTER =====
Noor (نور) - Same appearance in ALL 4 scenes:
- 8-year-old Middle Eastern girl
- Black ponytail with purple ribbon
- Warm brown eyes
- Purple t-shirt with star, blue jeans
- Expressive, animated personality

===== SCENE: ${sceneTemplate.title} =====

[0:00 - 0:03] TRANSITION IN
${sceneNumber === 1
            ? '- Fade in on empty workshop room, Noor walks in from right'
            : '- Smooth transition from previous scene, continuous motion'}
- Camera: ${sceneTemplate.cameraMove.split(',')[0]}

[0:03 - 0:12] MAIN ACTION
- Noor ${sceneTemplate.videoAction(activityDesc)}
- Expression shows ${sceneTemplate.mood}
- Natural, fluid animation
- ${sceneNumber < 4 ? 'Building anticipation for next scene' : 'Triumphant energy'}

[0:12 - 0:15] TRANSITION OUT
${isLast
            ? `- Noor looks at camera, gives double thumbs up
- Big smile, slight head tilt
- Text fades in: "${workshopData.titleAr}"
- Sparkle effects around text`
            : `- Motion continues into position for next scene
- Camera: ${sceneTemplate.cameraMove.split(',')[1] || 'maintains framing'}`}

===== TECHNICAL =====
- Style: Pixar 3D animation, cinema quality
- Frame rate: 24fps, smooth motion
- Lighting: Warm, consistent with Scene 1
- Audio sync: Designed for upbeat background music

===== CONTINUITY NOTE =====
This is scene ${sceneNumber} of 4. ${sceneNumber < 4
            ? 'End position should allow smooth transition to next scene.'
            : 'Final scene - triumphant ending with workshop title.'
        }`;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateAdPrompts(workshop: WorkshopPlanData): AdPrompts {
    const data = extractWorkshopData(workshop);

    const scenes: Scene[] = SCENE_TEMPLATES.map((template, index) => ({
        sceneNumber: index + 1,
        title: template.title,
        titleAr: template.titleAr,
        imagePrompt: generateSceneImagePrompt(template, index + 1, data),
        videoPrompt: generateSceneVideoPrompt(template, index + 1, data),
        duration: 15
    }));

    return {
        workshopTitle: data.titleAr,
        workshopTitleEn: data.titleEn,
        characterName: "نور (Noor)",
        totalDuration: "60 ثانية (4 مقاطع × 15 ثانية)",
        scenes,
        summary: `إعلان ورشة "${data.titleAr}" - 4 مشاهد - ${data.duration} - للأطفال ${data.ageGroup}`
    };
}

// ============================================================================
// OPENAI ENHANCEMENT PROMPT
// ============================================================================

export const ENHANCEMENT_SYSTEM_PROMPT = `You are an expert prompt engineer for AI image and video generation.

Your task is to enhance prompts for:
1. nanobanana (image generation) - Focus on visual details, lighting, composition
2. Veo 3 (video generation) - Focus on motion, timing, camera movements

Keep the core concept but make prompts more detailed and effective.
Always maintain:
- The character "Noor" (نور) - 8-year-old Middle Eastern girl
- Pixar/Disney 3D animation style
- Kid-friendly, inspiring mood
- Consistent character appearance across ALL 4 scenes
- Scene continuity and flow

Respond in the same format, keeping scene structure intact.`;
