/**
 * Base Provider Interface for Multi-Model AI Support
 *
 * Defines the contract that all AI providers (OpenAI, ZhipuAI, etc.) must implement.
 */

import { ActivityType, EnergyLevel, ComplexityLevel } from "../activityTypes";

// Re-export shared types from the original openai.ts
export interface WorkshopInput {
    topic: string;
    duration: "30" | "45" | "60" | "90" | "120";
    ageRange: "6-8" | "8-10" | "10-12" | "8-14" | "mixed";
    selectedMaterialNames?: string[]; // User-selected materials
}

export interface WorkshopActivity {
    timeRange: string;
    title: string;
    titleEn?: string;
    blockType?: string; // "Welcome Circle", "Explore", "Create & Try", etc.

    // ========== NEW FIELDS (V2) ==========
    // Activity type (expanded taxonomy)
    activityType?: ActivityType; // NEW: e.g., "صنع وإبداع", "فن وتعبير", "تأمل وتفكير"

    // Clarity metadata
    complexityLevel?: ComplexityLevel; // NEW: "simple" | "moderate" | "complex"
    estimatedSteps?: number; // NEW: For validation (should be 3-5)

    // Kid-friendly materials and instructions
    whatYouNeed?: string[]; // NEW: Kid-friendly materials list
    mainSteps?: string[]; // NEW: 3-5 steps MAX (replaces instructions)
    setupInstructions?: string[]; // NEW: Renamed from setupSteps for clarity
    wrapUpSteps?: string[]; // NEW: 1-2 closing steps (optional)

    // Visual and spoken guidance
    visualCues?: string[]; // NEW: e.g., "Show hands forming circle", "Point to materials"
    spokenPhrases?: string[]; // NEW: Exact Arabic phrases facilitator should say
    commonMistakes?: string[]; // NEW: What kids typically get confused about
    successIndicators?: string[]; // NEW: How to know kids "got it"

    // Life skills emphasis
    lifeSkillsFocus?: string[]; // NEW: ["confidence", "bravery", "friendship"]
    whyItMatters?: string; // NEW: One sentence on developmental benefit
    confidenceBuildingMoment?: string; // NEW: WHEN confidence grows

    // ========== OLD FIELDS (DEPRECATED BUT KEPT FOR BACKWARD COMPATIBILITY) ==========
    gameType?: "حركة" | "تمثيل" | "تحدي فريق" | "موسيقى" | "تنافس"; // DEPRECATED: use activityType
    energyLevel?: string | EnergyLevel; // UPDATED: now supports both old string format and new EnergyLevel enum
    groupSize?: string; // e.g., "فردي | ثنائي | فرق من 4-5"
    learningGoal?: string;

    // Core content (OLD FORMAT - still supported)
    description: string;
    setupSteps?: string[]; // DEPRECATED: use setupInstructions
    instructions?: string[]; // DEPRECATED: use mainSteps (8-12 steps was too much)
    detailedSteps?: string[]; // DEPRECATED: use mainSteps

    // Enhanced details for PDF quality
    variations?: string[]; // 2-3 difficulty levels or alternatives
    safetyTips?: string; // Age-specific safety considerations
    debriefQuestions?: string[]; // 2-3 reflection questions for kids

    // Facilitator support
    facilitatorTips?: string;
    shyChildTip?: string;
    activeChildTip?: string;
    funFactor?: string;
}

export interface ScheduleBlock {
    blockType: "opener" | "main" | "transition" | "closing";
    startMinute: number;
    endMinute: number;
    activity: WorkshopActivity;
}

export interface WorkshopPlanData {
    title: { ar: string; en: string };

    // NEW: Simple 3-phrase introduction for kids
    introduction?: {
        phrase1: string; // Welcoming hook that grabs attention (1 sentence)
        phrase2: string; // Simple connection to the topic (1 sentence)
        phrase3: string; // What we'll do today (1-2 sentences)
    };

    theme?: string;
    ageRange?: string;
    totalDurationMinutes?: number;
    learningObjectives?: string[];
    generalInfo: {
        duration: string;
        ageGroup: string;
        participants: string;
        level: string;
        facilitatorCount?: string;
    };
    objectives: { ar: string; en?: string }[];
    materials: string[] | { item: string; quantity: string; notes?: string }[];
    roomSetup?: string;
    schedule?: ScheduleBlock[];
    timeline: WorkshopActivity[];

    // Enhanced closing section
    closingReflection?: {
        title: string;
        nameAr?: string;
        nameEn?: string;
        duration?: string;
        durationMinutes?: number;
        description: string;
        steps?: string[];
        questions: string[];
    };

    // Support both old (string[]) and new (object) format
    facilitatorNotes: string[] | {
        beforeWorkshop?: string[];
        duringWorkshop?: string[];
        emergencyActivities?: { name: string; duration: string; description: string }[];
        commonChallenges?: { challenge: string; solution: string }[];
    };

    // Emergency backup game
    emergencyBackup?: string;
}

export interface WorkshopIdea {
    id: string;
    title: string;
    description: string;
    theme: string;
    suggestedDuration: number;
    difficulty: "easy" | "medium" | "hard";
}

/**
 * Video segment for Sora-2 generation (max 15 seconds each)
 */
export interface VideoSegment {
    segmentNumber: number;          // 1-4
    duration: number;                // 10-15 seconds
    soraPrompt: string;             // Detailed Sora-2 prompt (main field!)
    sceneDescription: string;        // What happens (Arabic)
    visualElements: string[];        // Key visual elements
    cameraMovement: string;          // "pan right", "zoom in", etc.
    mood: string;                    // "joyful", "calm", "energetic"
    voiceoverText: string;           // Arabic narration
}

/**
 * Video content collection for each daily tip (4 segments = ~54 seconds)
 */
export interface DailyVideoContent {
    day: number;                     // 1-6
    theme: string;                   // "brain science", "teamwork", etc.
    segments: VideoSegment[];        // ALWAYS 4 segments
    transitionNotes: string;         // How to combine (Arabic)
}

export interface DailyTip {
    day: number;
    title: string; // Arabic title (short, catchy)
    titleEn: string; // English title
    content: string; // Detailed Arabic advice (3-5 sentences)
    instagramCaption: string; // Ready-to-post Instagram caption with emojis and hashtags
    instagramStoryText: string; // Short text for Instagram stories (1-2 sentences)
    imagePrompt: string; // English prompt for image generation with Arabic text
    videoContent: DailyVideoContent; // NEW: Sora-2 video prompts
}

export interface PosterInput {
    topic: string;
    workshopPlan: WorkshopPlanData;
    date?: string;
    time?: string;
    place?: string;
}

export interface PosterOutput {
    visualPrompt: string;
    explanation: string;
}

/**
 * Provider-specific model configuration
 */
export interface ModelConfig {
    workshop: string;         // Model for workshop generation
    activities: string;       // Model for activity operations
    maxTokensWorkshop: number;
    maxTokensActivity: number;
    temperature?: number;
    reasoning?: any;          // Provider-specific reasoning config
}

/**
 * System and user prompt pair
 */
export interface PromptPair {
    system: string;
    user: string;
}

/**
 * Base AI Provider interface that all providers must implement
 */
export interface AIProvider {
    /** Provider name (e.g., "openai", "zhipuai") */
    name: string;

    /** Model configuration */
    config: ModelConfig;

    /**
     * Generate a complete workshop plan
     */
    generateWorkshopPlan(input: WorkshopInput): Promise<WorkshopPlanData>;

    /**
     * Regenerate a single activity within a workshop plan
     */
    regenerateActivity(
        workshopPlan: WorkshopPlanData,
        activityIndex: number,
        customInstructions?: string
    ): Promise<WorkshopActivity>;

    /**
     * Generate 3 alternative activities for a given position
     */
    generateAlternatives(
        workshopPlan: WorkshopPlanData,
        activityIndex: number
    ): Promise<WorkshopActivity[]>;

    /**
     * Generate workshop ideas for a theme or time period
     */
    generateIdeas(theme?: string, count?: number): Promise<WorkshopIdea[]>;

    /**
     * Generate 6 daily tips based on workshop topic
     */
    generateDailyTips(topic: string, workshopTitle: string): Promise<DailyTip[]>;

    /**
     * Generate an enhanced visual description for a poster
     */
    enhancePosterPrompt(input: PosterInput): Promise<PosterOutput>;
}

/**
 * Custom error classes for AI operations
 */
export class AIError extends Error {
    constructor(
        message: string,
        public code: string,
        public provider: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = "AIError";
    }
}

export class InvalidAPIKeyError extends AIError {
    constructor(provider: string) {
        super(`Invalid API key for ${provider}`, "INVALID_KEY", provider, 401);
        this.name = "InvalidAPIKeyError";
    }
}

export class RateLimitError extends AIError {
    constructor(provider: string) {
        super(`Rate limit exceeded for ${provider}`, "RATE_LIMIT", provider, 429);
        this.name = "RateLimitError";
    }
}

export class ModelNotFoundError extends AIError {
    constructor(provider: string, model: string) {
        super(`Model ${model} not found for ${provider}`, "MODEL_NOT_FOUND", provider, 404);
        this.name = "ModelNotFoundError";
    }
}

/**
 * ========== MIGRATION HELPERS ==========
 * Helper functions to convert old workshop format to new format
 */

/**
 * Map old gameType to new activityType
 */
export function mapGameTypeToActivityType(gameType?: string): ActivityType {
    const mapping: Record<string, ActivityType> = {
        "حركة": "حركة",
        "تمثيل": "تمثيل",
        "تحدي فريق": "تحدي فريق",
        "موسيقى": "موسيقى",
        "تنافس": "حركة", // Map competition to movement
        "تخيل": "استكشاف",
        "حل مشكلات": "حل مشكلات",
        "تعاون": "تعاون",
        "قيادة فريق": "تحدي فريق"
    };
    return mapping[gameType || ""] || "حركة" as ActivityType; // Default to movement
}

/**
 * Parse old energy level string to new EnergyLevel enum
 */
export function parseEnergyLevel(energyStr?: string): EnergyLevel {
    if (!energyStr) return "medium";

    const lower = energyStr.toLowerCase();
    if (lower.includes("عالي") || lower.includes("high") || lower.includes("🔋🔋🔋")) {
        return "high";
    } else if (lower.includes("منخفض") || lower.includes("low") || lower.includes("🔋")) {
        return "low";
    } else {
        return "medium";
    }
}

/**
 * Migrate old activity format to new format
 * This ensures backward compatibility with existing workshops
 */
export function migrateActivityToV2(oldActivity: WorkshopActivity): WorkshopActivity {
    // If activity already has new fields, return as-is
    if (oldActivity.activityType && oldActivity.mainSteps) {
        return oldActivity;
    }

    // Determine steps from old format
    const steps = oldActivity.mainSteps ||
                  oldActivity.instructions ||
                  oldActivity.detailedSteps ||
                  [];

    // Build migrated activity
    return {
        ...oldActivity,

        // Map old fields to new
        activityType: oldActivity.activityType || mapGameTypeToActivityType(oldActivity.gameType),
        energyLevel: typeof oldActivity.energyLevel === 'string'
            ? parseEnergyLevel(oldActivity.energyLevel)
            : (oldActivity.energyLevel || "medium"),

        // New clarity fields with defaults
        mainSteps: steps,
        estimatedSteps: steps.length,
        complexityLevel: oldActivity.complexityLevel ||
                        (steps.length <= 5 ? "simple" : "moderate"),

        // Life skills defaults
        lifeSkillsFocus: oldActivity.lifeSkillsFocus || ["confidence"],
        whyItMatters: oldActivity.whyItMatters || oldActivity.learningGoal,

        // Materials
        whatYouNeed: oldActivity.whatYouNeed || [],
        setupInstructions: oldActivity.setupInstructions || oldActivity.setupSteps
    };
}

/**
 * Migrate entire workshop plan to V2 format
 */
export function migrateWorkshopToV2(workshop: WorkshopPlanData): WorkshopPlanData {
    return {
        ...workshop,
        timeline: workshop.timeline.map(activity => migrateActivityToV2(activity))
    };
}
