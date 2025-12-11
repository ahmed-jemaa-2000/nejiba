/**
 * OpenAI Client Wrapper for Nejiba Studio
 * 
 * Provides typed functions for workshop generation and activity regeneration.
 * 
 * v2.0 - Enhanced with game library, anti-repetition rules, and gpt-4o model
 */

import OpenAI from "openai";
import { buildGameExamplesPrompt, ANTI_REPETITION_RULES, getTopicGames } from "./gameLibrary";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface WorkshopInput {
    topic: string;
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
    selectedMaterialNames?: string[]; // User-selected materials
}

export interface WorkshopActivity {
    timeRange: string;
    title: string;
    titleEn?: string;

    // Game metadata
    gameType?: "حركة" | "تمثيل" | "تحدي فريق" | "موسيقى" | "تنافس";
    energyLevel?: string; // e.g., "🔋🔋🔋 عالي"
    groupSize?: string; // e.g., "فردي | ثنائي | فرق من 4-5"
    learningGoal?: string;

    // Core content
    description: string;
    setupSteps?: string[]; // 2-4 preparation steps before activity
    instructions: string[]; // 8-12 detailed steps with exact phrases
    detailedSteps?: string[]; // Alias for backward compatibility

    // Enhanced details for PDF quality
    safetyTips?: string; // Age-specific safety considerations
    debriefQuestions?: string[]; // 2-3 reflection questions for kids
    funFactor?: string;
}

export interface ScheduleBlock {
    blockType: "opener" | "main" | "transition" | "closing";
    startMinute: number;
    endMinute: number;
    activity: WorkshopActivity;
}

export interface WorkshopPlanData {
    title: { ar: string; en: string };
    theme?: string;
    ageRange?: string;
    totalDurationMinutes?: number;
    learningObjectives?: string[];
    generalInfo: {
        duration: string;
        ageGroup: string;
        participants: string;
        level: string;
        facilitatorCount?: string;
    };
    objectives: { ar: string; en?: string }[];
    materials: string[] | { item: string; quantity: string; notes?: string }[];
    roomSetup?: string;
    schedule?: ScheduleBlock[];
    timeline: WorkshopActivity[];

    // Enhanced closing section
    closingReflection?: {
        title: string;
        nameAr?: string;
        nameEn?: string;
        duration?: string;
        durationMinutes?: number;
        description: string;
        steps?: string[];
        questions: string[];
    };

    // Simple facilitator notes
    facilitatorNotes: string[] | {
        beforeWorkshop?: string[];
        duringWorkshop?: string[];
    };
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

/**
 * Generate a complete workshop plan using GPT-4o
 * Enhanced version with Professor Playful persona, game library, and anti-repetition rules
 * 
 * v2.0 - Upgraded to gpt-4o for better creativity and topic-specific activities
 */
export async function generateWorkshopPlan(input: WorkshopInput): Promise<WorkshopPlanData> {
    const ageInfo = AGE_DESCRIPTORS[input.ageRange];
    const durationNum = parseInt(input.duration);

    // Build materials context for the prompt
    const materialsContext = input.selectedMaterialNames && input.selectedMaterialNames.length > 0
        ? `\n\nAvailable Materials (MUST design activities using these):\n${input.selectedMaterialNames.map(m => `- ${m}`).join('\n')}`
        : "\n\nUse common workshop items: balls, scarves, cones, music player, balloons, hula hoops, bean bags, ropes.";

    // Get topic-specific game examples and anti-repetition rules
    const gameExamplesPrompt = buildGameExamplesPrompt(input.topic);
    const topicMapping = getTopicGames(input.topic);

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

## Each Activity MUST Have:
1. **setup** (2-4 prep steps before kids arrive)
2. **steps** (⚠️ EXACTLY 8-12 numbered steps with):
   - step number (1 through 8 minimum)
   - timeHint: "(30 ثانية)" or "(1 دقيقة)"
   - spokenPromptAr: EXACT Arabic phrase to say in quotes
   - action: what kids PHYSICALLY do (movement, not writing!)
3. **variations**: { easy, medium, hard } with age-specific adaptations
4. **safetyTips**: concrete precautions for this activity
5. **debriefQuestions**: 2-3 child-friendly reflection questions

# JSON OUTPUT FORMAT (STRICT)

Return ONLY valid JSON:
{
  "title": { "ar": "ورشة: [الموضوع]", "en": "Workshop: [Topic]" },
  "theme": "[Main theme]",
  "ageRange": "${input.ageRange}",
  "totalDurationMinutes": ${durationNum},
  "learningObjectives": [
    "هدف تعليمي 1 - Learning objective 1",
    "هدف تعليمي 2 - Learning objective 2",
    "هدف تعليمي 3 - Learning objective 3",
    "هدف تعليمي 4 - Learning objective 4",
    "هدف تعليمي 5 - Learning objective 5"
  ],
  "materials": [
    { "item": "اسم المادة", "quantity": "العدد", "notes": "ملاحظة" }
  ],
  "roomSetup": "وصف ترتيب الغرفة قبل وصول الأطفال...",
  "generalInfo": {
    "duration": "${input.duration} دقيقة",
    "ageGroup": "${ageInfo.ar}",
    "participants": "10-15 طفل",
    "level": "مبتدئ",
    "facilitatorCount": "1-2 ميسر"
  },
  "objectives": [
    { "ar": "هدف 1", "en": "Objective 1" }
  ],
  "schedule": [
    {
      "blockType": "opener",
      "startMinute": 0,
      "endMinute": 8,
      "activity": {
        "nameAr": "اسم اللعبة",
        "nameEn": "Game Name",
        "title": "اسم اللعبة",
        "titleEn": "Game Name",
        "timeRange": "0-8 دقيقة",
        "recommendedAge": "${input.ageRange}",
        "durationMinutes": 8,
        "groupSize": "whole group",
        "learningGoals": ["مهارة 1", "مهارة 2"],
        "materialsNeeded": ["كرة", "موسيقى"],
        "gameType": "حركة",
        "energyLevel": "🔋🔋🔋 عالي",
        "description": "وصف النشاط بالتفصيل...",
        "setup": [
          "التحضير 1: رتب المكان",
          "التحضير 2: جهز المواد"
        ],
        "steps": [
          { "step": 1, "timeHint": "(30 ثانية)", "spokenPromptAr": "يا أبطال! تعالوا نقف في دائرة كبيرة!", "action": "الأطفال يقفون في دائرة" },
          { "step": 2, "timeHint": "(1 دقيقة)", "spokenPromptAr": "اليوم عندنا لعبة حماسية جداً!", "action": "الميسر يشرح القواعد" }
        ],
        "instructions": ["خطوة 1", "خطوة 2"],
        "variations": {
          "easy": "🟢 للصغار (6-7): تبسيط القواعد...",
          "medium": "🟡 للمتوسطين (8-10): النسخة الأساسية...",
          "hard": "🔴 للكبار (11-14): إضافة تحديات..."
        },
        "safetyTips": "تأكد من المسافة بين الأطفال، الأرضية غير زلقة",
        "debriefQuestions": [
          "ما أكثر شيء أعجبكم؟",
          "ماذا تعلمنا؟"
        ],
        "funFactor": "لماذا سيحب الأطفال هذا النشاط",
        "facilitatorNotes": "ملاحظات إضافية"
      }
    }
  ],
  "timeline": [
    {
      "timeRange": "0-11 دقيقة",
      "title": "اسم اللعبة الحقيقي",
      "titleEn": "Real Game Name",
      "description": "وصف حقيقي للنشاط...",
      "gameType": "حركة",
      "energyLevel": "🔋🔋🔋 عالي",
      "groupSize": "الجميع معاً",
      "learningGoal": "المهارة المحددة",
      "setupSteps": [
        "رتب المكان قبل وصول الأطفال",
        "جهز المواد المطلوبة"
      ],
      "steps": [
        { "step": 1, "timeHint": "(30 ثانية)", "spokenPromptAr": "يا أبطال! تعالوا اجتمعوا!", "action": "الأطفال يركضون نحو الميسر" },
        { "step": 2, "timeHint": "(1 دقيقة)", "spokenPromptAr": "اليوم عندنا تحدي!", "action": "الميسر يشرح القواعد" },
        { "step": 3, "timeHint": "(30 ثانية)", "spokenPromptAr": "مين فهم؟", "action": "الأطفال يرفعون أيديهم" },
        { "step": 4, "timeHint": "(2 دقيقة)", "spokenPromptAr": "يلا نبدأ!", "action": "الأطفال ينفذون النشاط" },
        { "step": 5, "timeHint": "(2 دقيقة)", "spokenPromptAr": "استمروا!", "action": "تكرار النشاط" },
        { "step": 6, "timeHint": "(1 دقيقة)", "spokenPromptAr": "ممتاز!", "action": "الميسر يشجع" },
        { "step": 7, "timeHint": "(1 دقيقة)", "spokenPromptAr": "مين الأسرع؟", "action": "منافسة" },
        { "step": 8, "timeHint": "(1 دقيقة)", "spokenPromptAr": "تصفيق!", "action": "احتفال" }
      ],
      "safetyTips": "تأكد من المسافة بين الأطفال",
      "debriefQuestions": ["ما أكثر شيء أعجبكم؟", "ماذا تعلمنا؟"]
    }
  ],
  "closingReflection": {
    "nameAr": "دائرة الختام",
    "nameEn": "Closing Circle",
    "title": "دائرة الختام",
    "durationMinutes": 7,
    "duration": "7 دقائق",
    "description": "نشاط هادئ للتأمل والاحتفال",
    "steps": ["step 1", "step 2", "step 3"],
    "questions": [
      "ما أكثر شيء استمتعت به اليوم؟",
      "ما الشيء الجديد الذي تعلمته؟",
      "ماذا ستخبر أهلك عن ورشة اليوم؟"
    ]
  },
  "facilitatorNotes": {
    "beforeWorkshop": [
      "حضّر جميع المواد قبل 15 دقيقة",
      "رتب المكان بشكل يسمح بالحركة",
      "تأكد من وجود ماء للأطفال"
    ],
    "duringWorkshop": [
      "راقب طاقة المجموعة وعدّل الوتيرة",
      "استخدم إشارة الهدوء عند الحاجة",
      "شجع كل طفل بالاسم"
    ]
  }
}

# TIMELINE STRUCTURE FOR ${durationNum} MINUTES

Design exactly 5-6 activities:

| Block | Time | Type | Energy |
|-------|------|------|--------|
| opener | 0-${Math.round(durationNum * 0.12)} min | Welcome + Ice breaker | 🔋🔋🔋 HIGH |
| main | ${Math.round(durationNum * 0.12)}-${Math.round(durationNum * 0.35)} min | Team Competition Game | 🔋🔋🔋 HIGH |
| transition | ${Math.round(durationNum * 0.35)}-${Math.round(durationNum * 0.42)} min | Quick Energizer | 🔋🔋 MED |
| main | ${Math.round(durationNum * 0.42)}-${Math.round(durationNum * 0.65)} min | Drama/Acting Game | 🔋🔋🔋 HIGH |
| main | ${Math.round(durationNum * 0.65)}-${Math.round(durationNum * 0.85)} min | Final Challenge | 🔋🔋🔋 HIGH |
| closing | ${Math.round(durationNum * 0.85)}-${durationNum} min | Reflection + Celebration | 🔋🔋 MED |

# QUALITY CHECKLIST
☑️ Every activity has 8-12 steps with EXACT Arabic phrases
☑️ Every step has timing hint like (30 ثانية)
☑️ safetyTips are specific to activity type
☑️ debriefQuestions are simple for children
☑️ NO passive activities
☑️ At least 4 activities require physical movement
☑️ schedule array matches timeline array`;

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

---

# ⛔ CRITICAL: NO PLACEHOLDER TEXT

DO NOT write:
- "خطوة 1", "خطوة 2", "خطوة 3" ❌
- "وصف النشاط...", "هدف 1", "هدف 2" ❌
- Any generic placeholder text ❌
- "تحدي الفريق" or "التحدي النهائي" as generic names ❌

INSTEAD write REAL, SPECIFIC content:
- "يا أبطال! قفوا في دائرة كبيرة الآن!" ✅
- "مرروا الكرة بسرعة قبل ما تنتهي الموسيقى!" ✅
- Creative game names like "آلة الاختراعات" or "مهندسون صغار" ✅

---

# ⛔ FORBIDDEN WORDS - DO NOT USE THESE VERBS:
- ❌ اكتبوا (write)
- ❌ دونوا (note down)  
- ❌ سجلوا (record/write)
- ❌ ارسموا (draw)
- ❌ لونوا (color)
- ❌ اقرأوا (read)

# ✅ USE THESE ACTION VERBS INSTEAD:
- ✅ اركضوا (run)
- ✅ اقفزوا (jump)
- ✅ ارقصوا (dance)
- ✅ مثلوا (act)
- ✅ تجمدوا (freeze)
- ✅ صفقوا (clap)
- ✅ مرروا الكرة (pass the ball)
- ✅ قلدوا (imitate)
- ✅ ابتكروا (invent/create)
- ✅ تخيلوا (imagine)

---

# 📋 REQUIRED OUTPUT

## 5 Learning Objectives SPECIFIC to "${input.topic}"
${topicMapping ? `Use these templates:\n${topicMapping.objectiveTemplates.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : `Write 5 SPECIFIC objectives related to "${input.topic}":\n- يتعلم الطفل [مهارة محددة]\n- يمارس الطفل [سلوك محدد]\n- يكتشف الطفل [قدرة محددة]`}

## 8-12 Materials (NOT 2!)
List at least 8 materials with quantities and notes.

## ⚠️ ACTIVITY STRUCTURE: THE "GOLDEN GAME LOOP" (REQUIRED)
Don't just list steps. Design a JOURNEY for each game using these 5 PHASES:

1. **🎣 Phase 1: The Hook (Steps 1-2)**
   - Grab attention immediately (Story/Fantasy context).
   - "Imagine we are..." or "Who can be the fastest?"

2. **👀 Phase 2: Visual Demo (Steps 3-4)**
   - SHOW, don't just tell.
   - "Watch me do this..."
   - Verify understanding: "Thumbs up if you got it?"

3. **🟢 Phase 3: Practice Round (Steps 5-6)**
   - Low stakes, slow motion, no scoring yet.
   - Let them feel the mechanic safely.

4. **🔥 Phase 4: The Challenge & Twist (Steps 7-9)**
   - The "Real Game" begins.
   - ADD A TWIST: "Now do it on one leg!", "Now silent!", "Double speed!"

5. **🚀 Phase 5: The Climax (Steps 10+)**
   - High energy final round.
   - "Final Boss" moment or big celebration.

**TOTAL STEPS should naturally be 8-12 because of this structure.**

## Activity Quality Checklist:
1. **Progression**: Does it get harder/funnier?
2. **Scaffolding**: Do they practice before competing?
3. **Twists**: Is there a surprise rule change halfway?
4. **Unique Mechanic**: Is it DIFFERENT from all other games?

4. **TOPIC-SPECIFIC** - Activities 2, 4, 5 must DIRECTLY teach "${input.topic}"
5. **variations** object: { "easy": "...", "medium": "...", "hard": "..." }
6. **safetyTips**: Safety precaution specific to this activity
7. **debriefQuestions**: 2-3 quick verbal questions (not written!)

---

Generate workshop plan for "${input.topic}" now. 

⚠️ FINAL CHECKLIST (Answer YES to all before submitting):
☑️ All 6 activities have DIFFERENT core mechanics?
☑️ At least 3 different gameTypes used?
☑️ Activities 2, 4, 5 specifically teach "${input.topic}"?
☑️ Each activity has 8-12 detailed steps?
☑️ At least 8 materials listed?
☑️ 5 learning objectives specific to "${input.topic}"?
☑️ NO two activities could be swapped without noticing?`;

    console.log("🎓 Generating workshop for:", input.topic, "| Duration:", durationNum, "min | Age:", input.ageRange);
    console.log("📚 Using game library with", topicMapping ? topicMapping.exampleGames.length : 0, "topic-specific examples");

    // LOGGING PROMPTS FOR DEBUGGING
    console.log("\n========== SYSTEM PROMPT ==========\n", systemPrompt, "\n===================================\n");
    console.log("\n========== USER PROMPT ============\n", userPrompt, "\n===================================\n");

    // Model options (ranked by value for this use case):
    // 1. "gpt-5-mini"  - $0.006/workshop - BEST VALUE ✅
    // 2. "gpt-5-nano"   - $0.004/workshop - CHEAPEST (33% cheaper, test quality first)
    // 3. "gpt-5-mini"   - $0.021/workshop - PREMIUM (3.5x more, newer knowledge Oct 2024)
    const completion = await openai.chat.completions.create({
        model: "gpt-5-mini", // Current: Best value - fast, cheap, excellent quality
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 24000,
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        const parsed = JSON.parse(content) as WorkshopPlanData;

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

        // ========== POST-GENERATION VALIDATION ==========
        const validationIssues: string[] = [];

        if (parsed.timeline && parsed.timeline.length > 0) {
            // Check for repetitive activity titles
            const titles = parsed.timeline.map(a => a.title.toLowerCase().replace(/[0-9]/g, '').trim());
            const uniqueTitles = new Set(titles);
            if (uniqueTitles.size < titles.length * 0.7) {
                validationIssues.push("⚠️ Repetitive activity titles detected");
            }

            // Check for variety in game types
            const gameTypes = parsed.timeline.map(a => (a as any).gameType).filter(Boolean);
            const uniqueTypes = new Set(gameTypes);
            if (uniqueTypes.size < 3) {
                validationIssues.push(`⚠️ Low game type variety: only ${uniqueTypes.size} types (${Array.from(uniqueTypes).join(', ')})`);
            }

            // Check for similar descriptions (building tower/pyramid detection)
            const descriptions = parsed.timeline.map(a => a.description.toLowerCase());
            const buildingActivities = descriptions.filter(d =>
                d.includes('برج') || d.includes('هرم') || d.includes('بناء') || d.includes('build')
            );
            if (buildingActivities.length > 1) {
                validationIssues.push("⚠️ Multiple 'building' activities detected - may be repetitive");
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
            console.log("⚠️ QUALITY VALIDATION WARNINGS:");
            validationIssues.forEach(issue => console.log("  ", issue));
        } else {
            console.log("✅ Quality validation passed - good variety detected");
        }

        console.log("✅ Workshop plan generated successfully with", parsed.timeline?.length || parsed.schedule?.length || 0, "activities");
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

        throw new Error(`Failed to parse workshop plan JSON: ${parseError}`);
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
        model: "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
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
        model: "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
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
        model: "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
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
        model: "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
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
        model: "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 12000, // Increased to avoid hitting token limit
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Activity Gen Empty:", JSON.stringify(completion, null, 2));
        throw new Error("No response from OpenAI");
    }

    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        let tips: DailyTip[];
        if (jsonMatch) {
            tips = JSON.parse(jsonMatch[0]);
        } else {
            tips = JSON.parse(content);
        }

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
        });

        console.log("\n" + "=".repeat(60) + "\n");

        return tips;
    } catch (e) {
        console.error("Failed to parse daily tips JSON", e);
        console.error("Raw content:", content);
        throw new Error("Failed to generate tips");
    }
}

