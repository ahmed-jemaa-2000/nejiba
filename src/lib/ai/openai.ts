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
    selectedMaterialNames?: string[]; // User-selected materials
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

    // Build materials context for the prompt
    const materialsContext = input.selectedMaterialNames && input.selectedMaterialNames.length > 0
        ? `\n\nAVAILABLE MATERIALS (use these specifically in activities):\n${input.selectedMaterialNames.map(m => `- ${m}`).join('\n')}\n\nIMPORTANT: Design activities specifically around these available materials!`
        : "";

    const userPrompt = `Create a ${durationNum}-minute workshop plan for: "${input.topic}"

Age group: ${ageInfo.ar} (${ageInfo.en})
Age characteristics: ${ageInfo.characteristics}
Context: Cultural center "Leader Kid" (الطفل القائد) club in Ben Arous, Tunisia
${materialsContext}

CRITICAL OUTPUT REQUIREMENTS:

📌 OBJECTIVES (4-5):
- Specific, measurable learning outcomes
- Mix of skills: social, emotional, creative, cognitive

📌 MATERIALS (list only what's available above, or suggest additions if needed)

📌 TIMELINE (5-6 activities, VERY DETAILED):
Each activity MUST include:
- Exact time range (e.g., "0-8 دقيقة")
- Arabic title + English translation
- DETAILED description (3-4 sentences explaining the activity)
- Step-by-step instructions (6-10 specific steps, not generic)
- Facilitator tip (specific advice for this activity)

Timeline structure for ${durationNum} minutes:
1. 🎬 Opening Hook (${Math.round(durationNum * 0.1)} min) - Grab attention, set the mood
2. 🔥 Warm-up Activity (${Math.round(durationNum * 0.15)} min) - Get energy up, build connection
3. 🎯 Main Activity 1 (${Math.round(durationNum * 0.25)} min) - Core learning experience
4. 🏃 Movement Break (${Math.round(durationNum * 0.1)} min) - Re-energize
5. 🌟 Main Activity 2 (${Math.round(durationNum * 0.25)} min) - Apply learning
6. 🪞 Closing Reflection (${Math.round(durationNum * 0.15)} min) - Consolidate, celebrate

📌 FACILITATOR NOTES (6-8 specific tips):
- Pre-workshop preparation checklist
- Dealing with shy children
- Managing group energy levels
- Emergency backup activities
- Parent communication tips

Make every activity FUN, ENGAGING, and EDUCATIONAL!`;

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
1. A SURPRISING STATISTIC or research finding (use real % or numbers)
2. The SCIENCE behind why this matters for child development
3. ONE ACTIONABLE TIP parents can do TODAY (specific, not generic)

📱 FORMAT FOR EACH POST:

1. **day** (1-6)
2. **title** (Arabic) - Start with "هل تعلم؟" + the surprising fact
   Example: "هل تعلم أن 90% من دماغ الطفل يتشكل قبل سن 5؟"
3. **titleEn** - English translation
4. **content** (Arabic, 6-8 sentences):
   - Sentence 1: The surprising fact with statistic
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
Include: longitudinal studies, famous examples, encouraging statistics

Return ONLY a valid JSON array with 6 objects. No markdown code blocks.`;

    const userPrompt = `Generate 6 "هل تعلم؟" posts for parents about: "${topic}"

⚠️ QUALITY REQUIREMENTS:
- Each fact must be SURPRISING (something parents don't already know)
- Include REAL statistics and research (use believable numbers like 73%, 4x more, etc.)
- The actionable tip must be SPECIFIC (not "play with your child" but "play the mirror game for 10 minutes before bedtime")
- Image prompts must describe a SPECIFIC scene with the parent and child DOING something

🎨 IMAGE PROMPT EXAMPLES:

For "الذكاء العاطفي":
"A heartwarming Pixar-style 3D scene: A Tunisian mother sits cross-legged on a colorful Berber rug with her 7-year-old daughter. They are playing the 'emotion faces' game - the mother makes a sad face while the daughter tries to guess the emotion. Both are laughing. Sunlight pours through an arched window with traditional blue tiles. TEXT OVERLAY: 'يوم 4' in elegant gold Arabic calligraphy at top, 'هل تعلم؟' as stylized badge, 'الطفل القائد' small logo."

For "الإبداع":
"A joyful Pixar-style 3D scene: A Tunisian father and his 8-year-old son are building a cardboard rocket ship together in their living room. The father holds the box while the son paints stars on it with bright colors. Paint splatters on their hands and clothes show they're having fun. Mediterranean home with terracotta tiles. TEXT OVERLAY: 'يوم 5' in gold calligraphy at top, 'هل تعلم؟' badge, 'الطفل القائد' small logo in corner."

Generate the 6 posts now:`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.9, // Higher for more creative, surprising facts
        max_tokens: 6000, // More tokens for richer content
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
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

