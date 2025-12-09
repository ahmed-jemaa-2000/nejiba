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

    const systemPrompt = `You are a World-Class Educational Consultant for creative youth programs in Tunisia (like "Leader Kid").
    
    Create a HIGHLY DETAILED, PROFESSIONAL Workshop Facilitation Guide in Arabic.
    
    CRITICAL REQUIREMENTS:
    - **Professional Depth**: Do not give generic steps. Give EXACT instructions (e.g., "Ask children to stand in a circle and hold hands..." not just "Icebreaker").
    - **Cultural Relevance**: Use Tunisian cultural references where appropriate.
    - **Language**: Modern, inspiring Arabic (العربية المعاصرة) with English translations for key terms.
    - **Engagement**: Activities must be active, kinetic, and collaborative.
    - **Structure**: Include a "Hook" to start, "Deep Work" in the middle, and "Reflection" at the end.
    
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
/**
 * Generate an enhanced visual description for a poster based on workshop details
 */
/**
 * Generate an enhanced visual description for a poster based on workshop details
 */
export async function enhancePosterPrompt(input: {
    topic: string;
    workshopPlan: WorkshopPlanData;
    date?: string;
    time?: string;
    place?: string;
}): Promise<{ visualPrompt: string; explanation: string }> {
    const systemPrompt = `You are an expert creative director for children's educational events in Tunisia.
    
    Your task is to analyze a FULL WORKSHOP PLAN and create a RICH, VISUAL SCENE for a poster.
    
    CRITICAL: The user wants an "Ad-Ready" poster.
    1. VISUALS: Visualize the specific activities (e.g. Robot building -> Show a robot).
       - SETTING: A generic but modern "Cultural Center" in Tunisia. Bright, Mediterranean light, vibrant colors.
       - CHARACTERS: Diverse Tunisian children (North African features).
    2. TEXT: The user wants specific ARABIC TEXT included in the design.
       - Include instructions to place the Date, Time, and Location clearly.
       - IF the Date/Time provided is "TBD", do NOT write "Date: TBD" in the image. Instead, leave space for it or write "Date: [Date]".
       - IF Date/Time IS provided, MUST use the exact values.
    
    The visual prompt should be in English (for the image generator), but explicitly mention the Arabic text content to be shown.
    
    Return ONLY JSON:
    {
      "visualPrompt": "A detailed scene description... including text instructions...",
      "explanation": "..."
    }`;

    const hasSpecificDate = input.date && input.date !== "TBD";
    const hasSpecificTime = input.time && input.time !== "TBD";

    const userPrompt = `Analyze this plan and create a poster visualization:
    
    Topic: ${input.topic}
    Title: ${input.workshopPlan.title.ar}
    
    Logistic Details (MUST BE INCLUDED IN IMAGE TEXT if available):
    - Date: ${input.date || "(To Be Verified)"}
    - Time: ${input.time || "(To Be Verified)"}
    - Location: ${input.place || "Dar Takafa Ben Arous"}
    
    Key Activities:
    ${input.workshopPlan.timeline.map(a => `- ${a.titleEn}: ${a.description}`).join("\n")}
    
    Materials involved:
    ${input.workshopPlan.materials.join(", ")}
    
    Create a specific, unique visual scene. Ensure the prompt explicitly asks for the Arabic title "${input.workshopPlan.title.ar}".
    ${hasSpecificDate ? `Ask to include the date: ${input.date}` : "Do NOT ask for specific date text yet."}
    ${input.place ? `Ask to include location: ${input.place}` : ""}
    Style: High-end 3D Pixar Style, set in a bright Tunisian cultural club.`;

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
            visualPrompt: `A professional poster for ${input.topic} featuring the title "${input.workshopPlan.title.ar}" prominently in Arabic typography, with a ${input.workshopPlan.generalInfo.ageGroup} year old child engaging in creative activities.`,
            explanation: "تصميم يتضمن النص العربي"
        };
    }
}

/**
 * Generate 6 daily tips/advice content based on the workshop topic
 */
export interface DailyTip {
    day: number;
    title: string;
    content: string; // The advice text
    imagePrompt: string; // English prompt for image generation
}

export async function generateDailyTips(topic: string, workshopTitle: string): Promise<DailyTip[]> {
    const systemPrompt = `You are a social media content strategist for the "Dar Takafa Ben Arous" cultural center in Tunisia.
    
    The user has just hosted a workshop on: "${topic}".
    Your task is to generate a CONTENT CALENDAR for the next 6 days to keep the audience engaged.
    
    Requirements:
    - 6 DISTINCT posts (Day 1 to 6).
    - Content: Valuable advice, tips, or "Did you know?" facts related to the topic. NOT ADS.
    - Tone: Helpful, educational, friendly (Arabic).
    - Image Prompt Strategy:
      - SETTING: Realistic Tunisian cultural center (bright, Mediterranean, tile patterns).
      - CHARACTERS: Tunisian children and facilitators.
      - TEXT IN IMAGE: Explicitly INSTRUCT the image generator to include the Arabic Title of the tip inside the design (e.g. on a card, board, or overlay).
    
    Return ONLY a JSON array:
    [
      {
        "day": 1,
        "title": "Arabic Title (Short)",
        "content": "Arabic Advice (2-3 sentences)",
        "imagePrompt": "Create a photorealistic image of... [Tunisian Context]... Include the text '[Arabic Title]' clearly..."
      },
      ...
    ]`;

    const userPrompt = `Generate 6 daily engagement tips following the workshop: "${workshopTitle}" (${topic}).
    Focus on value for parents and children.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse daily tips JSON", e);
        throw new Error("Failed to generate tips");
    }
}
