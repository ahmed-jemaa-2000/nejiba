/**
 * OpenAI Client Wrapper for Nejiba Studio
 *
 * Provides typed functions for workshop generation and activity regeneration.
 *
 * v3.0 - TRANSFORMED: Diverse activity types, clarity-first, life skills focused
 * Changes:
 * - New activity type taxonomy (11 types vs 5 game types)
 * - 3-5 steps MAX per activity (was 8-12)
 * - Emphasis on making/crafting/reflection (not just games)
 * - Validation for diversity, energy balance, clarity
 */

import OpenAI from "openai";
import { buildActivityExamplesPrompt } from "./activityLibrary";
import { buildWorkshopSystemPrompt, buildWorkshopUserPrompt, buildWorkshopJSONSystemPrompt, buildWorkshopJSONUserPrompt, WorkshopPromptConfig } from "./prompts/workshopSystemPrompt";
import { buildPDFReadySystemPrompt, buildPDFReadyUserPrompt, PDF_AGE_DESCRIPTORS } from "./prompts/pdfReadyWorkshopPrompt";
import {
    validateActivityDiversity,
    validateEnergyBalance,
    ActivityType
} from "./activityTypes";

// Import types from base.ts (unified interface with new V3 fields)
import type {
    WorkshopInput,
    WorkshopActivity,
    WorkshopPlanData,
    ScheduleBlock
} from "./providers/base";

// Re-export for backward compatibility
export type { WorkshopInput, WorkshopActivity, WorkshopPlanData, ScheduleBlock };

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function cleanContentForJson(content: string): string {
    return content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
}

function extractJsonString(content: string, wantArray: boolean): string | null {
    const fenced =
        content.match(/```json\s*([\s\S]*?)\s*```/i) ||
        content.match(/```\s*([\s\S]*?)\s*```/);
    if (fenced) return fenced[1].trim();

    const loose = wantArray
        ? content.match(/\[[\s\S]*\]/)
        : content.match(/\{[\s\S]*\}/);
    return loose ? loose[0].trim() : null;
}

function parseJsonFromModel<T>(content: string, wantArray: boolean): T {
    const cleaned = cleanContentForJson(content);
    const jsonStr = extractJsonString(cleaned, wantArray) || cleaned;
    return JSON.parse(jsonStr) as T;
}

function getMandatoryWorkshopValidationErrors(plan: WorkshopPlanData): string[] {
    const errors: string[] = [];
    const timeline = plan.timeline || plan.schedule?.map((s: ScheduleBlock) => s.activity) || [];

    timeline.forEach((activity: WorkshopActivity, index: number) => {
        const activityId = `Activity ${index + 1} ("${activity.title}")`;

        if (!activity.activityType) {
            errors.push(`${activityId}: Missing activityType field`);
        }

        const steps = activity.mainSteps || activity.instructions || [];
        if (steps.length < 3) {
            errors.push(`${activityId}: mainSteps has only ${steps.length} steps (need 3-5)`);
        }
        if (steps.length > 6) {
            errors.push(`${activityId}: mainSteps has ${steps.length} steps (need 3-5, max 6 allowed)`);
        }
        if (!activity.mainSteps) {
            errors.push(`${activityId}: Using old 'instructions' field instead of 'mainSteps'`);
        }

        if (!activity.lifeSkillsFocus || activity.lifeSkillsFocus.length === 0) {
            errors.push(`${activityId}: Missing lifeSkillsFocus array`);
        }

        if (!activity.confidenceBuildingMoment || activity.confidenceBuildingMoment.trim() === "") {
            errors.push(`${activityId}: Missing confidenceBuildingMoment field`);
        }

        if (!activity.visualCues || activity.visualCues.length < 3) {
            errors.push(`${activityId}: Missing visualCues array (need minimum 3 items)`);
        }

        if (!activity.spokenPhrases || activity.spokenPhrases.length < 3) {
            errors.push(`${activityId}: Missing spokenPhrases array (need minimum 3 items)`);
        }

        if (!activity.whatYouNeed || activity.whatYouNeed.length === 0) {
            errors.push(`${activityId}: Missing whatYouNeed materials array`);
        }

        if (!activity.whyItMatters || activity.whyItMatters.trim() === "") {
            errors.push(`${activityId}: Missing whyItMatters field`);
        }

        if (!activity.energyLevel) {
            errors.push(`${activityId}: Missing energyLevel field`);
        }

        if (!activity.complexityLevel) {
            errors.push(`${activityId}: Missing complexityLevel field`);
        }

        if (activity.estimatedSteps == null) {
            errors.push(`${activityId}: Missing estimatedSteps field`);
        } else if (activity.mainSteps && activity.estimatedSteps !== activity.mainSteps.length) {
            errors.push(`${activityId}: estimatedSteps (${activity.estimatedSteps}) does not match mainSteps length (${activity.mainSteps.length})`);
        }
    });

    return errors;
}

type PromptOutputFormat = "json" | "text";

function buildWorkshopTextSystemPrompt(config: WorkshopPromptConfig): string {
    return `You are a WORLD-CLASS CHILDREN'S WORKSHOP DESIGNER specializing in LIFE SKILLS DEVELOPMENT for Tunisian cultural centers.

# YOUR CORE MISSION:
Design ${config.durationMinutes}-minute workshops that help kids develop:
- Confidence: "I can do this!"
- Bravery: "I'll try even if I'm scared"
- Friendship: "I belong with others"

# CRITICAL DESIGN PRINCIPLES (FOLLOW ALL)

1) CLARITY IS EVERYTHING
- Each activity MUST have EXACTLY 3–5 mainSteps.
- One concrete action per step, in Arabic, kid-level language.
- No abstract steps, no multi-actions in one step.
- Include visualCues (3+) and spokenPhrases (3+) for every activity.

2) DIVERSE ACTIVITY TYPES
- 6 blocks = 6 DIFFERENT activityType values (no repetition).
- Block 3 MUST be a making/creating activity where kids produce something tangible.
- Block 5 MUST be calm reflective/sharing.

3) ENERGY BALANCE
- Mix high / medium / low energy.
- Do not make the whole workshop high energy.

4) MATERIALS
- Use only cheap, accessible materials (recyclables + basic craft supplies).
${config.materialsContext}

# WORKSHOP STRUCTURE (6 blocks in this order)
1. Welcome Circle (~10%)
2. Explore (~20%)
3. Create & Try (~30%) **MAKING/CREATING**
4. Move & Energize (~15%) **HIGH ENERGY, SIMPLE**
5. Reflect & Share (~15%) **LOW ENERGY, PAIRS/SMALL GROUPS**
6. Celebrate & Close (~10%)

${config.activityLibraryPrompt}

# OUTPUT FORMAT (TEXT ONLY)
Return a clear, structured workshop plan in Arabic TEXT. DO NOT return JSON or code blocks.
Use this exact layout:

1) Workshop Title (Arabic) + TitleEn
2) General Info: duration, age group, participants, level
3) Objectives: 5+ bullet points
4) Materials: 8+ bullets

Then for each Block 1–6:
- Time range
- Block name
- Activity title (Arabic) + titleEn
- activityType (one of the app ActivityType values)
- energyLevel (high/medium/low)
- whatYouNeed (materials in Arabic)
- description (1–2 Arabic sentences)
- mainSteps: 3–5 numbered Arabic steps (ONE action each)
- visualCues: 3+ bullets
- spokenPhrases: 3+ exact Arabic phrases facilitator says
- lifeSkillsFocus: 2–3 skills
- confidenceBuildingMoment (exact moment kids feel proud)
- whyItMatters (one Arabic sentence)
- variations (optional)
- safetyTips (short)
- debriefQuestions (2–3)

Finally:
Facilitator Notes (beforeWorkshop, duringWorkshop).

Before answering, silently self-check every rule and fix any violation.`;
}

function buildWorkshopTextUserPrompt(topic: string, durationMinutes: number, ageInfo: { ar: string; en: string }): string {
    return `# NEW WORKSHOP REQUEST (TEXT OUTPUT)

Topic: "${topic}"
Duration: ${durationMinutes} minutes
Age Group: ${ageInfo.ar} (${ageInfo.en})
Context: Cultural center, 10-15 kids, limited budget

Generate the complete plan now in clear Arabic text (NOT JSON), following all rules above.`;
}

/**
 * Generate a complete workshop plan using GPT-5-mini
 * v3.0 - TRANSFORMED: Diverse activity types, clarity-first (3-5 steps), life skills focused
 *
 * Major Changes:
 * - Uses new activity taxonomy (11 types: making, art, reflection, storytelling, etc.)
 * - Enforces 3-5 steps MAX per activity (down from 8-12)
 * - Requires confidence-building moments and life skills alignment
 * - Validates diversity (min 4 different activity types)
 * - Validates energy balance (not all high-energy games)
 */
export async function generateWorkshopPlan(input: WorkshopInput): Promise<WorkshopPlanData> {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];
    const durationNum = parseInt(input.duration);

    // Build materials context emphasizing CRAFT and CREATIVE materials
    const materialsContext = input.selectedMaterialNames && input.selectedMaterialNames.length > 0
        ? `\n\n# 📦 AVAILABLE MATERIALS (MUST USE THESE IN ACTIVITIES):\n${input.selectedMaterialNames.map(m => `- ${m}`).join('\n')}\n\n**IMPORTANT**: Design activities that CREATIVELY USE these materials - especially craft supplies!`
        : `\n\n# 📦 RECOMMENDED MATERIALS:\n
**Craft & Making:**
- Recyclables: plastic cups, cardboard boxes, bottle caps, newspapers
- Basic craft: colored paper, scissors, glue, markers, tape
- Process art: string, paint, sponges, cotton balls, bubble solution

**Movement:**
- Balls, balloons, scarves, cones, hula hoops, bean bags

**Reflection:**
- Cushions, emotion cards, story cards

**FOCUS**: Use cheap, accessible materials for creative MAKING activities (not just games)!`;

    // Get topic-specific ACTIVITY examples (new system - not just games!)
    const activityLibraryPrompt = buildActivityExamplesPrompt(input.topic);

    // Build prompt configuration
    const promptConfig: WorkshopPromptConfig = {
        durationMinutes: durationNum,
        ageRange: input.ageRange,
        ageDescriptionAr: ageInfo.ar,
        ageDescriptionEn: ageInfo.en,
        activityLibraryPrompt,
        materialsContext
    };

    // ============================================
    // NEW: Use PDF-Ready prompts with kidsBenefits
    // ============================================
    const usePDFReadyPrompts = true; // Enable new prompt system

    let systemPrompt: string;
    let userPrompt: string;

    if (usePDFReadyPrompts) {
        // NEW: PDF-ready prompts with kidsBenefits, activityBenefits, parentTips
        const pdfConfig = {
            topic: input.topic,
            durationMinutes: durationNum,
            ageRange: input.ageRange,
            ageDescriptionAr: ageInfo.ar,
            ageDescriptionEn: ageInfo.en,
            selectedMaterials: input.selectedMaterialNames
        };
        systemPrompt = buildPDFReadySystemPrompt(pdfConfig);
        userPrompt = buildPDFReadyUserPrompt(pdfConfig);
        console.log("🌟 Using PDF-Ready prompts WITH kidsBenefits, activityBenefits, parentTips");
    } else {
        // Legacy prompts (no kidsBenefits)
        systemPrompt = buildWorkshopSystemPrompt(promptConfig);
        userPrompt = buildWorkshopUserPrompt(input.topic, durationNum, ageInfo);
    }

    console.log("🎓 V3.0 Generating workshop for:", input.topic, "| Duration:", durationNum, "min | Age:", input.ageRange);

    // DEBUG: Log prompts (remove in production)
    // console.log("\n========== SYSTEM PROMPT ==========\n", systemPrompt.substring(0, 500), "\n... [truncated]\n");

    // Model options (ranked by value for this use case):
    // 1. "gpt-5-mini"  - $0.006/workshop - BEST VALUE ✅
    // 2. "gpt-5-nano"   - $0.004/workshop - CHEAPEST (33% cheaper, test quality first)
    // 3. "gpt-5-mini"   - $0.021/workshop - PREMIUM (3.5x more, newer knowledge Oct 2024)
    const baseMessages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
    ];

    let lastFailure: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model: DEFAULT_OPENAI_MODEL, // Allow override via OPENAI_MODEL
                messages: attempt === 0
                    ? baseMessages
                    : [
                        ...baseMessages,
                        {
                            role: "user",
                            content:
                                `Your previous JSON failed mandatory validation. Fix ALL issues below and regenerate the FULL workshop plan.\n` +
                                `Return ONLY valid JSON.\n\nIssues:\n${lastFailure?.message}`
                        }
                    ],
                max_completion_tokens: 24000,
                response_format: { type: "json_object" },
                temperature: 0.8,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
                throw new Error("No response from OpenAI");
            }

            const parsed = parseJsonFromModel<WorkshopPlanData>(content, false);

            // Ensure objectives exists (fallback from learningObjectives)
            if (!parsed.objectives && parsed.learningObjectives) {
                parsed.objectives = parsed.learningObjectives.map(obj => ({
                    ar: obj,
                    en: ""
                }));
            } else if (!parsed.objectives) {
                parsed.objectives = [];
            }

            // Ensure backward compatibility: populate timeline from schedule if needed
            if (parsed.schedule && !parsed.timeline) {
                parsed.timeline = parsed.schedule.map((s: ScheduleBlock) => s.activity);
            }

            // Ensure timeline exists for backward compatibility
            if (!parsed.timeline && parsed.schedule) {
                parsed.timeline = parsed.schedule.map((s: ScheduleBlock) => ({
                    ...s.activity,
                    timeRange: s.activity.timeRange || `${s.startMinute}-${s.endMinute} دقيقة`,
                }));
            }

            // ========== V3.0 MANDATORY FIELD VALIDATION ==========
            // Reject workshop if critical fields are missing - FORCE AI to use detailed format
            console.log("🔍 V3.0 Validating mandatory fields...");

            const validationErrors = getMandatoryWorkshopValidationErrors(parsed);

            // If validation errors exist, throw error and force regeneration
            if (validationErrors.length > 0) {
                console.error("❌ V3.0 Validation FAILED - Missing required fields:");
                validationErrors.forEach(err => console.error(`  - ${err}`));

                throw new Error(
                    `Generated workshop missing required V3 fields:\n${validationErrors.join('\n')}\n\n` +
                    `The AI must include: activityType, mainSteps (3-5 items), lifeSkillsFocus, ` +
                    `confidenceBuildingMoment, visualCues (3+), spokenPhrases (3+), whatYouNeed, whyItMatters, ` +
                    `energyLevel, complexityLevel, estimatedSteps for EVERY activity.`
                );
            }

            console.log("✅ V3.0 Mandatory fields validation passed!");

            // ========== V3.0 POST-GENERATION VALIDATION (QUALITY WARNINGS) ==========
            const validationIssues: string[] = [];

            if (parsed.timeline && parsed.timeline.length > 0) {
                // V3.0: Check activity type diversity (NEW - most important!)
                const activityTypes = parsed.timeline
                    .map(a => a.activityType)
                    .filter(Boolean) as ActivityType[];

                if (activityTypes.length > 0) {
                    const diversityResult = validateActivityDiversity(activityTypes);
                    if (!diversityResult.isValid) {
                        validationIssues.push(diversityResult.message);
                    } else {
                        console.log(diversityResult.message);
                    }
                }

                // V3.0: Check energy balance (NEW)
                if (activityTypes.length > 0) {
                    const energyResult = validateEnergyBalance(activityTypes);
                    if (!energyResult.isValid) {
                        validationIssues.push(energyResult.message);
                    } else {
                        console.log(energyResult.message);
                    }
                }

                // V3.0: Check step counts (CLARITY VALIDATION - NEW!)
                parsed.timeline.forEach((activity, i) => {
                    const stepCount = activity.mainSteps?.length || activity.instructions?.length || 0;
                    if (stepCount > 6) {
                        validationIssues.push(`⚠️ Activity ${i + 1} "${activity.title}" has ${stepCount} steps (should be 3-5 for clarity)`);
                    }
                    if (!activity.lifeSkillsFocus || activity.lifeSkillsFocus.length === 0) {
                        validationIssues.push(`⚠️ Activity ${i + 1} missing life skills focus`);
                    }
                    if (!activity.confidenceBuildingMoment) {
                        validationIssues.push(`⚠️ Activity ${i + 1} missing confidence-building moment`);
                    }
                });

                // V3.0: Check for creative/making activities (NEW REQUIREMENT)
                const creativeTypes = activityTypes.filter(t =>
                    t === "صنع وإبداع" || t === "فن وتعبير"
                );
                if (creativeTypes.length === 0) {
                    validationIssues.push(`⚠️ NO creative making activities (required at least 1)`);
                } else {
                    console.log(`✅ Good: ${creativeTypes.length} creative/making activities found`);
                }

                // Check for repetitive activity titles (keep from old system)
                const titles = parsed.timeline.map(a => a.title.toLowerCase().replace(/[0-9]/g, '').trim());
                const uniqueTitles = new Set(titles);
                if (uniqueTitles.size < titles.length * 0.7) {
                    validationIssues.push("⚠️ Repetitive activity titles detected");
                }
            }

            // Check objectives count
            if (parsed.objectives && parsed.objectives.length < 4) {
                validationIssues.push(`⚠️ Only ${parsed.objectives.length} objectives (should be 5+)`);
            }

            // Check materials count
            if (parsed.materials && parsed.materials.length < 5) {
                validationIssues.push(`⚠️ Only ${parsed.materials.length} materials (should be 8+)`);
            }

            // Log validation results
            if (validationIssues.length > 0) {
                console.log("\n⚠️ V3.0 QUALITY VALIDATION WARNINGS:");
                validationIssues.forEach(issue => console.log("  ", issue));
            } else {
                console.log("\n✅ V3.0 Quality validation passed - excellent diversity and clarity!");
            }

            console.log("✅ Workshop plan generated successfully with", parsed.timeline?.length || parsed.schedule?.length || 0, "activities");
            return parsed;
        } catch (e) {
            lastFailure = e instanceof Error ? e : new Error(String(e));
            console.error(`Workshop generation attempt ${attempt + 1} failed`, lastFailure);
            if (attempt === 0) continue;
            throw lastFailure;
        }
    }

    throw lastFailure || new Error("Failed to generate workshop plan");
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

    const _legacySystemPrompt = `You are an expert workshop facilitator. Generate a SINGLE workshop activity in Arabic.

Return ONLY valid JSON (no markdown):
{
  "timeRange": "${currentActivity.timeRange}",
  "title": "عنوان جديد",
  "titleEn": "New Title",
  "description": "وصف النشاط",
  "instructions": ["خطوة 1", "خطوة 2", "خطوة 3", "خطوة 4"],
  "facilitatorTips": "نصيحة للميسر"
}`;

    const systemPrompt = `You are an expert workshop facilitator. Generate a SINGLE workshop activity in Arabic using the NEW V3 schema.

Return ONLY valid JSON (no markdown). REQUIRED fields for this activity:
{
  "timeRange": "${currentActivity.timeRange}",
  "title": "Arabic short title",
  "titleEn": "English title",
  "description": "Arabic description (1-2 sentences)",
  "blockType": "${currentActivity.blockType || ""}",

  "activityType": "One of the ActivityType values used in this app",
  "energyLevel": "high" | "medium" | "low",
  "complexityLevel": "simple" | "moderate" | "complex",

  "whatYouNeed": ["materials in kid-friendly Arabic"],
  "mainSteps": ["Step 1", "Step 2", "Step 3"],
  "estimatedSteps": 3,
  "visualCues": ["cue1", "cue2", "cue3"],
  "spokenPhrases": ["phrase1", "phrase2", "phrase3"],

  "lifeSkillsFocus": ["confidence", "bravery", "friendship"],
  "confidenceBuildingMoment": "Describe the exact moment confidence grows",
  "whyItMatters": "One Arabic sentence on developmental benefit",

  "facilitatorTips": "Arabic facilitator tip",
  "variations": ["optional variation 1", "optional variation 2"],
  "safetyTips": "Arabic safety note",
  "debriefQuestions": ["question1", "question2"]
}

CRITICAL:
- Use "mainSteps" NOT "instructions".
- mainSteps must be 3-5 items.
- estimatedSteps must equal mainSteps length.`;

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
        model: DEFAULT_OPENAI_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 3000,
        response_format: { type: "json_object" },
        temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        return parseJsonFromModel<WorkshopActivity>(content, false);
    } catch (e) {
        throw new Error(`Failed to parse activity JSON: ${e}`);
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

    const _legacySystemPrompt = `You are an expert workshop facilitator. Generate 3 DIFFERENT activity alternatives in Arabic.

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

    const systemPrompt = `You are an expert workshop facilitator. Generate 3 DIFFERENT activity alternatives in Arabic using the NEW V3 schema.

Return ONLY a JSON array of 3 objects (no markdown). Each object MUST include:
- timeRange (same as slot)
- title (Arabic), titleEn (English), description (Arabic)
- activityType, energyLevel, complexityLevel
- whatYouNeed, mainSteps (3-5), estimatedSteps, visualCues (3+), spokenPhrases (3+)
- lifeSkillsFocus, confidenceBuildingMoment, whyItMatters
- facilitatorTips, variations, safetyTips, debriefQuestions

CRITICAL:
- Use "mainSteps" NOT "instructions".
- Make each alternative clearly different from the current activity and from each other.`;

    const userPrompt = `Generate 3 DIFFERENT alternative activities for this slot in a "${topic}" workshop:

Time slot: ${currentActivity.timeRange}
Current activity: ${currentActivity.title}
Age group: ${workshopPlan.generalInfo.ageGroup}
Position: Activity ${activityIndex + 1} of ${workshopPlan.timeline.length}

Make each alternative unique and creative!`;

    const completion = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 7000,
        temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        return parseJsonFromModel<WorkshopActivity[]>(content, true);
    } catch (e) {
        throw new Error(`Failed to parse alternatives JSON: ${e}`);
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
        model: DEFAULT_OPENAI_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4000,
        temperature: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        return parseJsonFromModel<WorkshopIdea[]>(content, true);
    } catch (e) {
        throw new Error(`Failed to parse ideas JSON: ${e}`);
    }
}

/**
 * Generate an enhanced visual description for a poster based on workshop details
 */
/**
 * Generate an enhanced visual description for a poster based on workshop details
 */


/**
 * Video segment for Sora-2 generation (max 15 seconds each)
 */
export interface VideoSegment {
    segmentNumber: number;          // 1-4
    duration: number;                // 10-15 seconds
    soraPrompt: string;             // Detailed Sora-2 prompt (main field!)
    sceneDescription: string;        // What happens (Arabic)
    visualElements: string[];        // Key visual elements
    cameraMovement: string;          // "pan right", "zoom in", etc.
    mood: string;                    // "joyful", "calm", "energetic"
    voiceoverText: string;           // Arabic narration
}

/**
 * Video content collection for each daily tip (4 segments = ~54 seconds)
 */
export interface DailyVideoContent {
    day: number;                     // 1-6
    theme: string;                   // "brain science", "teamwork", etc.
    segments: VideoSegment[];        // ALWAYS 4 segments
    transitionNotes: string;         // How to combine (Arabic)
}

/**
 * Generate 6 high-quality Instagram-ready daily tips based on the workshop topic
 */
export interface DailyTip {
    day: number;
    title: string; // Arabic title (short, catchy)
    titleEn: string; // English title
    content: string; // Detailed Arabic advice (3-5 sentences)
    instagramCaption: string; // Ready-to-post Instagram caption with emojis and hashtags
    instagramStoryText: string; // Short text for Instagram stories (1-2 sentences)
    imagePrompt: string; // English prompt for image generation with Arabic text
    videoContent: DailyVideoContent; // NEW: Sora-2 video prompts
}

export async function generateDailyTips(topic: string, workshopTitle: string): Promise<DailyTip[]> {
    const systemPrompt = `You are a WORLD-CLASS CHILD DEVELOPMENT RESEARCHER and PARENTING EXPERT.
You have PhD-level knowledge in:
- Developmental psychology (Piaget, Vygotsky, Montessori)
- Neuroscience of child brain development
- Positive parenting research (Gottman, Siegel)
- Emotional intelligence (Goleman)
- Play-based learning science

🎯 YOUR MISSION:
Generate 6 "هل تعلم؟" (Did You Know?) Instagram posts about "${topic}" that will AMAZE parents with research-backed facts they've never heard before.

📌 THIS WEEK'S WORKSHOP: "${workshopTitle}"

🧠 CONTENT REQUIREMENTS:
Each post MUST include:
1. A SURPRISING research-backed insight or finding (focus on general principles, NO percentages or statistics)
2. The SCIENCE behind why this matters for child development
3. ONE ACTIONABLE TIP parents can do TODAY (specific, not generic)

📱 FORMAT FOR EACH POST:

1. **day** (1-6)
2. **title** (Arabic) - Start with "هل تعلم؟" + the surprising fact
   Example: "هل تعلم أن تعاون الأطفال يبني مهارات قيادية مدى الحياة؟"
3. **titleEn** - English translation
4. **content** (Arabic, 6-8 sentences):
   - Sentence 1: The surprising research-backed insight
   - Sentences 2-3: The science/research behind it
   - Sentences 4-5: Why this matters for YOUR child specifically
   - Sentences 6-7: EXACTLY what to do (step-by-step)
   - Sentence 8: Encouraging closing
5. **instagramCaption** (Arabic + emojis):
   - Hook: "🧠 هل تعلم أن..." 
   - The fact + why it matters
   - "💡 جرّب اليوم:" + specific action
   - Hashtags: #هل_تعلم #تربية_إيجابية #نمو_الطفل #الطفل_القائد #دار_الثقافة_بن_عروس
6. **instagramStoryText** - One punchy line with emoji
7. **imagePrompt** (English) - REALISTIC PARENT-CHILD SCENE WITH TEXT:

   CREATE A CINEMATIC 3D SCENE showing:
   - A Tunisian parent (mother OR father) with their child (age 6-10)
   - They are ACTIVELY DOING the specific activity from the tip
   - EMOTION: Joy, wonder, connection, discovery moment
   - SETTING: Warm Mediterranean Tunisian home with:
     * Traditional colorful tiles (zellige)
     * Warm golden sunlight streaming in
     * Cozy, lived-in family atmosphere
   - STYLE: Pixar/Disney 3D animation quality
   - LIGHTING: Golden hour, soft shadows, warm tones
   - CAMERA: Medium shot showing both parent and child's expressions
   
   ✨ TEXT OVERLAY (MUST INCLUDE):
   - TOP: "يوم [1-6]" in elegant gold Arabic calligraphy
   - MIDDLE/BOTTOM: "هل تعلم؟" as stylized text badge
   - CORNER: "الطفل القائد" small branding
   - Text integrated beautifully into the design with readable contrast

🎬 VIDEO CONTENT REQUIREMENTS (CRITICAL - REQUIRED FOR ALL TIPS):

For each of the 6 days, create EXACTLY 4 video segments for Sora-2:

**Segment Structure (MANDATORY 4 segments):**
- Segment 1 (12 sec): Opening Hook - Capture attention, establish setting
- Segment 2 (15 sec): Main Concept - Show developmental principle in action
- Segment 3 (15 sec): Practical Example - Real-life demonstration with interaction
- Segment 4 (12 sec): Call-to-Action - Encourage parents to try today
- **Total**: 54 seconds per day

**Sora-2 Prompt Requirements (VERY IMPORTANT):**
- Style: Cinematic 3D Pixar/Disney animation quality
- Characters: Tunisian parent + child (age 6-10)
- Setting: Warm Mediterranean home with traditional blue zellige tiles
- Lighting: Golden hour, warm afternoon sun
- Camera: Describe specific movements (dolly, zoom, arc, push)
- Emotions: Explicitly state emotions (joy, curiosity, pride, love)
- Actions: Be VERY specific about what characters DO
- Duration: End each prompt with "Duration: X seconds"
- Quality: Rich detail, professional cinematography language

**Example Excellent Segment:**
{
  "segmentNumber": 2,
  "duration": 15,
  "soraPrompt": "Cinematic 3D Pixar scene: A Tunisian mother and 8-year-old son sit cross-legged on a traditional woven rug in their living room. Blue zellige tiles frame an arched doorway behind them. The mother holds up a colorful storybook while the boy points excitedly at illustrations. Golden afternoon light streams through the window. The mother's eyes light up as she follows his finger, nodding with encouragement. The boy's face shows pure wonder and engagement. Camera: Medium shot, slow 30-degree arc around them. Emotion: connection, curiosity, shared discovery. Style: Warm Pixar animation with soft rim lighting. Duration: 15 seconds.",
  "sceneDescription": "الأم والطفل يتشاركان قراءة قصة، مما يعزز التواصل والخيال",
  "visualElements": ["storybook", "pointing gesture", "eye contact", "zellige tiles", "warm rug", "golden light"],
  "cameraMovement": "30-degree arc around subjects",
  "mood": "curious, engaged",
  "voiceoverText": "القراءة المشتركة تبني مهارات اللغة والخيال بطريقة ممتعة"
}

**JSON Structure:**
Each day MUST have "videoContent" object with:
- day: number (1-6)
- theme: string (developmental focus like "teamwork", "emotional intelligence", "creativity")
- segments: array of EXACTLY 4 VideoSegment objects
- transitionNotes: string (Arabic - how to combine segments, e.g., "استخدم تحولات crossfade بسيطة (0.5 ثانية) بين المشاهد")

⚠️ CRITICAL: Generate videoContent for ALL 6 days. This is a REQUIRED field.

🎯 THE 6-DAY "هل تعلم؟" THEMES:

Day 1 - 🧠 BRAIN SCIENCE:
"How does ${topic} affect brain development?"
Include: neural pathways, brain regions, developmental windows

Day 2 - 💡 FUTURE BENEFITS:
"How does ${topic} lead to future success?"
Include: studies on successful adults, career benefits, life skills

Day 3 - 🏠 HOME ENVIRONMENT:
"How does the home environment affect ${topic}?"
Include: what parents can change at home, environmental factors

Day 4 - ❤️ PARENT-CHILD BONDING:
"How does ${topic} strengthen parent-child connection?"
Include: attachment research, oxytocin, quality time science

Day 5 - 🎮 PLAY-BASED LEARNING:
"How does play develop ${topic}?"
Include: structured vs free play, specific games, time recommendations

Day 6 - 🌟 LONG-TERM OUTCOMES:
"What research says about ${topic} and life success?"
Include: longitudinal studies, famous examples, encouraging insights

🔧 JSON FORMATTING:
- Return ONLY valid JSON with NO extra spaces in Arabic text
- Ensure all quotes and commas are properly placed
- Double-check JSON structure before returning
- Each Arabic word should have NO spaces inserted in the middle

Return ONLY a valid JSON array with 6 objects. No markdown code blocks.`;

    const userPrompt = `Generate 6 "هل تعلم؟" posts for parents about: "${topic}"

⚠️ QUALITY REQUIREMENTS:
- Each fact must be SURPRISING (something parents don't already know)
- Focus on general research-backed principles and actionable insights (NO percentages, NO statistics, NO numbers)
- The actionable tip must be SPECIFIC (not "play with your child" but "play the mirror game for 10 minutes before bedtime")
- Image prompts must describe a SPECIFIC scene with the parent and child DOING something

⚠️ CRITICAL: Do NOT include specific percentages, statistics, or numbers in the tips. Focus ONLY on general developmental principles.

🎨 IMAGE PROMPT EXAMPLES:

For "الذكاء العاطفي":
"A heartwarming Pixar-style 3D scene: A Tunisian mother sits cross-legged on a colorful Berber rug with her 7-year-old daughter. They are playing the 'emotion faces' game - the mother makes a sad face while the daughter tries to guess the emotion. Both are laughing. Sunlight pours through an arched window with traditional blue tiles. TEXT OVERLAY: 'يوم 4' in elegant gold Arabic calligraphy at top, 'هل تعلم؟' as stylized badge, 'الطفل القائد' small logo."

For "الإبداع":
"A joyful Pixar-style 3D scene: A Tunisian father and his 8-year-old son are building a cardboard rocket ship together in their living room. The father holds the box while the son paints stars on it with bright colors. Paint splatters on their hands and clothes show they're having fun. Mediterranean home with terracotta tiles. TEXT OVERLAY: 'يوم 5' in gold calligraphy at top, 'هل تعلم؟' badge, 'الطفل القائد' small logo in corner."

Generate the 6 posts now:`;

    const completion = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 24000, // Increased for video content: ~12K reasoning + ~12K output
        temperature: 0.95,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        const tips = parseJsonFromModel<DailyTip[]>(content, true);

        // 🎬 VIDEO CONTENT CHECK
        console.log("\n🎬 VIDEO CONTENT CHECK:");
        tips.forEach((tip, i) => {
            if (tip.videoContent) {
                console.log(`  ✅ Day ${i + 1}: ${tip.videoContent.segments?.length || 0} segments`);
            } else {
                console.log(`  ❌ Day ${i + 1}: NO VIDEO CONTENT`);
            }
        });

        // 📊 LOG THE GENERATED CONTENT FOR DEBUGGING
        console.log("\n" + "=".repeat(60));
        console.log("📦 جدول المحتوى الأسبوعي - GENERATED CONTENT KIT");
        console.log("=".repeat(60));
        console.log(`📌 Topic: ${topic}`);
        console.log(`📌 Workshop: ${workshopTitle}`);
        console.log("-".repeat(60));

        tips.forEach((tip, index) => {
            console.log(`\n📅 يوم ${index + 1}: ${tip.title}`);
            console.log(`   📝 ${tip.titleEn || ''}`);
            console.log(`   📱 Instagram: ${(tip.instagramCaption || '').substring(0, 80)}...`);
            console.log(`   🎨 Image: ${(tip.imagePrompt || '').substring(0, 100)}...`);
            console.log(`   🎬 Video: ${tip.videoContent ? `✅ ${tip.videoContent.segments?.length || 0} segments` : '❌ MISSING'}`);
        });

        console.log("\n" + "=".repeat(60) + "\n");

        return tips;
    } catch (e) {
        console.error("Failed to parse daily tips JSON", e);
        console.error("Raw content:", content);
        throw new Error("Failed to generate tips");
    }
}

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

    const userPrompt = `Analyze this plan and create a poster visualization:
    
    Topic: ${input.topic}
    Title: ${input.workshopPlan.title.ar}
    
    Logistic Details (MUST BE INCLUDED IN IMAGE TEXT if available):
    - Date: ${input.date || "(To Be Verified)"}
    - Time: ${input.time || "(To Be Verified)"}
    - Location: ${input.place || "Dar Takafa Ben Arous"}
    
    Workshop Highlights:
    ${input.workshopPlan.timeline.slice(0, 3).map(a => `- ${a.title}: ${a.description}`).join('\n')}
    `;

    const model = DEFAULT_OPENAI_MODEL;

    try {
        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_completion_tokens: 10000,
            response_format: { type: "json_object" },
            temperature: 1,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            console.error("❌ OpenAI Poster Gen Empty. Full Response:", JSON.stringify(completion, null, 2));
            throw new Error("No response from OpenAI");
        }

        // Clean control characters before parsing
        const cleanContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        return JSON.parse(cleanContent);
    } catch (e) {
        console.error("Failed to generate/parse poster prompt", e);
        // Fallback
        return {
            visualPrompt: `A professional poster for ${input.topic} featuring the title "${input.workshopPlan.title.ar}" prominently in Arabic typography, with a ${input.workshopPlan.generalInfo.ageGroup} year old child engaging in creative activities.`,
            explanation: "تصميم يتضمن النص العربي"
        };
    }
}

/**
 * Export the exact V3 workshop prompts for manual use in ChatGPT UI.
 * Useful when you want to run the same prompt with a higher‑tier model.
 */
export function exportWorkshopPromptsForUI(
    input: WorkshopInput,
    format: PromptOutputFormat = "json"
): { systemPrompt: string; userPrompt: string } {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];
    const durationNum = parseInt(input.duration);

    const materialsContext = input.selectedMaterialNames && input.selectedMaterialNames.length > 0
        ? `\n\n# ÐY"Ý AVAILABLE MATERIALS (MUST USE THESE IN ACTIVITIES):\n${input.selectedMaterialNames.map(m => `- ${m}`).join('\n')}\n\n**IMPORTANT**: Design activities that CREATIVELY USE these materials - especially craft supplies!`
        : `\n\n# ÐY"Ý RECOMMENDED MATERIALS:\n
**Craft & Making:**
- Recyclables: plastic cups, cardboard boxes, bottle caps, newspapers
- Basic craft: colored paper, scissors, glue, markers, tape
- Process art: string, paint, sponges, cotton balls, bubble solution

**Movement:**
- Balls, balloons, scarves, cones, hula hoops, bean bags

**Reflection:**
- Cushions, emotion cards, story cards

**FOCUS**: Use cheap, accessible materials for creative MAKING activities (not just games)!`;

    const activityLibraryPrompt = buildActivityExamplesPrompt(input.topic);

    const promptConfig: WorkshopPromptConfig = {
        durationMinutes: durationNum,
        ageRange: input.ageRange,
        ageDescriptionAr: ageInfo.ar,
        ageDescriptionEn: ageInfo.en,
        activityLibraryPrompt,
        materialsContext
    };

    if (format === "text") {
        return {
            systemPrompt: buildWorkshopTextSystemPrompt(promptConfig),
            userPrompt: buildWorkshopTextUserPrompt(input.topic, durationNum, ageInfo),
        };
    }

    if (format === "json") {
        return {
            systemPrompt: buildWorkshopJSONSystemPrompt(promptConfig),
            userPrompt: buildWorkshopJSONUserPrompt(input.topic, durationNum, ageInfo),
        };
    }

    return {
        systemPrompt: buildWorkshopSystemPrompt(promptConfig),
        userPrompt: buildWorkshopUserPrompt(input.topic, durationNum, ageInfo),
    };
}
