/**
 * AI Provider Configuration and Factory
 *
 * Manages provider selection and initialization based on environment variables.
 */

import { AIProvider } from "./providers/base";
import { OpenAIProvider } from "./providers/openai";
import { ZhipuAIProvider } from "./providers/zhipuai";

export type ProviderType = "openai" | "zhipuai";

/**
 * Environment validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * AI Configuration Manager
 *
 * Singleton pattern to ensure only one provider instance is created.
 */
export class AIConfig {
    private static instance: AIProvider | null = null;

    /**
     * Get the active AI provider based on environment configuration
     */
    static getProvider(): AIProvider {
        if (this.instance) {
            return this.instance;
        }

        const providerType = (process.env.AI_PROVIDER || "openai") as ProviderType;

        // Validate environment before creating provider
        const validation = this.validateEnv(providerType);
        if (!validation.valid) {
            throw new Error(`Invalid environment configuration: ${validation.errors.join("; ")}`);
        }

        // Create provider instance
        try {
            if (providerType === "zhipuai") {
                this.instance = new ZhipuAIProvider();
            } else {
                this.instance = new OpenAIProvider();
            }

            console.log(`🤖 AI Provider initialized: ${this.instance.name} (model: ${this.instance.config.workshop})`);
            return this.instance;
        } catch (error) {
            console.error(`❌ Failed to initialize ${providerType} provider:`, error);
            throw error;
        }
    }

    /**
     * Reset provider instance (useful for testing)
     */
    static resetProvider(): void {
        this.instance = null;
    }

    /**
     * Validate environment configuration
     */
    static validateEnv(provider?: ProviderType): ValidationResult {
        const errors: string[] = [];
        const providerType = provider || (process.env.AI_PROVIDER || "openai") as ProviderType;

        // Validate provider type
        if (!["openai", "zhipuai"].includes(providerType)) {
            errors.push(`Invalid AI_PROVIDER: "${providerType}". Must be "openai" or "zhipuai"`);
            return { valid: false, errors };
        }

        // Validate provider-specific API keys
        if (providerType === "openai") {
            if (!process.env.OPENAI_API_KEY) {
                errors.push("OPENAI_API_KEY is required when AI_PROVIDER=openai");
            }
        }

        if (providerType === "zhipuai") {
            if (!process.env.ZHIPUAI_API_KEY) {
                errors.push("ZHIPUAI_API_KEY is required when AI_PROVIDER=zhipuai");
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Get current provider type from environment
     */
    static getProviderType(): ProviderType {
        return (process.env.AI_PROVIDER || "openai") as ProviderType;
    }
}

/**
 * Convenience function to get the active AI provider
 */
export function getAIProvider(): AIProvider {
    return AIConfig.getProvider();
}

/**
 * Convenience function to validate environment
 */
export function validateEnv(): ValidationResult {
    return AIConfig.validateEnv();
}
