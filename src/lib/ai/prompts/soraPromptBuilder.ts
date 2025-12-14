/**
 * Sora 2 Expert Prompt Builder
 * 
 * Main generator that combines all components into structured JSON prompts:
 * - Cinematography library for camera work
 * - Timing templates for 15-second structure
 * - Character consistency
 * - Scene continuity
 * 
 * Outputs both JSON (API-ready) and human-readable formats
 */

import {
    CAMERA_MOVEMENTS,
    SHOT_TYPES,
    MOVEMENT_SPEEDS,
    LIGHTING_SETUPS,
    TRANSITIONS,
    buildSoraCameraBlock,
    type CameraMovement,
    type ShotType,
    type MovementSpeed,
    type LightingSetup
} from "./cinematographyLibrary";

import {
    TIMING_TEMPLATES,
    getTimingForSceneType,
    buildTimingBlock,
    type TimingTemplate,
    type TimingBeat
} from "./soraTimingTemplates";

// ============================================================================
// TYPES - JSON SCHEMA
// ============================================================================

export interface SoraCharacter {
    name: string;
    nameAr: string;
    description: string;
    appearance: {
        age: string;
        ethnicity: string;
        hair: string;
        outfit: string;
        accessories: string[];
    };
    personality: string[];
}

export interface SoraCameraConfig {
    movement: string;
    movementDescription: string;
    speed: string;
    startShot: string;
    startShotDescription: string;
    endShot: string;
    endShotDescription: string;
    focusSubject: string;
}

export interface SoraEnvironment {
    location: string;
    locationAr: string;
    lighting: string;
    lightingDescription: string;
    keyProps: string[];
    atmosphere: string[];
    style: string;
}

export interface SoraAudio {
    musicStyle: string;
    syncPoints: Array<{
        time: number;
        event: string;
    }>;
    ambientSounds: string[];
}

export interface SoraTechnical {
    style: string;
    resolution: string;
    frameRate: number;
    colorGrading: string;
    renderQuality: string;
}

export interface SoraContinuity {
    previousSceneId: number | null;
    nextSceneId: number | null;
    transitionIn: string;
    transitionOut: string;
    continuityNotes: string;
}

export interface SoraPromptJSON {
    segment: {
        id: number;
        duration: 15;
        title: string;
        titleAr: string;
        sceneType: string;

        timing: {
            templateId: string;
            templateName: string;
            beats: Array<{
                start: number;
                end: number;
                phase: string;
                action: string;
            }>;
        };

        camera: SoraCameraConfig;
        character: SoraCharacter | null;
        environment: SoraEnvironment;
        audio: SoraAudio;
        technical: SoraTechnical;
        continuity: SoraContinuity;
    };
}

export interface SoraPromptOutput {
    json: SoraPromptJSON;
    humanReadable: string;
    apiReady: string;
}

// ============================================================================
// DEFAULT CHARACTER - NOOR
// ============================================================================

export const CHARACTER_NOOR: SoraCharacter = {
    name: "Noor",
    nameAr: "نور",
    description: "8-year-old Tunisian girl, Pixar-style 3D animated character",
    appearance: {
        age: "8 years old",
        ethnicity: "Middle Eastern / North African (Tunisian)",
        hair: "Black ponytail with bright purple ribbon",
        outfit: "Purple t-shirt with small white star design, blue jeans, white sneakers",
        accessories: ["purple hair ribbon"]
    },
    personality: ["curious", "creative", "confident", "joyful", "inspiring"]
};

// ============================================================================
// DEFAULT ENVIRONMENT - WORKSHOP
// ============================================================================

export const ENVIRONMENT_WORKSHOP: SoraEnvironment = {
    location: "Kids Workshop Room at Cultural Center",
    locationAr: "غرفة ورشة الأطفال - دار الثقافة بن عروس",
    lighting: "natural_warm",
    lightingDescription: LIGHTING_SETUPS.natural_warm.soraDescription,
    keyProps: [
        "colorful craft materials",
        "traditional Tunisian cushions",
        "wooden tables",
        "art supplies",
        "decorated walls with children's artwork"
    ],
    atmosphere: ["warm", "inviting", "child-friendly", "creative", "inspiring"],
    style: "Pixar/Disney 3D animation, cinema quality"
};

// ============================================================================
// SCENE TYPE CONFIGURATIONS
// ============================================================================

interface SceneConfig {
    camera: {
        movement: keyof typeof CAMERA_MOVEMENTS;
        speed: keyof typeof MOVEMENT_SPEEDS;
        startShot: keyof typeof SHOT_TYPES;
        endShot: keyof typeof SHOT_TYPES;
    };
    timing: keyof typeof TIMING_TEMPLATES;
    transition: keyof typeof TRANSITIONS;
    focusSubject: string;
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
    opening: {
        camera: {
            movement: "push_in",
            speed: "slow",
            startShot: "wide_shot",
            endShot: "medium_shot"
        },
        timing: "hook_first",
        transition: "fade_black",
        focusSubject: "character_entering"
    },
    discovery: {
        camera: {
            movement: "orbit_cw",
            speed: "slow",
            startShot: "medium_shot",
            endShot: "close_up"
        },
        timing: "reveal",
        transition: "motion_match",
        focusSubject: "character_learning"
    },
    action: {
        camera: {
            movement: "tracking_follow",
            speed: "medium",
            startShot: "medium_shot",
            endShot: "medium_close_up"
        },
        timing: "continuous",
        transition: "motion_match",
        focusSubject: "character_hands_work"
    },
    celebration: {
        camera: {
            movement: "crane_up",
            speed: "slow",
            startShot: "medium_shot",
            endShot: "full_shot"
        },
        timing: "build_up",
        transition: "cross_dissolve",
        focusSubject: "character_triumph"
    },
    goodbye: {
        camera: {
            movement: "pull_back",
            speed: "slow",
            startShot: "close_up",
            endShot: "wide_shot"
        },
        timing: "farewell",
        transition: "fade_black",
        focusSubject: "character_wave"
    }
};

// ============================================================================
// BUILDER CLASS
// ============================================================================

export interface BuilderOptions {
    includeCharacter?: boolean;
    character?: SoraCharacter;
    environment?: Partial<SoraEnvironment>;
    sceneNumber: number;
    totalScenes: number;
    sceneType: string;
    activity: string;
    materials: string[];
    workshopTitle: string;
    workshopTitleAr: string;
}

export class SoraPromptBuilder {
    private options: BuilderOptions;
    private config: SceneConfig;
    private timing: TimingTemplate;

    constructor(options: BuilderOptions) {
        this.options = {
            includeCharacter: true,
            character: CHARACTER_NOOR,
            ...options
        };

        // Get scene configuration
        this.config = SCENE_CONFIGS[options.sceneType] || SCENE_CONFIGS.action;
        this.timing = getTimingForSceneType(options.sceneType);
    }

    /**
     * Build complete JSON structure
     */
    buildJSON(): SoraPromptJSON {
        const { options, config, timing } = this;
        const cam = config.camera;

        return {
            segment: {
                id: options.sceneNumber,
                duration: 15,
                title: this.getSceneTitle(),
                titleAr: this.getSceneTitleAr(),
                sceneType: options.sceneType,

                timing: {
                    templateId: timing.id,
                    templateName: timing.name,
                    beats: timing.beats.map(beat => ({
                        start: beat.start,
                        end: beat.end,
                        phase: beat.phase,
                        action: this.getActionForBeat(beat)
                    }))
                },

                camera: {
                    movement: cam.movement,
                    movementDescription: CAMERA_MOVEMENTS[cam.movement].soraDescription,
                    speed: cam.speed,
                    startShot: cam.startShot,
                    startShotDescription: SHOT_TYPES[cam.startShot].soraDescription,
                    endShot: cam.endShot,
                    endShotDescription: SHOT_TYPES[cam.endShot].soraDescription,
                    focusSubject: config.focusSubject
                },

                character: options.includeCharacter ? options.character! : null,

                environment: {
                    ...ENVIRONMENT_WORKSHOP,
                    ...options.environment,
                    keyProps: [...ENVIRONMENT_WORKSHOP.keyProps, ...options.materials.slice(0, 3)]
                },

                audio: {
                    musicStyle: "upbeat, inspiring, child-friendly",
                    syncPoints: timing.beats
                        .filter(b => b.audioSync)
                        .map(b => ({ time: b.start, event: b.audioSync! })),
                    ambientSounds: ["gentle workshop ambiance", "soft child-like sounds"]
                },

                technical: {
                    style: "Pixar 3D animation, cinema quality",
                    resolution: "4K (3840x2160)",
                    frameRate: 24,
                    colorGrading: "warm, saturated, vibrant",
                    renderQuality: "high detail, soft shadows"
                },

                continuity: {
                    previousSceneId: options.sceneNumber > 1 ? options.sceneNumber - 1 : null,
                    nextSceneId: options.sceneNumber < options.totalScenes ? options.sceneNumber + 1 : null,
                    transitionIn: options.sceneNumber === 1 ? "fade_black" : "motion_match",
                    transitionOut: options.sceneNumber === options.totalScenes ? "fade_black" : "motion_match",
                    continuityNotes: this.getContinuityNote()
                }
            }
        };
    }

    /**
     * Build human-readable prompt for Sora 2
     */
    buildHumanReadable(): string {
        const json = this.buildJSON();
        const seg = json.segment;
        const char = seg.character;
        const { options } = this;

        let prompt = `Sora 2 - 15-SECOND ANIMATED SCENE (${seg.id}/${options.totalScenes})

===== SCENE: ${seg.title} | ${seg.titleAr} =====

`;

        // Character block
        if (char) {
            prompt += `===== CHARACTER =====
${char.name} (${char.nameAr}) - CONSISTENT across ALL scenes:
- ${char.appearance.age}, ${char.appearance.ethnicity}
- ${char.appearance.hair}
- ${char.appearance.outfit}
- Personality: ${char.personality.join(", ")}

`;
        } else {
            prompt += `===== FOCUS: MATERIALS & ACTIVITY (No Character) =====

`;
        }

        // Timing block
        prompt += `===== TIMING STRUCTURE: ${seg.timing.templateName} =====
`;
        seg.timing.beats.forEach(beat => {
            prompt += `[${this.formatTime(beat.start)} - ${this.formatTime(beat.end)}] ${beat.phase.toUpperCase()}
- ${beat.action}
`;
        });

        // Camera block
        prompt += `
===== CAMERA WORK =====
Movement: ${seg.camera.movement.replace(/_/g, " ")}
- ${seg.camera.movementDescription}
Speed: ${seg.camera.speed}
Start Frame: ${seg.camera.startShot.replace(/_/g, " ")} - ${seg.camera.startShotDescription}
End Frame: ${seg.camera.endShot.replace(/_/g, " ")} - ${seg.camera.endShotDescription}
Focus: ${seg.camera.focusSubject.replace(/_/g, " ")}

`;

        // Environment
        prompt += `===== ENVIRONMENT =====
Location: ${seg.environment.locationAr}
Lighting: ${seg.environment.lightingDescription}
Key Props: ${seg.environment.keyProps.join(", ")}
Atmosphere: ${seg.environment.atmosphere.join(", ")}

`;

        // Technical
        prompt += `===== TECHNICAL =====
Style: ${seg.technical.style}
Resolution: ${seg.technical.resolution}
Frame Rate: ${seg.technical.frameRate}fps
Color Grading: ${seg.technical.colorGrading}

`;

        // Audio sync hints
        if (seg.audio.syncPoints.length > 0) {
            prompt += `===== AUDIO SYNC HINTS =====
`;
            seg.audio.syncPoints.forEach(sp => {
                prompt += `- ${this.formatTime(sp.time)}: ${sp.event}
`;
            });
            prompt += `
`;
        }

        // Continuity
        prompt += `===== CONTINUITY =====
${seg.continuity.continuityNotes}
Transition In: ${seg.continuity.transitionIn.replace(/_/g, " ")}
Transition Out: ${seg.continuity.transitionOut.replace(/_/g, " ")}

`;

        // Workshop title for final scene
        if (seg.id === options.totalScenes) {
            prompt += `===== END SCREEN =====
Text Overlay: "${options.workshopTitleAr}"
Add sparkle/confetti effects around text
`;
        }

        return prompt.trim();
    }

    /**
     * Build API-ready compact format
     */
    buildAPIReady(): string {
        const json = this.buildJSON();
        const seg = json.segment;
        const char = seg.character;
        const { options } = this;

        // Compact cinematographic description
        const charDesc = char
            ? `${char.name}, ${char.appearance.age} ${char.appearance.ethnicity} girl, ${char.appearance.hair}, ${char.appearance.outfit}`
            : "Focus on materials and activity";

        const actionDesc = seg.timing.beats.map(b =>
            `[${b.start}-${b.end}s] ${b.action}`
        ).join(". ");

        return `Cinematic Pixar 3D animated scene, 15 seconds, ${seg.technical.frameRate}fps:

Scene ${seg.id}/${options.totalScenes} - ${seg.titleAr}

Character: ${charDesc}

Action: ${actionDesc}

Camera: ${seg.camera.speed} ${seg.camera.movementDescription}. From ${seg.camera.startShotDescription} to ${seg.camera.endShotDescription}.

Environment: ${seg.environment.locationAr}. ${seg.environment.lightingDescription}. Props: ${seg.environment.keyProps.slice(0, 4).join(", ")}.

Style: ${seg.technical.style}, ${seg.technical.colorGrading}.

${seg.id === options.totalScenes ? `End with text overlay: "${options.workshopTitleAr}" with sparkle effects.` : `Smooth ${seg.continuity.transitionOut} transition to next scene.`}`;
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private getSceneTitle(): string {
        const titles: Record<string, string> = {
            opening: "Opening - Curiosity",
            discovery: "Discovery - Learning",
            action: "Action - Creating",
            celebration: "Celebration - Achievement",
            goodbye: "Goodbye - See You Soon"
        };
        return titles[this.options.sceneType] || `Scene ${this.options.sceneNumber}`;
    }

    private getSceneTitleAr(): string {
        const titles: Record<string, string> = {
            opening: "المقدمة - الفضول",
            discovery: "الاكتشاف - التعلم",
            action: "العمل - الإبداع",
            celebration: "الاحتفال - الإنجاز",
            goodbye: "الوداع - إلى اللقاء"
        };
        return titles[this.options.sceneType] || `المشهد ${this.options.sceneNumber}`;
    }

    private getActionForBeat(beat: TimingBeat): string {
        const { options } = this;
        const char = options.character?.name || "Subject";
        const activity = options.activity;

        const actions: Record<string, string> = {
            // Hook/Opening phases
            hook: `${char} enters scene with dynamic energy, attention-grabbing pose`,
            setup: `${char} appears in workshop, looking curious and excited`,
            context: `Camera reveals ${char} in colorful workshop environment`,

            // Main action phases
            main_action: `${char} actively engaged in ${activity}, focused expression`,
            continuous_action: `${char} working on ${activity}, hands moving skillfully`,
            develop: `${char} concentrating on ${activity}, building momentum`,
            building: `${char}'s excitement grows while doing ${activity}`,

            // Discovery phases
            mystery: `Partial view of ${activity}, building curiosity`,
            build_anticipation: `${char} working toward a breakthrough`,
            reveal: `${char} has "aha!" moment, eyes light up with understanding`,

            // Peak phases
            peak: `${char}'s emotional peak - biggest reaction to achievement`,
            crescendo: `Maximum energy as ${char} nears completion`,
            peak_hold: `${char} holds triumphant pose, pure joy`,

            // Closing phases
            resolution: `${char} smoothly transitions, satisfied expression`,
            reaction: `${char} shows pride in completed work`,
            exit: `${char} poses for smooth transition to next scene`,

            // Farewell phases
            approach: `${char} turns toward camera with warm smile`,
            connect: `${char} makes eye contact, friendly gesture`,
            farewell: `${char} waves goodbye, thumbs up to camera`,
            end_screen: `${char} poses while title text fades in`,

            // Baseline
            baseline: `${char} calm, ready to begin ${activity}`,
            entry: `Smooth continuation from previous scene`
        };

        return actions[beat.phase] || `${char} in ${beat.phase} phase`;
    }

    private getContinuityNote(): string {
        const { options } = this;
        const isFirst = options.sceneNumber === 1;
        const isLast = options.sceneNumber === options.totalScenes;

        if (isFirst) {
            return "Opening scene - establish character and setting. End pose should flow into next scene.";
        } else if (isLast) {
            return "Final scene - triumphant ending with workshop title overlay. Character looks at camera.";
        } else {
            return `Scene ${options.sceneNumber} of ${options.totalScenes}. Maintain character consistency. Start and end poses should match transitions.`;
        }
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Quick build function for generating Sora prompts
 */
export function buildSoraPrompt(options: BuilderOptions): SoraPromptOutput {
    const builder = new SoraPromptBuilder(options);
    return {
        json: builder.buildJSON(),
        humanReadable: builder.buildHumanReadable(),
        apiReady: builder.buildAPIReady()
    };
}

/**
 * Generate prompts for all 4 ad scenes
 */
export function buildAdScenePrompts(workshop: {
    titleAr: string;
    titleEn: string;
    activity: string;
    materials: string[];
}, includeCharacter: boolean = true): SoraPromptOutput[] {
    const sceneTypes = ["opening", "discovery", "action", "celebration"];

    return sceneTypes.map((sceneType, index) => {
        return buildSoraPrompt({
            sceneNumber: index + 1,
            totalScenes: 4,
            sceneType,
            activity: workshop.activity,
            materials: workshop.materials,
            workshopTitle: workshop.titleEn,
            workshopTitleAr: workshop.titleAr,
            includeCharacter,
            character: includeCharacter ? CHARACTER_NOOR : undefined
        });
    });
}
