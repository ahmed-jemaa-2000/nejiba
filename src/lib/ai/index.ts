/**
 * Public API Facade for AI Services
 *
 * Provides backward-compatible exports that delegate to the active provider.
 * This is the main entry point for all AI operations.
 */

import { getAIProvider } from "./config";
// Import original OpenAI functions as temporary workaround
import * as OriginalOpenAI from "./openai";

// Re-export all types from base for convenience
export type {
    WorkshopInput,
    WorkshopActivity,
    WorkshopPlanData,
    WorkshopIdea,
    DailyTip,
    ScheduleBlock,
} from "./providers/base";

/**
 * Generate a complete workshop plan using the active AI provider
 *
 * TEMPORARY: Using original OpenAI implementation until provider is fixed
 *
 * @param input Workshop input parameters (topic, duration, age range, materials)
 * @returns Complete workshop plan with activities, materials, and facilitator notes
 */
export async function generateWorkshopPlan(input: import("./providers/base").WorkshopInput) {
    const providerType = process.env.AI_PROVIDER || "openai";

    // TEMPORARY FIX: Use original OpenAI implementation for both providers
    // The provider abstraction prompts need to be updated with full prompts
    if (providerType === "openai") {
        return OriginalOpenAI.generateWorkshopPlan(input);
    }

    // For ZhipuAI, use the provider (which has simplified prompts - needs fix later)
    const provider = getAIProvider();
    return provider.generateWorkshopPlan(input);
}

/**
 * Regenerate a single activity within a workshop plan
 *
 * TEMPORARY: Using original OpenAI implementation
 */
export async function regenerateActivity(
    workshopPlan: import("./providers/base").WorkshopPlanData,
    activityIndex: number,
    customInstructions?: string
) {
    const providerType = process.env.AI_PROVIDER || "openai";
    if (providerType === "openai") {
        return OriginalOpenAI.regenerateActivity(workshopPlan, activityIndex, customInstructions);
    }
    const provider = getAIProvider();
    return provider.regenerateActivity(workshopPlan, activityIndex, customInstructions);
}

/**
 * Generate 3 alternative activities for a given position
 *
 * TEMPORARY: Using original OpenAI implementation
 */
export async function generateAlternatives(
    workshopPlan: import("./providers/base").WorkshopPlanData,
    activityIndex: number
) {
    const providerType = process.env.AI_PROVIDER || "openai";
    if (providerType === "openai") {
        return OriginalOpenAI.generateAlternatives(workshopPlan, activityIndex);
    }
    const provider = getAIProvider();
    return provider.generateAlternatives(workshopPlan, activityIndex);
}

/**
 * Generate workshop ideas for a theme or time period
 *
 * TEMPORARY: Using original OpenAI implementation
 */
export async function generateIdeas(theme?: string, count: number = 10) {
    const providerType = process.env.AI_PROVIDER || "openai";
    if (providerType === "openai") {
        return OriginalOpenAI.generateIdeas(theme, count);
    }
    const provider = getAIProvider();
    return provider.generateIdeas(theme, count);
}

/**
 * Generate 6 daily tips based on workshop topic
 *
 * TEMPORARY: Using original OpenAI implementation
 */
export async function generateDailyTips(topic: string, workshopTitle: string) {
    const providerType = process.env.AI_PROVIDER || "openai";
    if (providerType === "openai") {
        return OriginalOpenAI.generateDailyTips(topic, workshopTitle);
    }
    const provider = getAIProvider();
    return provider.generateDailyTips(topic, workshopTitle);
}

/**
 * Generate an enhanced visual description for a poster
 *
 * TEMPORARY: Using original OpenAI implementation
 */
export async function enhancePosterPrompt(input: import("./providers/base").PosterInput) {
    const providerType = process.env.AI_PROVIDER || "openai";
    if (providerType === "openai") {
        return OriginalOpenAI.enhancePosterPrompt(input);
    }
    const provider = getAIProvider();
    return provider.enhancePosterPrompt(input);
}

// ============================================================================
// PDF-READY PROMPT EXPORT (NEW)
// ============================================================================

/**
 * Export PDF-ready workshop prompts for ChatGPT
 * 
 * These functions generate standalone prompts optimized for:
 * - Professional PDF output
 * - Facilitator scripts with exact timing
 * - Detailed step-by-step instructions
 * 
 * @example
 * const { fullPromptForChatGPT } = exportPDFReadyPrompt({
 *   topic: "الثقة بالنفس",
 *   durationMinutes: 90,
 *   ageRange: "8-10",
 *   ageDescriptionAr: "8-10 سنة",
 *   ageDescriptionEn: "8-10 years old"
 * });
 * // Copy fullPromptForChatGPT to ChatGPT GPT-5.2
 */
export {
    exportPDFReadyPrompt,
    quickExportPrompt,
    buildPDFReadySystemPrompt,
    buildPDFReadyUserPrompt,
    PDF_AGE_DESCRIPTORS,
    type PDFReadyPromptExport,
    type PDFReadyPromptConfig,
    type PDFReadyWorkshopPlan,
    type PDFReadyActivity,
    type PDFReadyStep,
    type PDFReadyMaterial,
} from "./prompts/pdfReadyWorkshopPrompt";
