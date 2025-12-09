/**
 * Poster Style Presets Configuration
 * 
 * Simplified to 3 best styles for ease of use.
 */

export interface PosterStyle {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    promptModifiers: {
        background: string;
        colors: string;
        elements: string;
        mood: string;
        technique: string;
    };
    geminiStyle: "None" | "3D Render" | "Illustration" | "Photorealistic" | "Creative" | "Dynamic" | "Graphic Design 3D";
}

// Simplified to 3 best options
export const POSTER_STYLES: PosterStyle[] = [
    {
        id: "bright-playful",
        name: "مرح للأطفال",
        nameEn: "Playful Kids",
        icon: "🌈",
        description: "ألوان زاهية ومبهجة - الأفضل للأطفال",
        promptModifiers: {
            background: "Bright, cheerful gradient from warm yellow to soft orange or sky blue",
            colors: "Vibrant primary colors, playful pastels, rainbow accents, joyful palette",
            elements: "Fun cartoon elements, bouncy shapes, stars, confetti, balloons, smiling faces",
            mood: "Fun, energetic, joyful, exciting for children, welcoming",
            technique: "Soft shadows, rounded corners, bubbly 3D style like Pixar animations"
        },
        geminiStyle: "3D Render"
    },
    {
        id: "tunisian-heritage",
        name: "تونسي أصيل",
        nameEn: "Tunisian",
        icon: "🇹🇳",
        description: "تصميم بالهوية التونسية",
        promptModifiers: {
            background: "Warm Mediterranean tones, terracotta and blue ceramic patterns, mosaic tile inspiration",
            colors: "Tunisian palette: turquoise blue, terracotta orange, olive green, Mediterranean white",
            elements: "Tunisian tile patterns (zellige), olive branches, jasmine flowers, traditional motifs",
            mood: "Cultural pride, warm and welcoming, authentic Tunisian feel",
            technique: "Traditional meets modern, ceramic tile patterns, warm sunlit atmosphere"
        },
        geminiStyle: "Illustration"
    },
    {
        id: "elegant-dark",
        name: "احترافي أنيق",
        nameEn: "Professional",
        icon: "✨",
        description: "تصميم أنيق وراقي",
        promptModifiers: {
            background: "Deep navy blue to dark purple gradient background with subtle geometric patterns",
            colors: "Rich indigo, royal purple, gold accents, sophisticated dark palette",
            elements: "Elegant abstract shapes, subtle line art, premium decorative elements",
            mood: "Professional, sophisticated, premium, inspiring confidence",
            technique: "High contrast, cinematic lighting, glass morphism effects"
        },
        geminiStyle: "3D Render"
    }
];

// Removed COLOR_MOODS and VISUAL_ELEMENTS - auto-selected for simplicity

export interface ColorMood {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    modifier: string;
}

export const COLOR_MOODS: ColorMood[] = [
    { id: "auto", name: "تلقائي", nameEn: "Auto", icon: "✨", modifier: "" },
    { id: "warm", name: "دافئ", nameEn: "Warm", icon: "🔥", modifier: "warm color palette with reds, oranges, yellows, and golden tones" },
    { id: "cool", name: "بارد", nameEn: "Cool", icon: "❄️", modifier: "cool color palette with blues, purples, teals, and silver tones" },
    { id: "vibrant", name: "نابض", nameEn: "Vibrant", icon: "🌈", modifier: "highly saturated vibrant colors, bold and eye-catching palette" },
    { id: "muted", name: "هادئ", nameEn: "Muted", icon: "🍂", modifier: "muted, desaturated color palette, soft and gentle tones" }
];

export interface VisualElement {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    modifier: string;
}

export const VISUAL_ELEMENTS: VisualElement[] = [
    { id: "auto", name: "تلقائي", nameEn: "Auto", icon: "✨", modifier: "" },
    { id: "children", name: "أطفال", nameEn: "Children", icon: "👧", modifier: "happy diverse children (North African features) engaged in activities" },
    { id: "abstract", name: "تجريدي", nameEn: "Abstract", icon: "🔷", modifier: "abstract geometric shapes and artistic patterns" },
    { id: "nature", name: "طبيعة", nameEn: "Nature", icon: "🌿", modifier: "natural elements like plants, trees, flowers, and organic shapes" },
    { id: "objects", name: "أدوات", nameEn: "Objects", icon: "📦", modifier: "relevant objects and tools related to the workshop theme" },
    { id: "cultural", name: "ثقافي", nameEn: "Cultural", icon: "🏛️", modifier: "Tunisian cultural center setting with Mediterranean architecture" }
];

/**
 * Build an enhanced prompt using style presets and refinement controls
 * INCLUDES Arabic text in the image for Instagram/Facebook ads
 */
export function buildEnhancedPosterPrompt(options: {
    title: string;
    topic: string;
    audience: string;
    format: "facebook" | "instagram";
    styleId: string;
    colorMoodId?: string;
    visualElementId?: string;
    date?: string;
    time?: string;
    place?: string;
}): string {
    const style = POSTER_STYLES.find(s => s.id === options.styleId) || POSTER_STYLES[0];
    const colorMood = COLOR_MOODS.find(c => c.id === options.colorMoodId);
    const visualElement = VISUAL_ELEMENTS.find(v => v.id === options.visualElementId);

    const audienceDescriptions: Record<string, string> = {
        children: "children aged 6-12, fun and engaging for young learners",
        teens: "teenagers aged 13-17, modern and cool aesthetic",
        adults: "adults, professional and sophisticated",
        families: "families, warm and inclusive feel",
        all: "all ages, universally appealing design",
    };

    const audienceDesc = audienceDescriptions[options.audience] || audienceDescriptions.children;
    const orientation = options.format === "instagram" ? "vertical (9:16 portrait)" : "horizontal (16:9 landscape)";

    // Build the comprehensive prompt - WITH TEXT for Instagram ads
    const prompt = `Create a stunning, INSTAGRAM-READY event advertisement poster for a children's workshop.

📌 THIS IS AN ADVERTISEMENT - TEXT MUST BE INCLUDED IN THE IMAGE!

WORKSHOP DETAILS:
- Workshop Title: "${options.title}"
- Theme/Topic: "${options.topic}"
- Target audience: ${audienceDesc}
- Format: ${orientation}

🔤 ARABIC TEXT TO INCLUDE IN THE POSTER:
1. MAIN TITLE (large, prominent): "${options.title}"
2. DATE: ${options.date || "[التاريخ]"}
3. TIME: ${options.time || "[الوقت]"}
4. LOCATION: ${options.place || "دار الثقافة بن عروس"}
5. BRANDING: "الطفل القائد" (Leader Kid logo/brand)
6. CALL TO ACTION: "سجّل الآن!" (Register Now!)

📐 TEXT PLACEMENT:
- Title at TOP or CENTER (most prominent)
- Date/Time/Location at BOTTOM in a clear info bar or badge
- Branding in a corner

VISUAL STYLE: ${style.nameEn}
- Background: ${style.promptModifiers.background}
- Color Palette: ${style.promptModifiers.colors}
- Design Elements: ${style.promptModifiers.elements}
- Mood/Atmosphere: ${style.promptModifiers.mood}
- Artistic Technique: ${style.promptModifiers.technique}

${colorMood?.modifier ? `COLOR OVERRIDE: Use ${colorMood.modifier}` : ""}
${visualElement?.modifier ? `MAIN VISUAL: Feature ${visualElement.modifier}` : ""}

🎯 CRITICAL REQUIREMENTS:
✅ INCLUDE all Arabic text clearly readable
✅ Professional Arabic typography (bold, modern font)
✅ High contrast text with backgrounds for readability
✅ Social media ready - eye-catching for Instagram/Facebook
✅ Child-safe, positive, and inspiring imagery
✅ Professional quality for a cultural center
✅ Text should be stylized and integrated into the design

The poster should make parents excited to sign up their children IMMEDIATELY!`;

    return prompt;
}

/**
 * Get the GeminiGen style setting for a poster style
 */
export function getGeminiStyleForPreset(styleId: string): PosterStyle["geminiStyle"] {
    const style = POSTER_STYLES.find(s => s.id === styleId);
    return style?.geminiStyle || "Illustration";
}

export default { POSTER_STYLES, COLOR_MOODS, VISUAL_ELEMENTS, buildEnhancedPosterPrompt, getGeminiStyleForPreset };
