/**
 * Cinematography Library for Sora 2 Video Prompts
 * 
 * Expert-level vocabulary for professional video generation:
 * - Camera movements with precise descriptions
 * - Shot types with framing details
 * - Movement speeds and pacing
 * - Transition types between scenes
 * - Lighting setups
 */

// ============================================================================
// CAMERA MOVEMENTS
// ============================================================================

export interface CameraMovement {
    id: string;
    name: string;
    nameAr: string;
    soraDescription: string;
    bestFor: string[];
    durationRange: { min: number; max: number }; // seconds
}

export const CAMERA_MOVEMENTS: Record<string, CameraMovement> = {
    // Dolly movements (physical camera movement)
    push_in: {
        id: "push_in",
        name: "Push In / Dolly In",
        nameAr: "اقتراب تدريجي",
        soraDescription: "Camera slowly moves forward toward subject, closing distance smoothly",
        bestFor: ["building_intimacy", "emphasizing_detail", "emotional_moment"],
        durationRange: { min: 3, max: 8 }
    },
    pull_back: {
        id: "pull_back",
        name: "Pull Back / Dolly Out",
        nameAr: "ابتعاد تدريجي",
        soraDescription: "Camera steadily retreats from subject, revealing environment context",
        bestFor: ["reveal_environment", "ending_scene", "showing_scale"],
        durationRange: { min: 3, max: 10 }
    },
    tracking_follow: {
        id: "tracking_follow",
        name: "Tracking Shot / Follow",
        nameAr: "متابعة الحركة",
        soraDescription: "Camera moves physically, following subject movement, maintaining consistent distance",
        bestFor: ["action_sequence", "walking", "dynamic_movement"],
        durationRange: { min: 5, max: 15 }
    },

    // Pan movements (horizontal rotation)
    pan_left: {
        id: "pan_left",
        name: "Pan Left",
        nameAr: "تحريك يسار",
        soraDescription: "Camera rotates horizontally from right to left from fixed position",
        bestFor: ["scanning_environment", "following_movement", "reveal"],
        durationRange: { min: 2, max: 6 }
    },
    pan_right: {
        id: "pan_right",
        name: "Pan Right",
        nameAr: "تحريك يمين",
        soraDescription: "Camera rotates horizontally from left to right from fixed position",
        bestFor: ["scanning_environment", "following_movement", "reveal"],
        durationRange: { min: 2, max: 6 }
    },

    // Tilt movements (vertical rotation)
    tilt_up: {
        id: "tilt_up",
        name: "Tilt Up",
        nameAr: "رفع الكاميرا",
        soraDescription: "Camera tilts upward from fixed position, revealing height",
        bestFor: ["reveal_height", "majestic_moment", "showing_reaction"],
        durationRange: { min: 2, max: 5 }
    },
    tilt_down: {
        id: "tilt_down",
        name: "Tilt Down",
        nameAr: "خفض الكاميرا",
        soraDescription: "Camera tilts downward from fixed position, focusing on details below",
        bestFor: ["showing_hands", "detail_reveal", "grounding_shot"],
        durationRange: { min: 2, max: 5 }
    },

    // Orbital movements
    orbit_cw: {
        id: "orbit_cw",
        name: "Orbit Clockwise",
        nameAr: "دوران حول الموضوع",
        soraDescription: "Camera arcs clockwise around stationary subject, 360-degree coverage",
        bestFor: ["hero_moment", "showcase", "dramatic_reveal"],
        durationRange: { min: 5, max: 12 }
    },
    orbit_ccw: {
        id: "orbit_ccw",
        name: "Orbit Counter-Clockwise",
        nameAr: "دوران عكسي",
        soraDescription: "Camera arcs counter-clockwise around stationary subject",
        bestFor: ["hero_moment", "showcase", "dramatic_reveal"],
        durationRange: { min: 5, max: 12 }
    },

    // Crane/Jib movements
    crane_up: {
        id: "crane_up",
        name: "Crane Up",
        nameAr: "رفع عمودي",
        soraDescription: "Camera rises vertically while maintaining angle, birds-eye reveal",
        bestFor: ["establishing_shot", "emotional_peak", "ending"],
        durationRange: { min: 4, max: 10 }
    },
    crane_down: {
        id: "crane_down",
        name: "Crane Down",
        nameAr: "نزول عمودي",
        soraDescription: "Camera descends vertically into scene, grounding viewer",
        bestFor: ["opening_shot", "approaching_subject", "intimate_reveal"],
        durationRange: { min: 4, max: 10 }
    },

    // Zoom (lens-based)
    zoom_in: {
        id: "zoom_in",
        name: "Zoom In",
        nameAr: "تقريب",
        soraDescription: "Lens magnifies subject without camera movement, flattening perspective",
        bestFor: ["emphasis", "detail_focus", "tension"],
        durationRange: { min: 2, max: 6 }
    },
    zoom_out: {
        id: "zoom_out",
        name: "Zoom Out",
        nameAr: "تبعيد",
        soraDescription: "Lens demagnifies revealing context, expanding perspective",
        bestFor: ["reveal", "context", "ending"],
        durationRange: { min: 2, max: 6 }
    },

    // Static
    static: {
        id: "static",
        name: "Static / Locked Off",
        nameAr: "ثابت",
        soraDescription: "Camera remains completely stationary, subject provides motion",
        bestFor: ["dialogue", "contemplation", "stability"],
        durationRange: { min: 3, max: 15 }
    },

    // Handheld
    handheld: {
        id: "handheld",
        name: "Handheld",
        nameAr: "كاميرا محمولة",
        soraDescription: "Subtle organic sway and movement, human operator feel, documentary style",
        bestFor: ["documentary", "intimate", "authentic"],
        durationRange: { min: 3, max: 15 }
    }
};

// ============================================================================
// SHOT TYPES
// ============================================================================

export interface ShotType {
    id: string;
    name: string;
    nameAr: string;
    framing: string;
    soraDescription: string;
    bestFor: string[];
}

export const SHOT_TYPES: Record<string, ShotType> = {
    extreme_close_up: {
        id: "extreme_close_up",
        name: "Extreme Close-Up (ECU)",
        nameAr: "لقطة قريبة جداً",
        framing: "Single feature fills frame (eyes, hands, detail)",
        soraDescription: "Camera extremely close, single detail fills entire frame, eyes or hands",
        bestFor: ["emotion", "detail", "tension"]
    },
    close_up: {
        id: "close_up",
        name: "Close-Up (CU)",
        nameAr: "لقطة قريبة",
        framing: "Face fills frame, head and shoulders",
        soraDescription: "Subject's face fills majority of frame, capturing full emotional expression",
        bestFor: ["reaction", "dialogue", "connection"]
    },
    medium_close_up: {
        id: "medium_close_up",
        name: "Medium Close-Up (MCU)",
        nameAr: "لقطة متوسطة قريبة",
        framing: "Chest up visible",
        soraDescription: "Frame from chest up, balancing face and gesture visibility",
        bestFor: ["conversation", "presentation", "teach"]
    },
    medium_shot: {
        id: "medium_shot",
        name: "Medium Shot (MS)",
        nameAr: "لقطة متوسطة",
        framing: "Waist up visible",
        soraDescription: "Subject visible from waist up, showing upper body language and environment",
        bestFor: ["dialogue", "action", "normal_scene"]
    },
    medium_full_shot: {
        id: "medium_full_shot",
        name: "Medium Full Shot (MFS)",
        nameAr: "لقطة متوسطة كاملة",
        framing: "Knees up visible",
        soraDescription: "Subject visible from knees up, showing most of body with room context",
        bestFor: ["movement", "activity", "workshop"]
    },
    full_shot: {
        id: "full_shot",
        name: "Full Shot (FS)",
        nameAr: "لقطة كاملة",
        framing: "Full body visible with small margin",
        soraDescription: "Complete subject visible head to toe with small frame margin",
        bestFor: ["introduction", "activity", "dance"]
    },
    wide_shot: {
        id: "wide_shot",
        name: "Wide Shot (WS)",
        nameAr: "لقطة واسعة",
        framing: "Subject + significant environment",
        soraDescription: "Subject in context, environment clearly visible around them",
        bestFor: ["establishing", "context", "environment"]
    },
    extreme_wide: {
        id: "extreme_wide",
        name: "Extreme Wide Shot (EWS)",
        nameAr: "لقطة واسعة جداً",
        framing: "Environment dominant, subject small",
        soraDescription: "Vast environment, subject appears small within larger context",
        bestFor: ["epic", "scale", "location"]
    },
    over_shoulder: {
        id: "over_shoulder",
        name: "Over-the-Shoulder (OTS)",
        nameAr: "من فوق الكتف",
        framing: "Subject seen over another's shoulder",
        soraDescription: "Camera behind one subject's shoulder, looking at another or at work",
        bestFor: ["conversation", "pov", "teaching"]
    },
    birds_eye: {
        id: "birds_eye",
        name: "Bird's Eye View",
        nameAr: "منظر علوي",
        framing: "Directly overhead, looking down",
        soraDescription: "Camera positioned directly above, looking straight down at subject",
        bestFor: ["overview", "art_reveal", "pattern"]
    },
    low_angle: {
        id: "low_angle",
        name: "Low Angle",
        nameAr: "زاوية منخفضة",
        framing: "Camera below eye level, looking up",
        soraDescription: "Camera positioned below subject, looking upward, subject appears powerful",
        bestFor: ["heroic", "powerful", "achievement"]
    },
    high_angle: {
        id: "high_angle",
        name: "High Angle",
        nameAr: "زاوية مرتفعة",
        framing: "Camera above eye level, looking down",
        soraDescription: "Camera positioned above subject, looking down, intimate or vulnerable",
        bestFor: ["intimate", "vulnerable", "overview"]
    }
};

// ============================================================================
// MOVEMENT SPEEDS
// ============================================================================

export interface MovementSpeed {
    id: string;
    name: string;
    nameAr: string;
    soraDescription: string;
    durationMultiplier: number; // 1.0 = normal
}

export const MOVEMENT_SPEEDS: Record<string, MovementSpeed> = {
    very_slow: {
        id: "very_slow",
        name: "Very Slow / Creeping",
        nameAr: "بطيء جداً",
        soraDescription: "extremely slow, almost imperceptible movement",
        durationMultiplier: 2.0
    },
    slow: {
        id: "slow",
        name: "Slow / Gentle",
        nameAr: "بطيء",
        soraDescription: "slow, gentle, graceful movement",
        durationMultiplier: 1.5
    },
    medium: {
        id: "medium",
        name: "Medium / Natural",
        nameAr: "متوسط",
        soraDescription: "natural, comfortable pacing",
        durationMultiplier: 1.0
    },
    fast: {
        id: "fast",
        name: "Fast / Dynamic",
        nameAr: "سريع",
        soraDescription: "quick, energetic, dynamic movement",
        durationMultiplier: 0.7
    },
    very_fast: {
        id: "very_fast",
        name: "Very Fast / Whip",
        nameAr: "سريع جداً",
        soraDescription: "rapid whip-like movement with motion blur",
        durationMultiplier: 0.4
    }
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export interface Transition {
    id: string;
    name: string;
    nameAr: string;
    soraDescription: string;
    duration: number; // seconds
}

export const TRANSITIONS: Record<string, Transition> = {
    cut: {
        id: "cut",
        name: "Cut",
        nameAr: "قطع مباشر",
        soraDescription: "instant transition, no blend",
        duration: 0
    },
    fade_black: {
        id: "fade_black",
        name: "Fade to Black",
        nameAr: "تلاشي للأسود",
        soraDescription: "gradual fade to black, then fade in",
        duration: 1.5
    },
    fade_white: {
        id: "fade_white",
        name: "Fade to White",
        nameAr: "تلاشي للأبيض",
        soraDescription: "gradual fade to white, dreamy transition",
        duration: 1.5
    },
    cross_dissolve: {
        id: "cross_dissolve",
        name: "Cross Dissolve",
        nameAr: "تداخل",
        soraDescription: "smooth blend from one scene to next, overlapping",
        duration: 1.0
    },
    motion_match: {
        id: "motion_match",
        name: "Motion Match",
        nameAr: "تطابق الحركة",
        soraDescription: "cut on matching movement, seamless action continuity",
        duration: 0.5
    },
    whip_pan: {
        id: "whip_pan",
        name: "Whip Pan",
        nameAr: "تحريك سريع",
        soraDescription: "rapid horizontal blur transitioning to new scene",
        duration: 0.3
    }
};

// ============================================================================
// LIGHTING
// ============================================================================

export interface LightingSetup {
    id: string;
    name: string;
    nameAr: string;
    soraDescription: string;
    mood: string[];
}

export const LIGHTING_SETUPS: Record<string, LightingSetup> = {
    natural_warm: {
        id: "natural_warm",
        name: "Warm Natural Light",
        nameAr: "إضاءة طبيعية دافئة",
        soraDescription: "warm golden sunlight streaming through windows, soft shadows",
        mood: ["inviting", "comfortable", "happy"]
    },
    soft_diffused: {
        id: "soft_diffused",
        name: "Soft Diffused Light",
        nameAr: "إضاءة ناعمة",
        soraDescription: "even diffused lighting, minimal shadows, gentle highlights",
        mood: ["calm", "peaceful", "safe"]
    },
    dramatic_rim: {
        id: "dramatic_rim",
        name: "Dramatic Rim Light",
        nameAr: "إضاءة حافة درامية",
        soraDescription: "strong backlight creating rim lighting around subject silhouette",
        mood: ["dramatic", "heroic", "inspiring"]
    },
    studio_key: {
        id: "studio_key",
        name: "Studio Key Light",
        nameAr: "إضاءة استوديو",
        soraDescription: "professional studio lighting with key, fill, and back lights",
        mood: ["professional", "polished", "clean"]
    },
    golden_hour: {
        id: "golden_hour",
        name: "Golden Hour",
        nameAr: "الساعة الذهبية",
        soraDescription: "warm orange-gold sunset/sunrise light, long soft shadows",
        mood: ["magical", "nostalgic", "beautiful"]
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a Sora-compatible camera instruction
 */
export function buildCameraInstruction(
    movement: keyof typeof CAMERA_MOVEMENTS,
    speed: keyof typeof MOVEMENT_SPEEDS,
    startShot: keyof typeof SHOT_TYPES,
    endShot: keyof typeof SHOT_TYPES
): string {
    const mov = CAMERA_MOVEMENTS[movement];
    const spd = MOVEMENT_SPEEDS[speed];
    const start = SHOT_TYPES[startShot];
    const end = SHOT_TYPES[endShot];

    return `Camera: ${spd.soraDescription} ${mov.soraDescription}. Starting frame: ${start.soraDescription}. Ending frame: ${end.soraDescription}.`;
}

/**
 * Get a random camera movement suitable for a scene type
 */
export function getCameraForSceneType(sceneType: string): CameraMovement {
    const movements: Record<string, (keyof typeof CAMERA_MOVEMENTS)[]> = {
        opening: ["push_in", "crane_down", "tracking_follow"],
        discovery: ["orbit_cw", "push_in", "tilt_down"],
        action: ["tracking_follow", "orbit_cw", "handheld"],
        celebration: ["crane_up", "pull_back", "orbit_ccw"],
        closing: ["pull_back", "crane_up", "zoom_out"]
    };

    const options = movements[sceneType] || ["push_in"];
    const selected = options[Math.floor(Math.random() * options.length)];
    return CAMERA_MOVEMENTS[selected];
}

/**
 * Build complete Sora camera description for a 15-second segment
 */
export function buildSoraCameraBlock(config: {
    movement: keyof typeof CAMERA_MOVEMENTS;
    speed: keyof typeof MOVEMENT_SPEEDS;
    startShot: keyof typeof SHOT_TYPES;
    endShot: keyof typeof SHOT_TYPES;
    lighting: keyof typeof LIGHTING_SETUPS;
}): string {
    const mov = CAMERA_MOVEMENTS[config.movement];
    const spd = MOVEMENT_SPEEDS[config.speed];
    const start = SHOT_TYPES[config.startShot];
    const end = SHOT_TYPES[config.endShot];
    const light = LIGHTING_SETUPS[config.lighting];

    return `
===== CAMERA WORK =====
Movement: ${mov.name} (${mov.nameAr})
- ${spd.soraDescription} ${mov.soraDescription}

Framing:
- Start: ${start.name} - ${start.soraDescription}
- End: ${end.name} - ${end.soraDescription}

Lighting: ${light.name}
- ${light.soraDescription}
`.trim();
}
