/**
 * Workshop Prompt Builder
 * 
 * Builds structured prompts for AI text generation services.
 * Ready for integration with:
 * - OpenAI GPT-4o / GPT-4o-mini
 * - Anthropic Claude
 * - Google Gemini Pro
 */

export interface WorkshopPromptInput {
    topic: string;
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
}

export interface WorkshopPromptOutput {
    systemPrompt: string;
    userPrompt: string;
}

const AGE_DESCRIPTORS: Record<string, { ar: string; en: string; characteristics: string }> = {
    "6-8": {
        ar: "6-8 سنة",
        en: "6-8 years old",
        characteristics: "short attention span (10-15 min), learn through play, need lots of movement, concrete thinking, simple instructions",
    },
    "8-10": {
        ar: "8-10 سنة",
        en: "8-10 years old",
        characteristics: "moderate attention span (15-20 min), enjoy group activities, beginning abstract thinking, like challenges and games",
    },
    "10-12": {
        ar: "10-12 سنة",
        en: "10-12 years old",
        characteristics: "longer attention span (20-25 min), peer-focused, can handle discussions, enjoy responsibility, pre-teen sensitivities",
    },
    "mixed": {
        ar: "أعمار مختلطة (6-12 سنة)",
        en: "mixed ages (6-12 years old)",
        characteristics: "varied needs, pair older with younger, flexible activities that work at different levels, inclusive approach",
    },
};

/**
 * Build system and user prompts for workshop plan generation
 */
export function buildWorkshopPrompt(input: WorkshopPromptInput): WorkshopPromptOutput {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];
    const durationNum = parseInt(input.duration);

    const systemPrompt = `You are an expert workshop facilitator and curriculum designer specializing in children's educational programs for cultural centers in Tunisia. You create detailed, practical workshop plans in Arabic with English translations.

Your expertise includes:
- Child development and age-appropriate activities
- Interactive learning techniques
- Group dynamics and classroom management
- Cultural sensitivity for Arab/Tunisian context
- The "Leader Kid" (الطفل القائد) leadership development program

IMPORTANT GUIDELINES:
1. All primary content must be in Arabic (العربية), with English translations where helpful
2. Activities must be practical, requiring minimal materials
3. Include specific timing for each activity
4. Provide detailed facilitator instructions and tips
5. Consider the cultural context of Tunisia and Arab world
6. Design activities that build confidence and leadership skills
7. Include movement breaks for younger children
8. Make activities inclusive for different skill levels

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "title": {
    "ar": "ورشة: [الموضوع]",
    "en": "Workshop: [Topic]"
  },
  "generalInfo": {
    "duration": "[X] دقيقة",
    "ageGroup": "[الفئة العمرية]",
    "participants": "10-15 طفل",
    "level": "مبتدئ/متوسط/متقدم"
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

    const userPrompt = `Create a complete ${durationNum}-minute workshop plan for the topic: "${input.topic}"

TARGET AUDIENCE:
- Age group: ${ageInfo.ar} (${ageInfo.en})
- Age characteristics: ${ageInfo.characteristics}
- Context: Cultural center in Ben Arous, Tunisia
- Program: "الطفل القائد" (Leader Kid) leadership club

WORKSHOP REQUIREMENTS:
1. Total duration: ${durationNum} minutes
2. Structure should include:
   - Icebreaker/Welcome (${Math.round(durationNum * 0.15)} min)
   - Main Activity 1 (${Math.round(durationNum * 0.25)} min)
   - Main Activity 2 or Group Work (${Math.round(durationNum * 0.25)} min)
   - Movement/Game break (${Math.round(durationNum * 0.15)} min)
   - Wrap-up and closure (${Math.round(durationNum * 0.15)} min)

3. Include 4-6 learning objectives related to "${input.topic}"
4. List 5-8 required materials (simple, easily available items)
5. Provide 5-6 practical facilitator notes
6. Each activity must have:
   - Clear time range
   - Arabic title with English translation
   - Detailed description
   - Step-by-step instructions (4-6 steps)
   - At least one facilitator tip

TOPIC FOCUS: "${input.topic}"
Consider how this topic relates to:
- Building confidence and self-esteem
- Leadership skills for children
- Practical life skills
- Emotional intelligence
- Teamwork and communication

Generate a comprehensive, ready-to-use workshop plan that a non-expert facilitator can follow.`;

    return {
        systemPrompt,
        userPrompt,
    };
}

/**
 * Build a condensed prompt for simpler/faster generation
 */
export function buildSimpleWorkshopPrompt(input: WorkshopPromptInput): string {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];

    return `Create a ${input.duration}-minute workshop plan in Arabic for children (${ageInfo.en}) about "${input.topic}".

Include:
- 3-4 learning objectives (Arabic with English)
- 5-6 simple materials needed
- Detailed timeline with activities:
  1. Icebreaker (10 min)
  2. Main activities (${parseInt(input.duration) - 20} min)
  3. Wrap-up (10 min)
- Each activity needs: time, title, description, instructions, tips
- 4-5 facilitator notes

Context: Cultural center "Leader Kid" club in Tunisia. Focus on building confidence and leadership skills.

Return as structured JSON matching the WorkshopPlanData type.`;
}
