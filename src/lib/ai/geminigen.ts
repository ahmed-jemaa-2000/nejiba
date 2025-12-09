/**
 * GeminiGen.AI Image Generation Client
 * 
 * Uses the GeminiGen API to generate high-quality images from text prompts.
 * https://api.geminigen.ai
 */

export interface GeminiGenRequest {
    prompt: string;
    model?: "imagen-pro" | "imagen-flash" | "imagen-4-fast" | "imagen-4" | "imagen-4-ultra";
    aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
    style?:
    | "None"
    | "3D Render"
    | "Anime General"
    | "Creative"
    | "Dynamic"
    | "Fashion"
    | "Game Concept"
    | "Graphic Design 3D"
    | "Illustration"
    | "Photorealistic"
    | "Portrait"
    | "Portrait Cinematic"
    | "Portrait Fashion"
    | "Stock Photo"
    | "Watercolor";
}

export interface GeminiGenResponse {
    id: number;
    uuid: string;
    generate_result: string;
    status: 1 | 2 | 3; // 1: processing, 2: completed, 3: failed
    status_desc: string;
    status_percentage: number;
    error_message?: string;
    thumbnail_small?: string;
}

const GEMINIGEN_API_URL = "https://api.geminigen.ai/uapi/v1/generate_image";

/**
 * Generate an image using GeminiGen.AI API
 */
export async function generateImage(options: GeminiGenRequest): Promise<GeminiGenResponse> {
    const apiKey = process.env.GEMINIGEN_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINIGEN_API_KEY not configured");
    }

    // Create form data
    const formData = new FormData();
    formData.append("prompt", options.prompt);
    formData.append("model", options.model || "imagen-pro");
    formData.append("aspect_ratio", options.aspect_ratio || "16:9");

    if (options.style) {
        formData.append("style", options.style);
    }

    const response = await fetch(GEMINIGEN_API_URL, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GeminiGen API error: ${response.status} - ${errorText}`);
    }

    let result: GeminiGenResponse = await response.json();

    // Check for failed status
    if (result.status === 3) {
        throw new Error(`Image generation failed: ${result.error_message || "Unknown error"}`);
    }

    // POLL if processing (status 1)
    if (result.status === 1) {
        console.log("Image processing... polling for result (UUID: " + result.uuid + ")");
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds max

        while (result.status === 1 && attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;

            const historyUrl = `https://api.geminigen.ai/uapi/v1/history/${result.uuid}`;
            const historyResponse = await fetch(historyUrl, {
                method: "GET",
                headers: { "x-api-key": apiKey }
            });

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                // Normalize history data to GeminiGenResponse
                result = {
                    ...result,
                    status: historyData.status,
                    generate_result: historyData.generate_result || (historyData.generated_image?.[0]?.image_url),
                    error_message: historyData.error_message
                };
            }
        }

        if (result.status === 1) {
            throw new Error("Image generation timed out");
        }

        if (result.status === 3) {
            throw new Error(`Image generation failed during polling: ${result.error_message || "Unknown error"}`);
        }
    }

    return result;
}

/**
 * Build an optimized prompt for cultural center event posters
 */
export function buildPosterPrompt(input: {
    title: string;
    topic?: string;
    audience?: string;
    style?: "modern" | "traditional" | "playful";
    format: "facebook" | "instagram";
}): string {
    const audienceDescriptions: Record<string, string> = {
        children: "children, fun and colorful",
        teens: "teenagers, modern and dynamic",
        adults: "adults, professional and elegant",
        families: "families, warm and welcoming",
        all: "all ages, inclusive and friendly",
    };

    // Check if the topic is actually a detailed visual description (Smart Context)
    // Arabic text is denser, so > 20 chars is likely a sentence/description, not just a title
    const isDetailedPrompt = input.topic && input.topic.length > 20;

    // Check if the user provided a fully structured prompt (Advanced usage)
    const isStructuredPrompt = input.topic && (
        input.topic.includes("Design style:") ||
        input.topic.includes("Layout:") ||
        input.topic.includes("Format:")
    );

    let prompt = "";

    if (isStructuredPrompt) {
        // PASS THROUGH MODE: User knows exactly what they want.
        // We trust the structured prompt completely.
        prompt = input.topic!;
    } else if (isDetailedPrompt) {
        // Use the smart context as the core driver, but add some safe defaults
        prompt = `Create a high-quality, professional poster. 
        
Visual Description: ${input.topic}

Technical Requirements:
- Aspect Ratio: ${input.format === "instagram" ? "9:16 (Vertical)" : "16:9 (Horizontal)"}
- Style: 3D Illustration / Digital Art (Pixar/Disney style or High-end Editorial)
- High contrast, vibrant but professional colors
- Soft, cinematic lighting
- Composition: Balanced for a poster`;
    } else {
        // Fallback to generic template for short/empty topics
        const audienceDesc = audienceDescriptions[input.audience || "children"] || "children";

        prompt = `Create a professional event poster design for a cultural center activity.

Title context: "${input.title}"
Topic: ${input.topic || "General Activity"}
Target audience: ${audienceDesc}

Design requirements:
- Dark, elegant background with deep indigo/purple tones
- Modern, clean layout
- Decorative elements related to education and creativity
- Professional and premium look
- Style: Professional event poster, ${input.format === "instagram" ? "vertical portrait" : "horizontal landscape"}`;
    }

    return prompt;
}

/**
 * Get the appropriate aspect ratio for the format
 */
export function getAspectRatio(format: "facebook" | "instagram"): "16:9" | "9:16" {
    return format === "facebook" ? "16:9" : "9:16";
}
