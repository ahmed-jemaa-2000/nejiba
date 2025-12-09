/**
 * OpenAI Client Wrapper for Nejiba Studio
 * 
 * Provides typed functions for workshop generation and activity regeneration.
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface WorkshopInput {
    topic: string;
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
}

export interface WorkshopActivity {
    timeRange: string;
    title: string;
    titleEn?: string;
    description: string;
    instructions: string[];
    facilitatorTips?: string;
}

export interface WorkshopPlanData {
    title: { ar: string; en: string };
    generalInfo: {
        duration: string;
        ageGroup: string;
        participants: string;
        level: string;
    };
    objectives: { ar: string; en?: string }[];
    materials: string[];
    timeline: WorkshopActivity[];
    facilitatorNotes: string[];
}

const AGE_DESCRIPTORS: Record<string, { ar: string; en: string; characteristics: string }> = {
    "6-8": {
        ar: "6-8 سنة",
        en: "6-8 years old",
        characteristics: "short attention span (10-15 min), learn through play, need lots of movement",
    },
    "8-10": {
        ar: "8-10 سنة",
        en: "8-10 years old",
        characteristics: "moderate attention span (15-20 min), enjoy group activities, like challenges",
    },
    "10-12": {
        ar: "10-12 سنة",
        en: "10-12 years old",
        characteristics: "longer attention span (20-25 min), peer-focused, can handle discussions",
    },
    "mixed": {
        ar: "أعمار مختلطة (6-12 سنة)",
        en: "mixed ages (6-12 years old)",
        characteristics: "varied needs, pair older with younger, flexible activities",
    },
};

/**
 * Generate a complete workshop plan using GPT-4o-mini
 */
export async function generateWorkshopPlan(input: WorkshopInput): Promise<WorkshopPlanData> {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];
    const durationNum = parseInt(input.duration);

    const systemPrompt = `You are an expert workshop facilitator for children's educational programs in Tunisia. Create detailed workshop plans in Arabic with English translations.

REQUIREMENTS:
- All primary content must be in Arabic (العربية)
- Include practical, easy-to-follow activities
- Consider age-appropriate engagement: ${ageInfo.characteristics}
- Focus on building confidence and leadership skills
- Use simple, available materials

Return ONLY valid JSON matching this exact structure (no markdown, no code blocks):
{
  "title": { "ar": "ورشة: [الموضوع]", "en": "Workshop: [Topic]" },
  "generalInfo": {
    "duration": "[X] دقيقة",
    "ageGroup": "${ageInfo.ar}",
    "participants": "10-15 طفل",
    "level": "مبتدئ"
  },
  "objectives": [
    { "ar": "هدف بالعربية", "en": "Objective in English" }
  ],
  "materials": ["مادة 1", "مادة 2"],
  "timeline": [
    {
      "timeRange": "0-X دقيقة",
      "title": "عنوان النشاط",
      "titleEn": "Activity Title",
      "description": "وصف النشاط",
      "instructions": ["خطوة 1", "خطوة 2"],
      "facilitatorTips": "نصيحة للميسر"
    }
  ],
  "facilitatorNotes": ["ملاحظة 1", "ملاحظة 2"]
}`;

    const userPrompt = `Create a ${durationNum}-minute workshop plan for: "${input.topic}"

Age group: ${ageInfo.ar} (${ageInfo.en})
Context: Cultural center "Leader Kid" (الطفل القائد) club in Ben Arous, Tunisia

Include:
- 4-5 learning objectives
- 5-7 materials (simple, easily available)
- 4-5 timeline activities covering the full ${durationNum} minutes:
  * Icebreaker (first 10-15 min)
  * Main activities (middle portion)
  * Wrap-up (last 10 min)
- 5-6 facilitator notes

Make activities creative, engaging, and fun!`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        return JSON.parse(content) as WorkshopPlanData;
    } catch {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as WorkshopPlanData;
        }
        throw new Error("Failed to parse workshop plan JSON");
    }
}

/**
 * Regenerate a single activity within a workshop plan
 */
export async function regenerateActivity(
    workshopPlan: WorkshopPlanData,
    activityIndex: number,
    customInstructions?: string
): Promise<WorkshopActivity> {
    const currentActivity = workshopPlan.timeline[activityIndex];
    const topic = workshopPlan.title.ar.replace("ورشة: ", "");

    const systemPrompt = `You are an expert workshop facilitator. Generate a SINGLE workshop activity in Arabic.

Return ONLY valid JSON (no markdown):
{
  "timeRange": "${currentActivity.timeRange}",
  "title": "عنوان جديد",
  "titleEn": "New Title",
  "description": "وصف النشاط",
  "instructions": ["خطوة 1", "خطوة 2", "خطوة 3", "خطوة 4"],
  "facilitatorTips": "نصيحة للميسر"
}`;

    const userPrompt = `Generate a NEW activity to replace this one in a workshop about "${topic}":

Current activity:
- Time: ${currentActivity.timeRange}
- Title: ${currentActivity.title}

Workshop context:
- Topic: ${topic}
- Age group: ${workshopPlan.generalInfo.ageGroup}
- This is activity ${activityIndex + 1} of ${workshopPlan.timeline.length}

${customInstructions ? `Special instructions: ${customInstructions}` : ""}

Create a DIFFERENT, creative activity that fits the same time slot and workshop theme!`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        return JSON.parse(content) as WorkshopActivity;
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as WorkshopActivity;
        }
        throw new Error("Failed to parse activity JSON");
    }
}

/**
 * Generate 3 alternative activities for a given position
 */
export async function generateAlternatives(
    workshopPlan: WorkshopPlanData,
    activityIndex: number
): Promise<WorkshopActivity[]> {
    const currentActivity = workshopPlan.timeline[activityIndex];
    const topic = workshopPlan.title.ar.replace("ورشة: ", "");

    const systemPrompt = `You are an expert workshop facilitator. Generate 3 DIFFERENT activity alternatives in Arabic.

Return ONLY a JSON array (no markdown):
[
  {
    "timeRange": "${currentActivity.timeRange}",
    "title": "عنوان 1",
    "titleEn": "Title 1",
    "description": "وصف",
    "instructions": ["خطوة 1", "خطوة 2"],
    "facilitatorTips": "نصيحة"
  },
  ...
]`;

    const userPrompt = `Generate 3 DIFFERENT alternative activities for this slot in a "${topic}" workshop:

Time slot: ${currentActivity.timeRange}
Current activity: ${currentActivity.title}
Age group: ${workshopPlan.generalInfo.ageGroup}
Position: Activity ${activityIndex + 1} of ${workshopPlan.timeline.length}

Make each alternative unique and creative!`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.95,
        max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        return JSON.parse(content) as WorkshopActivity[];
    } catch {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as WorkshopActivity[];
        }
        throw new Error("Failed to parse alternatives JSON");
    }
}

/**
 * Generate workshop ideas for a theme or time period
 */
export interface WorkshopIdea {
    id: string;
    title: string;
    description: string;
    theme: string;
    suggestedDuration: number;
    difficulty: "easy" | "medium" | "hard";
}

export async function generateIdeas(
    theme?: string,
    count: number = 10
): Promise<WorkshopIdea[]> {
    const systemPrompt = `You are an expert in children's workshop programming. Generate creative workshop ideas in Arabic.

Return ONLY a JSON array (no markdown):
[
  {
    "id": "unique-id-1",
    "title": "عنوان الورشة",
    "description": "وصف قصير للورشة",
    "theme": "القيادة/الإبداع/التواصل/etc",
    "suggestedDuration": 60,
    "difficulty": "easy"
  },
  ...
]`;

    const userPrompt = `Generate ${count} creative workshop ideas for the "Leader Kid" (الطفل القائد) program.

${theme ? `Focus on theme: ${theme}` : "Include a variety of themes: leadership, creativity, communication, teamwork, self-confidence, emotional intelligence, etc."}

Each idea should be:
- Suitable for children aged 6-12
- Practical for a cultural center setting
- Focus on building life skills and leadership
- Fun and engaging`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        return JSON.parse(content) as WorkshopIdea[];
    } catch {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as WorkshopIdea[];
        }
        throw new Error("Failed to parse ideas JSON");
    }
}

/**
 * Generate an enhanced visual description for a poster based on workshop details
 */
export async function enhancePosterPrompt(input: {
    topic: string;
    title: string;
    audience?: string;
}): Promise<{ visualPrompt: string; explanation: string }> {
    const systemPrompt = `You are an expert creative director for children's educational events.
    
    Your task is to take a workshop topic and create a RICH, DETAILED VISUAL DESCRIPTION in English that can be used as an image generation prompt.
    
    The visual prompt should:
    - Describe a specific scene, not just abstract concepts
    - Include lighting, colors, mood, and art style
    - Be suitable for "Nano Banana" (Imagen) or similar high-end models
    - Avoid text descriptions (no "text saying...")
    - Be magical and inspiring
    
    Also provide a brief 1-sentence explanation in Arabic about why you chose this visual theme.
    
    Return ONLY JSON:
    {
      "visualPrompt": "A detailed English description...",
      "explanation": "شرح مبسط للفكرة الفنية بالعربية"
    }`;

    const userPrompt = `Create a visual prompt for a workshop.
    
    Topic: ${input.topic}
    Title: ${input.title}
    Audience: ${input.audience || "Children 6-12"}
    
    Make it look like a premium poster design.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        return JSON.parse(content);
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        // Fallback
        return {
            visualPrompt: `A professional, creative poster design for a workshop about ${input.topic}, featuring high-quality abstract 3D elements, vibrant colors, and soft lighting.`,
            explanation: "تصميم احترافي يعكس موضوع الورشة"
        };
    }
}
