/**
 * Amal Video Script Generator
 * 
 * Generates dynamic Veo 2 video prompts for workshop promotions
 * featuring أمل (Amal) as the presenter at نادي الأطفال
 * 
 * Structure:
 * - Scene 1: Welcome - أمل ترحب بالأطفال
 * - Scene 2: Theme - أمل تعلن عن الورشة
 * - Scene 3: Activities - أمل تشرح الأنشطة
 * - Scene 4: Invitation - أمل تدعو للانضمام
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Character {
    id: string;
    nameAr: string;
    nameEn: string;
    age: number;
    description: string;
    visualDescription: string;
    greeting: string;
}

export interface VideoScene {
    sceneNumber: number;
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation';
    titleAr: string;
    titleEn: string;
    duration: number;
    arabicScript: string;
    veoPrompt: string;
    imagePrompt: string;
}

export interface VideoScriptOutput {
    workshopTitle: string;
    character: Character;
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
}

// ============================================================================
// CHARACTERS
// ============================================================================

export const CHARACTERS: Record<string, Character> = {
    amal: {
        id: "amal",
        nameAr: "أمل",
        nameEn: "Amal",
        age: 8,
        description: "مقدمة نادي الأطفال في دار الثقافة بن عروس",
        visualDescription: `Amal (أمل) - Pixar 3D animated style:
- 8-year-old Arab girl
- Warm brown eyes, bright curious expression
- Black hair in two neat braids with purple and teal ribbons
- Light olive skin, friendly smile with slight dimples
- Wearing purple sweater with star decorations, jeans, white sneakers
- Energetic, welcoming, enthusiastic personality`,
        greeting: "أهلاً وسهلاً! أنا أمل"
    },
    noor: {
        id: "noor",
        nameAr: "نور",
        nameEn: "Noor",
        age: 10,
        description: "مقدمة ورش العمل الإبداعية",
        visualDescription: `Noor (نور) - Pixar 3D animated style:
- 8-10 year old Middle Eastern girl
- Warm brown eyes, expressive eyebrows, friendly smile
- Black hair in high ponytail with colorful ribbon
- Colorful casual clothes, purple/pink palette
- Animated, welcoming, energetic personality`,
        greeting: "السلام عليكم أنا نور"
    }
};

export const DEFAULT_CHARACTER = CHARACTERS.amal;
export const LOCATION = "نادي الأطفال - دار الثقافة بن عروس";

// ============================================================================
// SCENE GENERATORS
// ============================================================================

function generateWelcomeScene(
    workshop: WorkshopVideoInput,
    character: Character,
    hasReferenceImage: boolean
): VideoScene {
    const refNote = hasReferenceImage
        ? `[USE REFERENCE IMAGE: ${character.nameEn} character]`
        : "";

    return {
        sceneNumber: 1,
        sceneType: 'welcome',
        titleAr: "الترحيب",
        titleEn: "Welcome",
        duration: 15,
        arabicScript: `${character.greeting}! مرحباً بكم في ${LOCATION}! اليوم لدينا ورشة رائعة جداً... هيّا نكتشفها معاً!`,
        veoPrompt: `${refNote}

VEO 2 - 15 SECOND SCENE

CHARACTER: ${character.nameEn} (${character.nameAr})
${character.visualDescription}

SCENE: WELCOME TO KIDS CLUB
[0:00-0:05] ${character.nameEn} walks into frame from right, waving enthusiastically at camera with big smile
[0:05-0:10] She stops center frame, hands together in excitement, eyes sparkling
[0:10-0:15] Opens arms wide in welcoming gesture, slight bounce of joy

SETTING: 
- Entrance of دار الثقافة بن عروس (Tunisian cultural center)
- Colorful "نادي الأطفال" sign visible
- Warm morning sunlight, welcoming atmosphere
- Tunisian decorative tiles and arches

CAMERA: Start wide shot, gentle push-in to medium shot
MOOD: Warm, welcoming, exciting, child-friendly
STYLE: Pixar 3D animation, smooth fluid movements, highly expressive character`,
        imagePrompt: `${refNote}
Pixar 3D animated scene - WELCOME:

${character.visualDescription}

POSE: ${character.nameEn} stands at entrance, waving warmly with big smile

SETTING: Entrance of ${LOCATION}, Tunisian architecture, colorful tiles, morning light

MOOD: Warm, inviting
COMPOSITION: Medium shot, character centered, "نادي الأطفال" sign visible`
    };
}

function generateThemeScene(
    workshop: WorkshopVideoInput,
    character: Character,
    hasReferenceImage: boolean
): VideoScene {
    const refNote = hasReferenceImage
        ? `[USE REFERENCE IMAGE: ${character.nameEn} character]`
        : "";

    return {
        sceneNumber: 2,
        sceneType: 'theme',
        titleAr: "موضوع الورشة",
        titleEn: "Workshop Theme",
        duration: 15,
        arabicScript: `ورشتنا اليوم بعنوان: "${workshop.titleAr}"! ورشة ممتعة جداً للأطفال من ${workshop.ageGroup}. مدتها ${workshop.duration}!`,
        veoPrompt: `${refNote}

VEO 2 - 15 SECOND SCENE

CHARACTER: ${character.nameEn} (${character.nameAr})
${character.visualDescription}

SCENE: WORKSHOP THEME REVEAL
[0:00-0:05] ${character.nameEn} gestures dramatically, workshop title "${workshop.titleAr}" animates in with sparkle effects
[0:05-0:10] Camera orbits slightly as she presents the theme with excitement
[0:10-0:15] She claps hands together, colorful workshop materials float into view

TITLE DISPLAY: "${workshop.titleAr}" in beautiful Arabic calligraphy, glowing effect

SETTING:
- Inside the cultural center workshop room
- Colorful materials and decorations
- Bright, cheerful atmosphere

CAMERA: Dynamic movement, slight orbit around character and title
MOOD: Magical reveal, anticipation building
STYLE: Pixar 3D, particle effects on title, vibrant colors`,
        imagePrompt: `${refNote}
Pixar 3D animated scene - THEME REVEAL:

${character.visualDescription}

POSE: ${character.nameEn} presenting workshop title with excitement

TITLE: "${workshop.titleAr}" floating in Arabic calligraphy

SETTING: Workshop room, colorful materials, bright atmosphere

MOOD: Exciting, magical
COMPOSITION: Character left, title display right`
    };
}

function generateActivitiesScene(
    workshop: WorkshopVideoInput,
    character: Character,
    hasReferenceImage: boolean
): VideoScene {
    const refNote = hasReferenceImage
        ? `[USE REFERENCE IMAGE: ${character.nameEn} character]`
        : "";

    const activitiesList = workshop.activities.slice(0, 3);
    const activitiesText = activitiesList.map((a, i) => `${i + 1}. ${a}`).join("، ");

    return {
        sceneNumber: 3,
        sceneType: 'activities',
        titleAr: "ماذا سنفعل",
        titleEn: "What We'll Do",
        duration: 15,
        arabicScript: `في هذه الورشة سنقوم بأنشطة رائعة! ${activitiesText}. كلها أنشطة ممتعة ومفيدة!`,
        veoPrompt: `${refNote}

VEO 2 - 15 SECOND SCENE

CHARACTER: ${character.nameEn} (${character.nameAr})
${character.visualDescription}

SCENE: ACTIVITIES PREVIEW
[0:00-0:05] ${character.nameEn} counts on fingers, activity icons animate in one by one
[0:05-0:10] Quick montage of activity representations: ${activitiesList.join(", ")}
[0:10-0:15] ${character.nameEn} gives thumbs up, excited expression

ACTIVITIES SHOWN:
${activitiesList.map((a, i) => `${i + 1}. ${a}`).join("\n")}

SETTING:
- Workshop table with colorful materials
- Craft supplies, art materials visible
- Dynamic, energetic atmosphere

CAMERA: Medium shots with quick cuts between activities
MOOD: Fun, creative, engaging
STYLE: Pixar 3D, animated icons, vibrant transitions`,
        imagePrompt: `${refNote}
Pixar 3D animated scene - ACTIVITIES:

${character.visualDescription}

POSE: ${character.nameEn} showing craft materials, excited expression

ACTIVITIES: ${activitiesList.join(", ")}

SETTING: Workshop table, colorful materials, bright lighting

MOOD: Creative, fun
COMPOSITION: Medium shot, materials prominently displayed`
    };
}

function generateInvitationScene(
    workshop: WorkshopVideoInput,
    character: Character,
    hasReferenceImage: boolean
): VideoScene {
    const refNote = hasReferenceImage
        ? `[USE REFERENCE IMAGE: ${character.nameEn} character]`
        : "";

    return {
        sceneNumber: 4,
        sceneType: 'invitation',
        titleAr: "الدعوة",
        titleEn: "Invitation",
        duration: 15,
        arabicScript: `انضموا إلينا في ${LOCATION}! ننتظركم في ورشة "${workshop.titleAr}". نراكم قريباً إن شاء الله!`,
        veoPrompt: `${refNote}

VEO 2 - 15 SECOND SCENE

CHARACTER: ${character.nameEn} (${character.nameAr})
${character.visualDescription}

SCENE: INVITATION & GOODBYE
[0:00-0:05] ${character.nameEn} holds finished craft creation proudly, big smile
[0:05-0:10] She waves goodbye with both hands, slight jumping with excitement
[0:10-0:15] Camera pulls back, sparkles and confetti appear, "نراكم قريباً!" text

SETTING:
- Back at entrance of ${LOCATION}
- Golden hour/sunset lighting
- Workshop creations visible in background
- Festive confetti and sparkles

TEXT OVERLAY: Space for "نراكم قريباً!" and contact info

CAMERA: Start medium, pull back to wide, uplifting movement
MOOD: Celebratory, inviting, warm goodbye
STYLE: Pixar 3D, particle effects, warm lighting`,
        imagePrompt: `${refNote}
Pixar 3D animated scene - INVITATION:

${character.visualDescription}

POSE: ${character.nameEn} waving goodbye with both hands, biggest smile, jumping

SETTING: Entrance of ${LOCATION}, sunset lighting, confetti

TEXT: Space for "نراكم قريباً في نادي الأطفال!"

MOOD: Celebratory, inviting
COMPOSITION: Full body, festive atmosphere`
    };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateWorkshopVideo(
    workshop: WorkshopVideoInput,
    options: {
        characterId?: string;
        hasReferenceImage?: boolean;
    } = {}
): VideoScriptOutput {
    const { characterId = 'amal', hasReferenceImage = true } = options;
    const character = CHARACTERS[characterId] || DEFAULT_CHARACTER;

    const scenes: VideoScene[] = [
        generateWelcomeScene(workshop, character, hasReferenceImage),
        generateThemeScene(workshop, character, hasReferenceImage),
        generateActivitiesScene(workshop, character, hasReferenceImage),
        generateInvitationScene(workshop, character, hasReferenceImage),
    ];

    const totalSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);

    return {
        workshopTitle: workshop.titleAr,
        character,
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
