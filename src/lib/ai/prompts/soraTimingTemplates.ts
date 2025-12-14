/**
 * Sora 2 Timing Templates for 15-Second Video Segments
 * 
 * Precise beat structures for professional video generation:
 * - Frame-accurate timing breakdowns
 * - Phase-based action choreography
 * - Scene type templates
 * - Audio sync points
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TimingBeat {
    start: number;      // seconds
    end: number;        // seconds
    phase: string;      // phase name
    phaseAr: string;    // Arabic phase name
    description: string;
    priority: "essential" | "important" | "optional";
    audioSync?: string; // sync point for music/sound
}

export interface TimingTemplate {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    duration: 15;       // Always 15 seconds
    beats: TimingBeat[];
    bestFor: string[];
    emotion: string[];
}

// ============================================================================
// STANDARD TEMPLATES
// ============================================================================

/**
 * Standard 3-Act structure for most scenes
 * Setup → Action → Resolution
 */
export const TIMING_STANDARD: TimingTemplate = {
    id: "standard",
    name: "Standard 3-Act",
    nameAr: "بنية ثلاثية قياسية",
    description: "Classic setup-action-resolution structure",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 3,
            phase: "setup",
            phaseAr: "الإعداد",
            description: "Establish scene, subject enters or is revealed",
            priority: "essential",
            audioSync: "music_intro"
        },
        {
            start: 3,
            end: 10,
            phase: "main_action",
            phaseAr: "الحدث الرئيسي",
            description: "Primary action unfolds, character does main activity",
            priority: "essential",
            audioSync: "music_verse"
        },
        {
            start: 10,
            end: 13,
            phase: "peak",
            phaseAr: "الذروة",
            description: "Emotional peak, key moment, reaction shot",
            priority: "important",
            audioSync: "music_drop"
        },
        {
            start: 13,
            end: 15,
            phase: "resolution",
            phaseAr: "الختام",
            description: "Wrap up, transition pose, prepare for next scene",
            priority: "essential",
            audioSync: "music_outro"
        }
    ],
    bestFor: ["general", "workshop", "activity"],
    emotion: ["balanced", "building", "satisfying"]
};

/**
 * Hook-First structure for opening scenes
 * Impact → Develop → Transition
 */
export const TIMING_HOOK_FIRST: TimingTemplate = {
    id: "hook_first",
    name: "Hook First",
    nameAr: "جذب الانتباه أولاً",
    description: "Start with immediate impact to grab attention",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 2,
            phase: "hook",
            phaseAr: "الجذب",
            description: "Immediate visual impact, attention grab, dynamic entrance",
            priority: "essential",
            audioSync: "music_hit"
        },
        {
            start: 2,
            end: 5,
            phase: "context",
            phaseAr: "السياق",
            description: "Establish who, where, what - context reveal",
            priority: "essential"
        },
        {
            start: 5,
            end: 12,
            phase: "develop",
            phaseAr: "التطوير",
            description: "Develop the story, show curiosity/interest",
            priority: "essential",
            audioSync: "music_build"
        },
        {
            start: 12,
            end: 15,
            phase: "transition",
            phaseAr: "الانتقال",
            description: "Smooth transition pose, anticipation for next",
            priority: "important"
        }
    ],
    bestFor: ["opening", "intro", "attention_grab"],
    emotion: ["exciting", "curious", "inviting"]
};

/**
 * Build-Up structure for climactic scenes
 * Setup → Crescendo → Peak
 */
export const TIMING_BUILD_UP: TimingTemplate = {
    id: "build_up",
    name: "Build Up to Peak",
    nameAr: "التصاعد للذروة",
    description: "Gradual build to emotional peak",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 3,
            phase: "baseline",
            phaseAr: "الأساس",
            description: "Start calm, establish baseline energy",
            priority: "essential"
        },
        {
            start: 3,
            end: 7,
            phase: "building",
            phaseAr: "التصاعد",
            description: "Energy increases, excitement builds",
            priority: "essential",
            audioSync: "music_build"
        },
        {
            start: 7,
            end: 11,
            phase: "crescendo",
            phaseAr: "التصاعد الأقصى",
            description: "Maximum energy, everything coming together",
            priority: "essential",
            audioSync: "music_crescendo"
        },
        {
            start: 11,
            end: 15,
            phase: "peak_hold",
            phaseAr: "الذروة",
            description: "Peak moment sustained, celebration, triumph",
            priority: "essential",
            audioSync: "music_drop"
        }
    ],
    bestFor: ["celebration", "achievement", "climax"],
    emotion: ["exciting", "triumphant", "joyful"]
};

/**
 * Reveal structure for discovery scenes
 * Mystery → Build → Reveal
 */
export const TIMING_REVEAL: TimingTemplate = {
    id: "reveal",
    name: "Mystery to Reveal",
    nameAr: "من الغموض للكشف",
    description: "Build anticipation then reveal",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 4,
            phase: "mystery",
            phaseAr: "الغموض",
            description: "Tease, partial view, curiosity building",
            priority: "essential",
            audioSync: "music_tension"
        },
        {
            start: 4,
            end: 9,
            phase: "build_anticipation",
            phaseAr: "بناء التوقع",
            description: "More hints, excitement building, suspense",
            priority: "essential",
            audioSync: "music_build"
        },
        {
            start: 9,
            end: 12,
            phase: "reveal",
            phaseAr: "الكشف",
            description: "Full reveal moment, big show",
            priority: "essential",
            audioSync: "music_drop"
        },
        {
            start: 12,
            end: 15,
            phase: "reaction",
            phaseAr: "رد الفعل",
            description: "Character reaction, audience satisfaction",
            priority: "important"
        }
    ],
    bestFor: ["discovery", "learning", "aha_moment"],
    emotion: ["curious", "anticipating", "satisfied"]
};

/**
 * Continuous Action for activity scenes
 * Start → Flow → Finish
 */
export const TIMING_CONTINUOUS: TimingTemplate = {
    id: "continuous",
    name: "Continuous Flow",
    nameAr: "تدفق مستمر",
    description: "Smooth continuous action throughout",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 2,
            phase: "entry",
            phaseAr: "الدخول",
            description: "Smooth entry from previous scene or fade in",
            priority: "essential"
        },
        {
            start: 2,
            end: 13,
            phase: "continuous_action",
            phaseAr: "الحدث المستمر",
            description: "Unbroken, fluid action sequence",
            priority: "essential",
            audioSync: "music_rhythm"
        },
        {
            start: 13,
            end: 15,
            phase: "exit",
            phaseAr: "الخروج",
            description: "Smooth exit to next scene",
            priority: "essential"
        }
    ],
    bestFor: ["crafting", "creating", "process"],
    emotion: ["focused", "flowing", "smooth"]
};

/**
 * Ending/Farewell template
 * Approach → Connect → Farewell
 */
export const TIMING_FAREWELL: TimingTemplate = {
    id: "farewell",
    name: "Farewell Ending",
    nameAr: "ختام الوداع",
    description: "Warm closing with call to action",
    duration: 15,
    beats: [
        {
            start: 0,
            end: 4,
            phase: "approach",
            phaseAr: "الاقتراب",
            description: "Character approaches camera, warm demeanor",
            priority: "essential"
        },
        {
            start: 4,
            end: 9,
            phase: "connect",
            phaseAr: "التواصل",
            description: "Direct connection with audience, smile, gesture",
            priority: "essential",
            audioSync: "music_warm"
        },
        {
            start: 9,
            end: 12,
            phase: "farewell",
            phaseAr: "الوداع",
            description: "Wave, thumbs up, goodbye gesture",
            priority: "essential",
            audioSync: "music_ending"
        },
        {
            start: 12,
            end: 15,
            phase: "end_screen",
            phaseAr: "شاشة النهاية",
            description: "Text overlay, logo, call to action space",
            priority: "essential"
        }
    ],
    bestFor: ["ending", "goodbye", "conclusion"],
    emotion: ["warm", "inviting", "inspiring"]
};

// ============================================================================
// TEMPLATE COLLECTION
// ============================================================================

export const TIMING_TEMPLATES: Record<string, TimingTemplate> = {
    standard: TIMING_STANDARD,
    hook_first: TIMING_HOOK_FIRST,
    build_up: TIMING_BUILD_UP,
    reveal: TIMING_REVEAL,
    continuous: TIMING_CONTINUOUS,
    farewell: TIMING_FAREWELL
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the appropriate timing template for a scene type
 */
export function getTimingForSceneType(sceneType: string): TimingTemplate {
    const mapping: Record<string, keyof typeof TIMING_TEMPLATES> = {
        // Ad scenes
        "opening": "hook_first",
        "curiosity": "hook_first",
        "discovery": "reveal",
        "learning": "reveal",
        "action": "continuous",
        "creating": "continuous",
        "celebration": "build_up",
        "achievement": "build_up",

        // Workshop scenes
        "welcome": "hook_first",
        "theme": "reveal",
        "activity": "continuous",
        "goodbye": "farewell",

        // Default
        "default": "standard"
    };

    const templateKey = mapping[sceneType.toLowerCase()] || "standard";
    return TIMING_TEMPLATES[templateKey];
}

/**
 * Generate timing description for Sora prompt
 */
export function buildTimingBlock(template: TimingTemplate): string {
    const beatDescriptions = template.beats.map(beat => {
        const timeRange = `[${formatTime(beat.start)} - ${formatTime(beat.end)}]`;
        const audioHint = beat.audioSync ? ` (Audio: ${beat.audioSync})` : "";
        return `${timeRange} ${beat.phase.toUpperCase()}: ${beat.description}${audioHint}`;
    }).join("\n");

    return `
===== TIMING STRUCTURE: ${template.name} =====
Duration: 15 seconds | Template: ${template.nameAr}

${beatDescriptions}

Emotion Flow: ${template.emotion.join(" → ")}
`.trim();
}

/**
 * Format seconds to MM:SS string
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get beat at specific timestamp
 */
export function getBeatAtTime(template: TimingTemplate, timeSeconds: number): TimingBeat | null {
    return template.beats.find(beat =>
        timeSeconds >= beat.start && timeSeconds < beat.end
    ) || null;
}

/**
 * Generate scene-specific action choreography
 */
export function buildActionChoreography(
    template: TimingTemplate,
    character: string,
    activity: string
): string[] {
    return template.beats.map(beat => {
        switch (beat.phase) {
            case "hook":
            case "setup":
                return `${character} enters/appears, establishing presence`;
            case "main_action":
            case "continuous_action":
                return `${character} ${activity}`;
            case "peak":
            case "reveal":
                return `${character} shows emotional peak/reaction`;
            case "resolution":
            case "exit":
                return `${character} completes action, ready for transition`;
            default:
                return `${character} in ${beat.phase}`;
        }
    });
}
