/**
 * OpenAI Provider Implementation
 *
 * Implements the AIProvider interface using OpenAI's GPT models.
 */

import OpenAI from "openai";
import {
    AIProvider,
    ModelConfig,
    WorkshopInput,
    WorkshopPlanData,
    WorkshopActivity,
    WorkshopIdea,
    DailyTip,
    PosterInput,
    PosterOutput,
    InvalidAPIKeyError,
    RateLimitError,
    AIError,
} from "./base";

// Import prompt building logic from existing implementation
import { buildGameExamplesPrompt, ANTI_REPETITION_RULES, getTopicGames } from "../gameLibrary";

// Age descriptors used in prompts
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
    "8-14": {
        ar: "8-14 سنة",
        en: "8-14 years old",
        characteristics: "varied attention spans (15-25 min), enjoy team competitions, need challenging activities, like feeling grown-up",
    },
    "mixed": {
        ar: "أعمار مختلطة (6-14 سنة)",
        en: "mixed ages (6-14 years old)",
        characteristics: "varied needs, pair older with younger, flexible activities",
    },
};

export class OpenAIProvider implements AIProvider {
    name = "openai";
    config: ModelConfig;
    private client: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new InvalidAPIKeyError("openai");
        }

        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.config = {
            workshop: "gpt-5.1",
            activities: "gpt-5-mini",
            maxTokensWorkshop: 24000,
            maxTokensActivity: 2000,
            reasoning: { reasoning_effort: "low" },
        };
    }

    async generateWorkshopPlan(input: WorkshopInput): Promise<WorkshopPlanData> {
        const ageInfo = AGE_DESCRIPTORS[input.ageRange];
        const durationNum = parseInt(input.duration);

        // Build materials context for the prompt
        const materialsContext = input.selectedMaterialNames && input.selectedMaterialNames.length > 0
            ? `\n\nAvailable Materials (MUST design activities using these):\n${input.selectedMaterialNames.map(m => `- ${m}`).join('\n')}`
            : "\n\nUse common workshop items: balls, scarves, cones, music player, balloons, hula hoops, bean bags, ropes.";

        // Get topic-specific game examples and anti-repetition rules
        const gameExamplesPrompt = buildGameExamplesPrompt(input.topic);
        const topicMapping = getTopicGames(input.topic);

        // Import full prompt from the original implementation
        // This is a simplified version - full prompt is in original openai.ts lines 150-378
        const systemPrompt = `You are **Professor Playful** (البروفيسور المرح), a senior children's workshop designer with 25+ years creating unforgettable educational play experiences for kids aged 6-14 in Tunisia.

# YOUR MISSION
Produce an **ACTION-READY** workshop plan any facilitator can run TODAY. Prioritize:
- 🏃 MOVEMENT: Running, jumping, dancing, physical challenges
- 🤝 TEAMWORK: Group challenges with visible scoring
- 🎭 DRAMA: Role-play, charades, freeze poses, acting
- 🎵 MUSIC: Rhythm games, freeze dance, musical chairs
- 🏆 COMPETITION: Points, teams, winners with celebration

# ⛔ ABSOLUTELY FORBIDDEN (NEVER USE)
❌ Writing activities - NO اكتبوا، دونوا، سجلوا
❌ Coloring/drawing - NO ارسموا، لونوا
❌ Reading activities - NO اقرأوا
❌ Sitting quietly for more than 30 seconds
❌ Discussions where kids just talk (must DO something)
❌ Watching videos/screens
❌ Any passive activity where kids are observers

# ✅ EVERY ACTIVITY MUST BE PHYSICAL
Kids must be:
- Standing, moving, jumping, running, dancing
- Acting, miming, gesturing, posing
- Passing objects, throwing, catching
- Racing, competing physically
- Making sounds, clapping, stomping

# OUTPUT REQUIREMENTS

## ⚠️ CRITICAL: MINIMUM 8 STEPS PER ACTIVITY
Each activity MUST have exactly 8-12 steps. NOT 5, NOT 6. MINIMUM 8.

## Language Rules
- ALL narrative text in ARABIC
- English titles alongside Arabic names

Return ONLY valid JSON matching the WorkshopPlanData interface.`;

        const userPrompt = `# 🎯 WORKSHOP REQUEST

**Topic**: "${input.topic}"
**Duration**: ${durationNum} minutes
**Age Group**: ${ageInfo.ar} (${ageInfo.en})
**Characteristics**: ${ageInfo.characteristics}
${materialsContext}

**Context**: مركز ثقافي "الطفل القائد" ببن عروس - تونس. 10-15 طفل. قاعة داخلية مع مساحة مفتوحة.

---

${gameExamplesPrompt}

${ANTI_REPETITION_RULES.replace('${"{topic}"}', input.topic)}

Generate workshop plan for "${input.topic}" now.`;

        console.log("🎓 [OpenAI] Generating workshop for:", input.topic, "| Duration:", durationNum, "min | Age:", input.ageRange);
        console.log("📚 Using game library with", topicMapping ? topicMapping.exampleGames.length : 0, "topic-specific examples");

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.workshop,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                reasoning_effort: this.config.reasoning.reasoning_effort,
                max_completion_tokens: this.config.maxTokensWorkshop,
                response_format: { type: "json_object" },
            } as any);

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            return this.parseWorkshopPlan(content);
        } catch (error: any) {
            if (error.status === 401) {
                throw new InvalidAPIKeyError("openai");
            }
            if (error.status === 429) {
                throw new RateLimitError("openai");
            }
            throw new AIError(error.message, "GENERATION_ERROR", "openai");
        }
    }

    async regenerateActivity(
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

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.activities,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 1,
                max_tokens: 800,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            return this.parseJSON<WorkshopActivity>(content);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async generateAlternatives(
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

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.activities,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.95,
                max_tokens: 2000,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            return this.parseJSON<WorkshopActivity[]>(content);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async generateIdeas(theme?: string, count: number = 10): Promise<WorkshopIdea[]> {
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

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.activities,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 1,
                max_tokens: 2000,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            return this.parseJSON<WorkshopIdea[]>(content);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async generateDailyTips(topic: string, workshopTitle: string): Promise<DailyTip[]> {
        // This uses a very long prompt - simplified here
        const systemPrompt = `You are a WORLD-CLASS CHILD DEVELOPMENT RESEARCHER and PARENTING EXPERT.

Generate 6 "هل تعلم؟" (Did You Know?) Instagram posts about "${topic}".

Return ONLY a valid JSON array with 6 objects. No markdown code blocks.`;

        const userPrompt = `Generate 6 "هل تعلم؟" posts for parents about: "${topic}"

Each post must include surprising facts, research-backed statistics, and actionable tips.`;

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.activities,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 1,
                max_tokens: 6000,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            const tips = this.parseJSON<DailyTip[]>(content);

            console.log("\n" + "=".repeat(60));
            console.log("📦 [OpenAI] Generated", tips.length, "daily tips for:", topic);
            console.log("=".repeat(60) + "\n");

            return tips;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async enhancePosterPrompt(input: PosterInput): Promise<PosterOutput> {
        const systemPrompt = `You are an expert creative director for children's educational events in Tunisia.

Your task is to analyze a FULL WORKSHOP PLAN and create a RICH, VISUAL SCENE for a poster.

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

Create a specific, unique visual scene. Ensure the prompt explicitly asks for the Arabic title "${input.workshopPlan.title.ar}".
${hasSpecificDate ? `Ask to include the date: ${input.date}` : "Do NOT ask for specific date text yet."}
${input.place ? `Ask to include location: ${input.place}` : ""}
Style: High-end 3D Pixar Style, set in a bright Tunisian cultural club.`;

        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.activities,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 1,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AIError("No response from OpenAI", "NO_RESPONSE", "openai");
            }

            return this.parseJSON<PosterOutput>(content);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    // Private helper methods

    private parseWorkshopPlan(content: string): WorkshopPlanData {
        try {
            const parsed = JSON.parse(content) as WorkshopPlanData;

            // Ensure backward compatibility: populate timeline from schedule if needed
            if (parsed.schedule && !parsed.timeline) {
                parsed.timeline = parsed.schedule.map(s => s.activity);
            }

            if (!parsed.timeline && parsed.schedule) {
                parsed.timeline = parsed.schedule.map(s => ({
                    ...s.activity,
                    timeRange: s.activity.timeRange || `${s.startMinute}-${s.endMinute} دقيقة`,
                }));
            }

            console.log("✅ [OpenAI] Workshop plan generated successfully with", parsed.timeline?.length || 0, "activities");
            return parsed;
        } catch (parseError) {
            console.error("❌ JSON Parse Error. Content preview:", content.substring(0, 500));

            // Try to extract JSON from the response
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                content.match(/```\s*([\s\S]*?)\s*```/) ||
                content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                try {
                    return JSON.parse(jsonStr) as WorkshopPlanData;
                } catch {
                    console.error("Secondary parse also failed");
                }
            }

            throw new AIError(`Failed to parse workshop plan JSON: ${parseError}`, "PARSE_ERROR", "openai");
        }
    }

    private parseJSON<T>(content: string): T {
        try {
            return JSON.parse(content) as T;
        } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as T;
            }
            throw new AIError("Failed to parse JSON", "PARSE_ERROR", "openai");
        }
    }

    private handleError(error: any): never {
        if (error.status === 401) {
            throw new InvalidAPIKeyError("openai");
        }
        if (error.status === 429) {
            throw new RateLimitError("openai");
        }
        throw new AIError(error.message, "GENERATION_ERROR", "openai");
    }
}
