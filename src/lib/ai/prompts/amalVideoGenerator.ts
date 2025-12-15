/**
 * Workshop Video Script Generator - Multi-Platform Support
 * 
 * Supports two platforms:
 * - Sora 2: 4 scenes × 15s, 16:9 landscape
 * - Veo 3.1 Fast: 6 scenes × 8s, 9:16 portrait
 * 
 * Generates:
 * 1. Nanobanana IMAGE prompts (to create scene images)
 * 2. Animation prompts (platform-specific)
 * 3. Arabic voiceover scripts
 */

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

export type VideoPlatform = 'sora2' | 'veo31fast';

export interface PlatformConfig {
    id: VideoPlatform;
    name: string;
    nameAr: string;
    duration: number;          // seconds per scene
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p';
    sceneCount: number;
    apiModel?: string;
    description: string;
    descriptionAr: string;
}

export const PLATFORM_CONFIGS: Record<VideoPlatform, PlatformConfig> = {
    sora2: {
        id: 'sora2',
        name: 'Sora 2',
        nameAr: 'سورا 2',
        duration: 15,
        aspectRatio: '9:16',
        resolution: '720p',
        sceneCount: 4,
        description: 'High-quality 15s scenes, portrait format',
        descriptionAr: 'جودة عالية، 15 ثانية لكل مشهد، صيغة عمودية'
    },
    veo31fast: {
        id: 'veo31fast',
        name: 'Veo 3.1 Fast',
        nameAr: 'فيو 3.1 سريع',
        duration: 8,
        aspectRatio: '9:16',
        resolution: '1080p',
        sceneCount: 5,
        apiModel: 'veo-3.1-fast',
        description: 'Fast 8s scenes, portrait format for mobile',
        descriptionAr: 'سريع، 8 ثانية لكل مشهد، صيغة عمودية للموبايل'
    }
};

// ============================================================================
// TYPES
// ============================================================================

// Extended scene types for Veo 2 (5 optimized scenes)
export type SceneType = 'hook' | 'welcome' | 'theme' | 'activity1' | 'activity2' | 'activities' | 'learning' | 'invitation';

export interface VideoScene {
    sceneNumber: number;
    sceneType: SceneType;
    titleAr: string;
    titleEn: string;
    duration: number;
    // Arabic voiceover script
    arabicScript: string;
    // Nanobanana image prompt (to create the scene image)
    imagePrompt: string;
    // Animation prompt (platform-specific)
    animationPrompt: string;
    // Legacy field for backward compatibility
    veoPrompt: string;
}

export interface VideoScriptOutput {
    workshopTitle: string;
    characterName: string;
    location: string;
    totalDuration: string;
    platform: VideoPlatform;
    platformConfig: PlatformConfig;
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
    visualDescription: "stylized 3D animated young girl character, light olive skin, warm brown eyes, black braided hair with colorful ribbons, purple sweater with star decorations, jeans, white sneakers, friendly smile, expressive face, age-appropriate design for children's educational content"
};

// Exported CHARACTERS for route compatibility
export const CHARACTERS: Record<string, Character> = {
    amal: DEFAULT_CHARACTER
};

const LOCATION = "دار الثقافة بن عروس";
const LOCATION_EN = "cultural center";

// ============================================================================
// EXPERT NANOBANANA IMAGE PROMPTS
// These create the scene images you'll use as Sora 2 references
// SORA SAFE: Avoids copyrighted style references (no Pixar/Disney mentions)
// ============================================================================

function generateImagePrompt(
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    workshop: WorkshopVideoInput,
    characterDesc: string
): string {
    // Expert Nanobanana prompt format - SORA SAFE
    // Note: Removed Pixar/Disney references to avoid third-party content flags

    const prompts = {
        welcome: `high-quality 3D animated style, ${characterDesc}, standing at colorful cultural center entrance, one hand raised waving hello, warm welcoming smile, background shows decorated archway with morning sunlight, warm golden lighting, medium shot centered composition, professional render, vibrant colors, 8k detailed, family-friendly educational content`,

        theme: `high-quality 3D animated style, ${characterDesc}, inside bright workshop room, excited expression with hands open presenting, eyes sparkling, surrounded by colorful art supplies and creative posters, natural window light, medium shot slightly off-center, magical wonder atmosphere, professional render, 8k detailed, family-friendly educational content`,

        activities: `high-quality 3D animated style, ${characterDesc}, at workshop table holding craft materials, engaged happy expression, giving thumbs up, table covered with ${workshop.activities.slice(0, 2).join(" and ")} supplies, organized shelves behind, bright studio lighting, medium shot with table visible, creative fun atmosphere, professional render, 8k detailed, family-friendly educational content`,

        invitation: `high-quality 3D animated style, ${characterDesc}, waving goodbye enthusiastically with both hands, biggest joyful smile, slight bouncy pose, standing at cultural center entrance, golden hour sunset lighting with warm glow, colorful confetti in air, full body shot centered, celebratory festive mood, professional render, 8k detailed, family-friendly educational content`
    };

    return prompts[sceneType];
}

// ============================================================================
// EXPERT SORA 2 ANIMATION PROMPTS  
// These animate your reference images - focus on MOTION not character
// ============================================================================

function generateAnimationPrompt(
    sceneType: 'welcome' | 'theme' | 'activities' | 'invitation',
    workshop: WorkshopVideoInput,
    arabicDialogue: string
): string {
    // Critical: Include Arabic dialogue for lip-sync matching
    // User will replace Sora's AI voice with their professional voiceover
    // Lips will match because both say the same Arabic text

    // SORA SAFE: Emphasize STYLIZED CARTOON (not realistic human) to avoid deepfake filters

    const baseStyle = `[CONTENT TYPE: Stylized animated cartoon character - NOT a realistic human]
[PURPOSE: Family-friendly educational content for children's cultural workshops]

[CHARACTER TYPE]
This is a STYLIZED CARTOON CHARACTER (like animated movies) - NOT a photorealistic human.
The character is a fictional, original animated mascot for educational videos.

[ANIMATION STYLE]
- Stylized 3D cartoon animation (exaggerated features, expressive animation)
- Bright, colorful, child-friendly aesthetic
- Cinema-quality rendering, smooth 24fps
- Duration: 15 seconds continuous motion

[DIALOGUE - CHARACTER SPEAKS THIS TEXT]
"${arabicDialogue}"

[LIP ANIMATION]
- Animate mouth movements to match the Arabic dialogue above
- Stylized cartoon lip-sync (not hyper-realistic)
- Natural Arabic speech rhythm, warm and friendly tone`;

    const prompts = {
        welcome: `${baseStyle}

MAINTAIN CHARACTER: Keep the cartoon character's design consistent with the reference image.

ANIMATION SEQUENCE:
[0-5 sec] Cartoon character walks into frame, waves arm, starts speaking the dialogue
[5-10 sec] Stops at center, clasps hands with excitement, continues speaking
[10-15 sec] Opens arms wide in welcome, finishes the dialogue

CAMERA: Wide to medium shot push-in
ANIMATION: Fluid cartoon movement, expressive gestures
LIGHTING: Warm, cheerful, soft shadows
RENDER: Stylized 3D cartoon quality, sharp details`,

        theme: `${baseStyle}

MAINTAIN CHARACTER: Keep the cartoon character's design consistent with the reference image.

ANIMATION SEQUENCE:
[0-5 sec] Cartoon character gestures dramatically, speaking excitedly
[5-10 sec] Points outward revealing theme, continues speaking
[10-15 sec] Claps hands with joy, sparkles appear, finishes dialogue

CAMERA: Medium shot, gentle orbit
ANIMATION: Smooth expressive cartoon gestures
LIGHTING: Bright, cheerful daylight
RENDER: Stylized 3D cartoon quality, consistent character design`,

        activities: `${baseStyle}

MAINTAIN CHARACTER: Keep the cartoon character's design consistent with the reference image.

ANIMATION SEQUENCE:
[0-5 sec] Cartoon character at table, counts on fingers while speaking
[5-10 sec] Picks up craft materials, shows to camera, continues speaking
[10-15 sec] Thumbs up gesture, finishes dialogue with happy smile

CAMERA: Medium shot, slight tracking
ANIMATION: Quick natural cartoon movements
LIGHTING: Bright studio lighting
RENDER: Stylized 3D cartoon quality, clear facial expressions`,

        invitation: `${baseStyle}

MAINTAIN CHARACTER: Keep the cartoon character's design consistent with the reference image.

ANIMATION SEQUENCE:
[0-5 sec] Cartoon character holds up craft creation, starts farewell message
[5-10 sec] Waves goodbye with both hands, continues speaking
[10-15 sec] Keeps waving as camera pulls back, confetti appears, finishes dialogue

CAMERA: Medium to wide shot pull-back
ANIMATION: Energetic waving, bouncy cartoon jump
LIGHTING: Golden hour warm tones
RENDER: Stylized 3D cartoon quality, beautiful lighting`
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
    // Generate Arabic script first - this is what the character will speak
    const arabicScript = generateArabicScript(sceneType, workshop, characterName);
    // Pass the Arabic script to animation prompt for lip-sync matching
    const animationPrompt = generateAnimationPrompt(sceneType, workshop, arabicScript);

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
// MAIN GENERATOR - MULTI-PLATFORM
// ============================================================================

export function generateWorkshopVideo(
    workshop: WorkshopVideoInput,
    options: {
        platform?: VideoPlatform;
        characterId?: string;
        characterName?: string;
        characterDescription?: string;
        hasReferenceImage?: boolean;
    } = {}
): VideoScriptOutput {
    const platform = options.platform || 'sora2';
    const platformConfig = PLATFORM_CONFIGS[platform];

    // Use custom character or default
    const character = options.characterId ? CHARACTERS[options.characterId] || DEFAULT_CHARACTER : DEFAULT_CHARACTER;
    const characterName = options.characterName || workshop.characterName || character.nameAr;
    const characterDesc = options.characterDescription || workshop.characterDescription || character.visualDescription;

    // Generate scenes based on platform
    let scenes: VideoScene[];

    if (platform === 'veo31fast') {
        // Veo 3.1 Fast: 6 scenes × 8 seconds, portrait format
        scenes = generateVeo31Scenes(workshop, characterName, characterDesc);
    } else {
        // Sora 2: 4 scenes × 15 seconds, landscape format
        scenes = generateSora2Scenes(workshop, characterName, characterDesc);
    }

    const totalSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);

    return {
        workshopTitle: workshop.titleAr,
        characterName,
        location: LOCATION,
        totalDuration: `${totalSeconds} ثانية (${scenes.length} مشاهد × ${platformConfig.duration} ثانية)`,
        platform,
        platformConfig,
        scenes,
    };
}

// Sora 2 scenes (original 4 scenes × 15s)
function generateSora2Scenes(
    workshop: WorkshopVideoInput,
    characterName: string,
    characterDesc: string
): VideoScene[] {
    return [
        generateScene(1, 'welcome', 'الترحيب', 'Welcome', workshop, characterName, characterDesc),
        generateScene(2, 'theme', 'موضوع الورشة', 'Workshop Theme', workshop, characterName, characterDesc),
        generateScene(3, 'activities', 'ماذا سنفعل', 'Activities', workshop, characterName, characterDesc),
        generateScene(4, 'invitation', 'الدعوة', 'Invitation', workshop, characterName, characterDesc),
    ];
}

// Veo 2 scenes (5 optimized scenes × 8s, portrait format, longer dialogues)
function generateVeo31Scenes(
    workshop: WorkshopVideoInput,
    characterName: string,
    characterDesc: string
): VideoScene[] {
    const activity1 = workshop.activities[0] || 'أنشطة إبداعية';
    const activity2 = workshop.activities[1] || 'ألعاب تعليمية';

    return [
        // Scene 1: Hook + Welcome (combined for impact)
        generateVeoScene(1, 'hook', 'الترحيب والجذب', 'Hook & Welcome',
            `مرحباً يا أصدقاء! أنا ${characterName} من ${LOCATION}! عندنا ورشة رائعة جداً قريباً وأنتم مدعوون!`,
            workshop, characterName, characterDesc),

        // Scene 2: Theme Reveal
        generateVeoScene(2, 'theme', 'موضوع الورشة', 'Theme Reveal',
            `ورشتنا اليوم هي "${workshop.titleAr}"! ورشة ممتعة ومفيدة للأطفال من ${workshop.ageGroup}!`,
            workshop, characterName, characterDesc),

        // Scene 3: Activities Preview
        generateVeoScene(3, 'activities', 'الأنشطة', 'Activities',
            `سنتعلم أشياء رائعة معاً! مثل ${activity1} و${activity2}! كل هذا بطريقة ممتعة وتفاعلية!`,
            workshop, characterName, characterDesc),

        // Scene 4: Learning Benefits (NEW)
        generateVeoScene(4, 'learning', 'الفوائد التعليمية', 'Learning Benefits',
            `سنكتسب مهارات جديدة كالإبداع والتعاون والثقة بالنفس! تجربة لا تُنسى للأطفال!`,
            workshop, characterName, characterDesc),

        // Scene 5: Call to Action
        generateVeoScene(5, 'invitation', 'الدعوة للمشاركة', 'Call to Action',
            `انضموا إلينا في ${LOCATION}! سجلوا أطفالكم الآن! نراكم قريباً يا أصدقاء!`,
            workshop, characterName, characterDesc),
    ];
}

// Veo 3.1 scene generator (8 seconds, portrait 9:16)
function generateVeoScene(
    sceneNumber: number,
    sceneType: SceneType,
    titleAr: string,
    titleEn: string,
    arabicScript: string,
    workshop: WorkshopVideoInput,
    characterName: string,
    characterDesc: string
): VideoScene {
    const imagePrompt = generateVeoImagePrompt(sceneType, workshop, characterDesc);
    const animationPrompt = generateVeoAnimationPrompt(sceneType, arabicScript);

    return {
        sceneNumber,
        sceneType,
        titleAr,
        titleEn,
        duration: 10,  // Sora API accepts 10, 15, 25
        arabicScript,
        imagePrompt,
        animationPrompt,
        veoPrompt: animationPrompt
    };
}

// Veo 3.1 image prompts (portrait 9:16 composition)
function generateVeoImagePrompt(
    sceneType: SceneType,
    workshop: WorkshopVideoInput,
    characterDesc: string
): string {
    const basePrompt = `high-quality 3D animated style, vertical portrait composition 9:16, ${characterDesc}`;

    const prompts: Record<SceneType, string> = {
        hook: `${basePrompt}, close-up face shot, excited expression, hand near face waving, colorful background, mobile-optimized, family-friendly`,
        welcome: `${basePrompt}, upper body shot, welcoming gesture, cultural center entrance visible behind, warm lighting, mobile-optimized`,
        theme: `${basePrompt}, medium shot, hands presenting outward, workshop title area at top, creative materials floating, mobile-optimized`,
        activity1: `${basePrompt}, showing craft materials, engaged expression, table with supplies visible, bright colors, mobile-optimized`,
        activity2: `${basePrompt}, demonstrating activity, thumbs up gesture, colorful workshop environment, mobile-optimized`,
        activities: `${basePrompt}, at workshop table with ${workshop.activities[0] || 'crafts'}, engaged expression, mobile-optimized`,
        learning: `${basePrompt}, pointing to head (learning gesture), surrounded by floating skill icons (creativity, teamwork), inspiring background, mobile-optimized`,
        invitation: `${basePrompt}, full energy wave goodbye, confetti effect, sunset warm lighting, exciting farewell, mobile-optimized`
    };

    return prompts[sceneType] || basePrompt;
}

// Veo 3.1 animation prompts (8 seconds, portrait, fast-paced)
function generateVeoAnimationPrompt(sceneType: SceneType, arabicScript: string): string {
    const baseStyle = `[CONTENT TYPE: Stylized animated cartoon character - NOT a realistic human]
[FORMAT: Portrait 9:16, 8 seconds, mobile-optimized for social media]

[CHARACTER TYPE]
STYLIZED CARTOON CHARACTER - fictional animated mascot for children's educational videos.

[DIALOGUE - SHORT (8 SECONDS)]
"${arabicScript}"

[LIP ANIMATION]
- Stylized cartoon lip-sync matching the short dialogue
- Quick, energetic pacing for mobile viewing`;

    const scenePrompts: Record<SceneType, string> = {
        hook: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character pops into frame from bottom, waves excitedly
[3-6 sec] Close-up on face, speaks greeting with big smile
[6-8 sec] Beckoning gesture inviting viewer

CAMERA: Close-up portrait, slight zoom in
STYLE: Energetic, attention-grabbing, fast cuts`,

        welcome: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character gestures welcome with open arms
[3-6 sec] Points behind to location, speaks warmly
[6-8 sec] Encouraging nod, clasps hands

CAMERA: Upper body portrait shot, gentle movement
STYLE: Warm, welcoming, inviting`,

        theme: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character raises arms announcing theme
[3-6 sec] Title appears above, character presents it
[6-8 sec] Excited reaction, clapping

CAMERA: Medium portrait shot, title overlay area at top
STYLE: Dramatic reveal, sparkle effects`,

        activity1: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character picks up craft material
[3-6 sec] Shows it to camera while speaking
[6-8 sec] Thumbs up gesture

CAMERA: Close on hands and face, vertical framing
STYLE: Creative, fun, engaging`,

        activity2: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character demonstrates activity
[3-6 sec] Proud expression showing result
[6-8 sec] Encouraging gesture to viewer

CAMERA: Medium portrait, focus on action
STYLE: Active, educational, encouraging`,

        activities: `${baseStyle}

ANIMATION (8 SEC):
[0-4 sec] Character at table with craft materials
[4-8 sec] Shows activity, speaks with enthusiasm

CAMERA: Medium portrait shot
STYLE: Creative, colorful, educational`,

        learning: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character points to head, thinking gesture
[3-6 sec] Counts on fingers showing benefits, speaks proudly
[6-8 sec] Arms wide showing growth, confident smile

CAMERA: Upper body portrait, gentle zoom
STYLE: Inspiring, educational, motivational`,

        invitation: `${baseStyle}

ANIMATION (8 SEC):
[0-3 sec] Character waves energetically
[3-6 sec] Jumps with excitement, confetti appears
[6-8 sec] Final big wave, blows kiss goodbye

CAMERA: Full body portrait, pull back with confetti
STYLE: Celebratory, exciting, memorable farewell`
    };

    return scenePrompts[sceneType] || baseStyle;
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
