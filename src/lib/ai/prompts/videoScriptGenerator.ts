/**
 * Workshop Video Script Generator
 * 
 * Generates dynamic scenes for workshop presentation videos:
 * - Noor (نور) as the main presenter
 * - Location: دار ثقافة بن عروس
 * - Dynamic number of scenes based on workshop content
 * - 15 seconds per scene
 * 
 * Scene Structure:
 * 1. Welcome - Noor introduces herself
 * 2. Theme Reveal - Workshop title and overview
 * 3-N. Activities - One scene per activity
 * N+1. Learning - What kids will learn
 * N+2. Goodbye - Closing and invitation
 */

import type { WorkshopPlanData } from "@/lib/ai/providers/base";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoScene {
    sceneNumber: number;
    sceneType: 'welcome' | 'theme' | 'activity' | 'learning' | 'goodbye';
    title: string;
    titleAr: string;
    description: string;
    imagePrompt: string;
    videoPrompt: string;
    arabicScript: string; // ما ستقوله نور
    duration: number; // Always 15 seconds
}

export interface VideoScript {
    workshopTitle: string;
    workshopTitleEn: string;
    presenter: string;
    location: string;
    totalScenes: number;
    totalDuration: string;
    scenes: VideoScene[];
    summary: string;
}

export interface ScriptGeneratorOptions {
    includeCharacter?: boolean;
    hasReferenceImage?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRESENTER = {
    name: "نور",
    nameEn: "Noor",
    location: "دار ثقافة بن عروس",
    greeting: "السلام عليكم أنا نور",
};

const CHARACTER_DESCRIPTION = `Character (consistent across all scenes) Noor (نور) - Pixar/Disney 3D animated style:
- Age: 8-10 year old Middle Eastern girl, age-appropriate proportions
- Face: warm brown eyes, broad expressive eyebrows, friendly smile, subtle dimples
- Hair: glossy black hair in a neat high ponytail tied with a colorful ribbon (purple + teal threads visible)
- Outfit: colorful casual clothes in a purple/pink palette — textured knit sweater over a patterned dress, comfortable sneakers; visible fabric weave and soft cloth shading
- Personality: animated, welcoming, energetic, very expressive micro-expressions`;

// ============================================================================
// SCENE GENERATORS
// ============================================================================

function generateWelcomeScene(workshopData: WorkshopExtract, hasRef: boolean): VideoScene {
    const refNote = hasRef ? "[USE REFERENCE IMAGE FOR CHARACTER]" : "";

    return {
        sceneNumber: 1,
        sceneType: 'welcome',
        title: "Welcome",
        titleAr: "الترحيب",
        description: "Noor greets viewers and introduces herself",
        imagePrompt: `${refNote}
Pixar 3D animated scene - WELCOME SHOT:

${CHARACTER_DESCRIPTION}

POSE: Noor stands at the entrance of a beautiful Arabic-style cultural center, waving warmly at the camera with a big smile.

SETTING: 
- Entrance of ${PRESENTER.location}
- Traditional Tunisian architecture with colorful tiles
- Morning sunlight, welcoming atmosphere
- "أهلاً وسهلاً" sign visible

MOOD: Warm, inviting, exciting
COMPOSITION: Medium shot, Noor centered, space for title overlay at bottom

WORKSHOP: "${workshopData.titleAr}"`,
        videoPrompt: `Sora 2 - 15 SECOND ANIMATED SCENE:

${CHARACTER_DESCRIPTION}

SCENE: WELCOME
[0:00-0:05] Noor walks into frame from right, waving at camera
[0:05-0:10] She stops center, hands together, big welcoming smile
[0:10-0:15] She opens arms wide in welcoming gesture, slight head tilt

SETTING: Entrance of cultural center, warm morning light
CAMERA: Starts wide, gentle push-in to medium shot
MOOD: Warm, inviting, energetic
STYLE: Pixar 3D, smooth animation, expressive character`,
        arabicScript: `${PRESENTER.greeting} مرحباً بكم في ${PRESENTER.location}! اليوم عندنا ورشة رائعة... تعالوا نكتشفها معاً!`,
        duration: 15
    };
}

function generateThemeScene(workshopData: WorkshopExtract, hasRef: boolean): VideoScene {
    const refNote = hasRef ? "[USE REFERENCE IMAGE FOR CHARACTER]" : "";

    return {
        sceneNumber: 2,
        sceneType: 'theme',
        title: "Theme Reveal",
        titleAr: "موضوع الورشة",
        description: "Noor reveals the workshop theme",
        imagePrompt: `${refNote}
Pixar 3D animated scene - THEME REVEAL:

${CHARACTER_DESCRIPTION}

POSE: Noor stands proudly, gesturing toward a beautiful workshop title display. Excited expression.

TITLE DISPLAY: "${workshopData.titleAr}" in elegant Arabic calligraphy, floating/glowing effect

SETTING:
- Inside the cultural center
- Colorful workshop room
- Materials related to ${workshopData.titleEn} visible in background

MOOD: Exciting, anticipation
COMPOSITION: Noor on left, title display on right

WORKSHOP: "${workshopData.titleAr}"`,
        videoPrompt: `Sora 2 - 15 SECOND ANIMATED SCENE:

${CHARACTER_DESCRIPTION}

SCENE: THEME REVEAL
[0:00-0:05] Noor gestures dramatically, title text animates in with sparkle effects
[0:05-0:10] Camera orbits slightly as Noor presents the theme with excitement
[0:10-0:15] Noor claps hands together, workshop materials float into view around the title

SETTING: Beautiful workshop room in cultural center
CAMERA: Dynamic movement, slight orbit around Noor and title
MOOD: Magical reveal, excitement building
STYLE: Pixar 3D, particle effects on title`,
        arabicScript: `ورشتنا اليوم هي: "${workshopData.titleAr}"! ورشة ممتعة جداً للأطفال من ${workshopData.ageGroup}`,
        duration: 15
    };
}

function generateActivityScene(
    activity: ActivityInfo,
    sceneNumber: number,
    totalActivities: number,
    workshopData: WorkshopExtract,
    hasRef: boolean
): VideoScene {
    const refNote = hasRef ? "[USE REFERENCE IMAGE FOR CHARACTER]" : "";
    const activityNumber = sceneNumber - 2; // Subtract welcome and theme scenes

    return {
        sceneNumber,
        sceneType: 'activity',
        title: `Activity ${activityNumber}`,
        titleAr: activity.title,
        description: `Noor presents activity: ${activity.title}`,
        imagePrompt: `${refNote}
Pixar 3D animated scene - ACTIVITY ${activityNumber}/${totalActivities}:

${CHARACTER_DESCRIPTION}

POSE: Noor is actively engaged in "${activity.title}", demonstrating the activity with enthusiasm.

ACTIVITY DETAILS:
- Activity: ${activity.title}
- Type: ${activity.type}
- Materials visible: ${activity.materials.join(", ") || "craft supplies"}

SETTING:
- Workshop table with colorful materials
- Other children's hands visible (diversity)
- Bright, cheerful atmosphere

MOOD: Fun, creative, engaged
COMPOSITION: Medium shot showing Noor and the activity

WORKSHOP: "${workshopData.titleAr}"`,
        videoPrompt: `Sora 2 - 15 SECOND ANIMATED SCENE:

${CHARACTER_DESCRIPTION}

SCENE: ACTIVITY ${activityNumber} - "${activity.title}"
[0:00-0:05] Noor picks up materials, shows them to camera with excitement
[0:05-0:10] Close-up of hands working on the activity, colorful materials
[0:10-0:15] Pull back to show Noor's proud smile, finished/in-progress work visible

MATERIALS: ${activity.materials.join(", ") || "craft supplies"}
CAMERA: Dynamic, close-ups of hands and materials, then pull back
MOOD: Creative, fun, accomplishment
STYLE: Pixar 3D, focus on textures and colors`,
        arabicScript: `والآن ننتقل إلى ${activity.title}! في هذا النشاط سنتعلم ${activity.description || "مهارات جديدة ورائعة"}`,
        duration: 15
    };
}

function generateLearningScene(workshopData: WorkshopExtract, hasRef: boolean): VideoScene {
    const refNote = hasRef ? "[USE REFERENCE IMAGE FOR CHARACTER]" : "";
    const objectives = workshopData.objectives.slice(0, 4);

    return {
        sceneNumber: workshopData.activities.length + 3,
        sceneType: 'learning',
        title: "Learning Outcomes",
        titleAr: "ماذا سنتعلم",
        description: "Noor presents what kids will learn",
        imagePrompt: `${refNote}
Pixar 3D animated scene - LEARNING OUTCOMES:

${CHARACTER_DESCRIPTION}

POSE: Noor counts on fingers, explaining learning outcomes. Thoughtful but excited expression.

LEARNING POINTS FLOATING:
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}

SETTING:
- Cozy corner of the workshop room
- Soft lighting, inspiring atmosphere
- Icons representing skills floating around

MOOD: Inspiring, educational, encouraging
COMPOSITION: Noor on left, learning points on right

WORKSHOP: "${workshopData.titleAr}"`,
        videoPrompt: `Sora 2 - 15 SECOND ANIMATED SCENE:

${CHARACTER_DESCRIPTION}

SCENE: LEARNING OUTCOMES
[0:00-0:05] Noor counts on fingers as text points animate in one by one
[0:05-0:10] Icons representing each skill orbit around Noor
[0:10-0:15] Noor nods confidently, gives thumbs up to camera

LEARNING POINTS:
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}

CAMERA: Medium shot with floating UI elements
MOOD: Inspiring, confident, achievable
STYLE: Pixar 3D, animated infographic elements`,
        arabicScript: `في هذه الورشة سنتعلم أشياء رائعة! ${objectives.map((obj, i) => `${i + 1}. ${obj}`).join("، ")}`,
        duration: 15
    };
}

function generateGoodbyeScene(workshopData: WorkshopExtract, hasRef: boolean): VideoScene {
    const refNote = hasRef ? "[USE REFERENCE IMAGE FOR CHARACTER]" : "";

    return {
        sceneNumber: workshopData.activities.length + 4,
        sceneType: 'goodbye',
        title: "Goodbye",
        titleAr: "الوداع",
        description: "Noor says goodbye and invites viewers",
        imagePrompt: `${refNote}
Pixar 3D animated scene - CLOSING:

${CHARACTER_DESCRIPTION}

POSE: Noor waves goodbye with both hands, biggest smile, slightly jumping with excitement.

SETTING:
- Back at the entrance of ${PRESENTER.location}
- Golden hour/sunset lighting
- Workshop creations visible in background
- Sparkles and confetti effects

TEXT OVERLAY SPACE: For "نراكم قريباً!" and contact info

MOOD: Happy, grateful, inviting
COMPOSITION: Full body shot, celebratory pose

WORKSHOP: "${workshopData.titleAr}"`,
        videoPrompt: `Sora 2 - 15 SECOND ANIMATED SCENE:

${CHARACTER_DESCRIPTION}

SCENE: GOODBYE
[0:00-0:05] Noor holds up a finished creation from the workshop, proud smile
[0:05-0:10] She waves goodbye with enthusiasm, slight jump
[0:10-0:15] Camera pulls back as sparkles and confetti appear, Noor waving

TEXT: Space for "نراكم قريباً في ${PRESENTER.location}!"
CAMERA: Start medium, pull back to wide, uplifting movement
MOOD: Celebratory, grateful, exciting
STYLE: Pixar 3D, particle effects, warm lighting`,
        arabicScript: `شكراً لمشاركتكم معنا! كانت ورشة رائعة. نراكم قريباً في ${PRESENTER.location}! مع السلامة!`,
        duration: 15
    };
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

interface ActivityInfo {
    title: string;
    type: string;
    description: string;
    materials: string[];
}

interface WorkshopExtract {
    titleAr: string;
    titleEn: string;
    activities: ActivityInfo[];
    objectives: string[];
    ageGroup: string;
    duration: string;
}

function extractWorkshopData(workshop: WorkshopPlanData): WorkshopExtract {
    // Extract activities from timeline
    // Filter out intro/closing activities which are typically first and last
    const activities: ActivityInfo[] = (workshop.timeline || [])
        .filter(act => {
            const type = String(act.activityType || act.blockType || '').toLowerCase();
            return !type.includes('intro') && !type.includes('closing') && !type.includes('opener');
        })
        .slice(0, 6) // Max 6 activities to keep video reasonable
        .map(act => ({
            title: act.title,
            type: String(act.activityType || act.blockType || "نشاط"),
            description: act.description || "",
            materials: act.whatYouNeed || []
        }));

    // Extract objectives
    const objectives = (workshop.learningObjectives || []).slice(0, 4);

    return {
        titleAr: workshop.title?.ar || "ورشة إبداعية",
        titleEn: workshop.title?.en || "Creative Workshop",
        activities,
        objectives,
        ageGroup: workshop.generalInfo?.ageGroup || "6-12 سنة",
        duration: workshop.generalInfo?.duration || "90 دقيقة"
    };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateVideoScript(
    workshop: WorkshopPlanData,
    options: ScriptGeneratorOptions = {}
): VideoScript {
    const { includeCharacter = true, hasReferenceImage = false } = options;
    const data = extractWorkshopData(workshop);
    const hasRef = includeCharacter && hasReferenceImage;

    const scenes: VideoScene[] = [];

    if (includeCharacter) {
        // Scene 1: Welcome
        scenes.push(generateWelcomeScene(data, hasRef));

        // Scene 2: Theme Reveal
        scenes.push(generateThemeScene(data, hasRef));

        // Scenes 3-N: Activities
        data.activities.forEach((activity, index) => {
            scenes.push(generateActivityScene(
                activity,
                index + 3,
                data.activities.length,
                data,
                hasRef
            ));
        });

        // Scene N+1: Learning Outcomes
        scenes.push({
            ...generateLearningScene(data, hasRef),
            sceneNumber: scenes.length + 1
        });

        // Scene N+2: Goodbye
        scenes.push({
            ...generateGoodbyeScene(data, hasRef),
            sceneNumber: scenes.length + 1
        });
    } else {
        // No character mode - focus on materials and activities only
        // Generate simplified scenes without Noor
        data.activities.forEach((activity, index) => {
            scenes.push({
                sceneNumber: index + 1,
                sceneType: 'activity',
                title: `Activity ${index + 1}`,
                titleAr: activity.title,
                description: activity.description,
                imagePrompt: `Pixar 3D style craft scene: ${activity.title}
Materials: ${activity.materials.join(", ")}
Close-up of hands working on creative activity
Bright colorful lighting, workshop setting`,
                videoPrompt: `Sora 2 - 15 SEC: Time-lapse of ${activity.title}
Materials transforming into finished creation
Colorful, magical, inspiring`,
                arabicScript: activity.title,
                duration: 15
            });
        });
    }

    const totalDuration = scenes.length * 15;
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;

    return {
        workshopTitle: data.titleAr,
        workshopTitleEn: data.titleEn,
        presenter: includeCharacter ? PRESENTER.name : "بدون شخصية",
        location: PRESENTER.location,
        totalScenes: scenes.length,
        totalDuration: minutes > 0
            ? `${minutes} دقيقة و ${seconds} ثانية (${scenes.length} مشاهد × 15 ثانية)`
            : `${seconds} ثانية (${scenes.length} مشاهد × 15 ثانية)`,
        scenes,
        summary: `فيديو عرض ورشة "${data.titleAr}" - ${scenes.length} مشاهد - ${data.duration} - للأطفال ${data.ageGroup}`
    };
}

// ============================================================================
// ENHANCEMENT SYSTEM PROMPT
// ============================================================================

export const SCRIPT_ENHANCEMENT_PROMPT = `You are an expert prompt engineer specializing in AI-generated video content for children's educational workshops.

Your task is to enhance scene prompts for:
1. Nanobanana (image generation) - Focus on visual details, composition, lighting
2. Sora 2 (video generation) - Focus on motion, camera movement, timing, transitions

CRITICAL RULES:
- Maintain CONSISTENT character appearance across ALL scenes
- If reference image is mentioned, add "[USE REFERENCE IMAGE]" at the start
- Keep the warm, welcoming, Pixar 3D style throughout
- Arabic text should be beautifully integrated, not overlaid
- Each scene is exactly 15 seconds

CHARACTER: Noor (نور)
- Consistent appearance in every scene
- Expressive, animated, welcoming personality
- Age-appropriate for presenting to children

LOCATION: دار ثقافة بن عروس (Ben Arous Cultural Center)
- Traditional Tunisian architecture
- Warm, inviting atmosphere
- Child-friendly workshop spaces

Enhance each prompt to be more vivid, specific, and technically detailed.
Return the same JSON structure with enhanced prompts.`;
