/**
 * Base Provider Interface for Multi-Model AI Support
 *
 * Defines the contract that all AI providers (OpenAI, ZhipuAI, etc.) must implement.
 */

// Re-export shared types from the original openai.ts
export interface WorkshopInput {
    topic: string;
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
    selectedMaterialNames?: string[]; // User-selected materials
}

export interface WorkshopActivity {
    timeRange: string;
    title: string;
    titleEn?: string;

    // Game metadata
    gameType?: "حركة" | "تمثيل" | "تحدي فريق" | "موسيقى" | "تنافس";
    energyLevel?: string; // e.g., "🔋🔋🔋 عالي"
    groupSize?: string; // e.g., "فردي | ثنائي | فرق من 4-5"
    learningGoal?: string;

    // Core content
    description: string;
    setupSteps?: string[]; // 2-4 preparation steps before activity
    instructions: string[]; // 8-12 detailed steps with exact phrases
    detailedSteps?: string[]; // Alias for backward compatibility

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

export interface DailyTip {
    day: number;
    title: string; // Arabic title (short, catchy)
    titleEn: string; // English title
    content: string; // Detailed Arabic advice (3-5 sentences)
    instagramCaption: string; // Ready-to-post Instagram caption with emojis and hashtags
    instagramStoryText: string; // Short text for Instagram stories (1-2 sentences)
    imagePrompt: string; // English prompt for image generation with Arabic text
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
