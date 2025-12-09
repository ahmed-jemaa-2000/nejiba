/**
 * Poster Prompt Builder
 * 
 * Builds structured prompts for AI image generation services.
 * Ready for integration with:
 * - Google Gemini Imagen Pro
 * - OpenAI DALL-E 3
 * - Stability AI
 * - Replicate models
 */

export interface PosterPromptInput {
    format: "facebook" | "instagram";
    title: string;
    date: string;
    time: string;
    place: string;
    audience: string;
    description: string;
    descriptionFr?: string;
}

export interface PosterPromptOutput {
    imagePrompt: string;
    style: string;
    dimensions: { width: number; height: number };
    negativePrompt?: string;
}

/**
 * Build a structured prompt for poster image generation
 */
export function buildPosterPrompt(input: PosterPromptInput): PosterPromptOutput {
    const dimensions = input.format === "facebook"
        ? { width: 1200, height: 675 }  // 16:9
        : { width: 1080, height: 1920 }; // 9:16

    const audienceLabels: Record<string, string> = {
        children: "children aged 6-12",
        teens: "teenagers aged 13-17",
        adults: "adults",
        families: "families",
        all: "all ages",
    };

    const targetAudience = audienceLabels[input.audience] || "children";

    // Build the main image prompt
    const imagePrompt = buildImagePromptText(input, targetAudience);

    // Define style guidelines
    const style = `
Professional event poster design.
Modern, clean aesthetic with vibrant colors.
Dark theme with accent colors (indigo/purple tones).
Arabic typography friendly - leave clear space for text overlay.
Cultural center / educational activity theme.
Suitable for ${targetAudience}.
High contrast, eye-catching design.
No text in the image - text will be added separately.
  `.trim();

    // Negative prompts to avoid unwanted elements
    const negativePrompt = "text, letters, words, writing, watermark, low quality, blurry, distorted faces, scary, violent, inappropriate content";

    return {
        imagePrompt,
        style,
        dimensions,
        negativePrompt,
    };
}

function buildImagePromptText(input: PosterPromptInput, targetAudience: string): string {
    const basePrompt = `Create a professional event poster background for a cultural center activity.`;

    const themeHints = getThemeHints(input.title, input.description);

    const prompt = `
${basePrompt}

Event: ${input.title}
Target audience: ${targetAudience}
Location: ${input.place}
Theme elements: ${themeHints}

Design requirements:
- Dark, professional background (deep navy, charcoal, or dark purple)
- Accent colors: indigo, purple, or gold highlights
- Abstract or subtle decorative elements related to the theme
- Clean composition with clear focal point
- Leave space for Arabic text overlay (title at center/top)
- Modern, sophisticated look suitable for social media
- Inspiring and inviting atmosphere

Format: ${input.format === "facebook" ? "landscape 16:9" : "portrait 9:16 (Instagram Story)"}
  `.trim();

    return prompt;
}

function getThemeHints(title: string, description: string): string {
    const combinedText = `${title} ${description}`.toLowerCase();

    const themeKeywords: Record<string, string[]> = {
        "leadership, teamwork, collaboration": ["قيادة", "قائد", "فريق", "تعاون"],
        "confidence, self-esteem, courage": ["ثقة", "شجاعة", "نفس"],
        "creativity, art, imagination": ["إبداع", "فن", "خيال", "رسم"],
        "communication, speaking, expression": ["تواصل", "تحدث", "تعبير"],
        "reading, books, stories, literature": ["قراءة", "كتب", "قصص", "أدب"],
        "science, discovery, experiments": ["علوم", "اكتشاف", "تجارب"],
        "music, singing, performance": ["موسيقى", "غناء", "عرض"],
        "sports, movement, health": ["رياضة", "حركة", "صحة"],
    };

    const matchedThemes: string[] = [];

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
        if (keywords.some((kw) => combinedText.includes(kw))) {
            matchedThemes.push(theme);
        }
    }

    return matchedThemes.length > 0
        ? matchedThemes.join("; ")
        : "children activities, learning, growth, development";
}

/**
 * Build a simple text prompt for simpler image generation APIs
 */
export function buildSimplePosterPrompt(input: PosterPromptInput): string {
    return `Professional dark-themed event poster background for "${input.title}" at a cultural center. Modern design with indigo/purple accents, suitable for ${input.format === "facebook" ? "Facebook post (16:9)" : "Instagram Story (9:16)"}. No text, leave space for Arabic text overlay. Clean, inspiring, educational theme.`;
}
