/**
 * Creative Game Library for Workshop Generation
 * 
 * A curated collection of 50+ proven, high-energy games for children's workshops.
 * Organized by topic and game type to ensure variety and topic-relevance.
 */

// ============================================================================
// TOPIC-SPECIFIC GAME MAPPINGS
// ============================================================================

export interface GameExample {
    nameAr: string;
    nameEn: string;
    description: string;
    gameType: "حركة" | "تمثيل" | "تحدي فريق" | "موسيقى" | "تنافس" | "تخيل" | "حل مشكلات" | "تعاون" | "قيادة فريق";
    energyLevel: "عالي" | "متوسط" | "منخفض";
    minDuration: number; // minutes
    maxDuration: number;
}

export interface TopicGameMapping {
    requiredGameTypes: string[];
    forbiddenPatterns: string[];
    exampleGames: GameExample[];
    objectiveTemplates: string[];
}

export const TOPIC_GAME_MAPPINGS: Record<string, TopicGameMapping> = {

    // ========== الإبداع والتفكير (Creativity & Thinking) ==========
    "الإبداع": {
        requiredGameTypes: ["تخيل", "حل مشكلات", "تمثيل"],
        forbiddenPatterns: [
            "بناء برج بالأجسام", // too generic
            "تحدي فريق عام", // non-specific
            "لعبة التعارف البسيطة" // overused
        ],
        exampleGames: [
            {
                nameAr: "لعبة الـ 100 استخدام",
                nameEn: "100 Uses Game",
                description: "أعطِ الأطفال ملعقة/كرسي/حذاء واطلب منهم تمثيل 10 استخدامات غير عادية بأجسامهم",
                gameType: "تخيل",
                energyLevel: "متوسط",
                minDuration: 8,
                maxDuration: 12
            },
            {
                nameAr: "مهندسون صغار",
                nameEn: "Little Engineers",
                description: "بناء جسر من أجسامهم يمر من تحته طفل - تحدي الإبداع الهندسي",
                gameType: "حل مشكلات",
                energyLevel: "عالي",
                minDuration: 10,
                maxDuration: 15
            },
            {
                nameAr: "آلة الاختراعات",
                nameEn: "Invention Machine",
                description: "كل فريق يصبح آلة متحركة تحل مشكلة سخيفة (مثل آلة تنظف الأسنان أوتوماتيكياً)",
                gameType: "تمثيل",
                energyLevel: "عالي",
                minDuration: 12,
                maxDuration: 18
            },
            {
                nameAr: "القصة المتحركة",
                nameEn: "Living Story",
                description: "الميسر يحكي قصة والأطفال يمثلون كل مشهد بأجسامهم فوراً",
                gameType: "تمثيل",
                energyLevel: "عالي",
                minDuration: 8,
                maxDuration: 12
            },
            {
                nameAr: "تحدي الكراسي المستحيلة",
                nameEn: "Impossible Chairs Challenge",
                description: "رتبوا 5 كراسي بأغرب وأكثر طريقة إبداعية ممكنة - ثم اشرحوا اختراعكم",
                gameType: "حل مشكلات",
                energyLevel: "متوسط",
                minDuration: 8,
                maxDuration: 12
            }
        ],
        objectiveTemplates: [
            "يطور الطفل التفكير المتباين (إيجاد حلول متعددة لمشكلة واحدة)",
            "يمارس الطفل الخيال الحركي وتجسيد الأفكار بالجسم",
            "يتعلم الطفل أن الإبداع يعني تجربة أشياء جديدة بلا خوف من الخطأ",
            "يكتشف الطفل قدراته على الابتكار والتفكير خارج الصندوق",
            "يتعاون الطفل مع أقرانه لخلق حلول إبداعية جماعية"
        ]
    },

    // ========== القيادة (Leadership) ==========
    "القيادة": {
        requiredGameTypes: ["قيادة فريق", "تحدي", "قرار"],
        forbiddenPatterns: ["لعبة تعارف بسيطة", "رقص حر"],
        exampleGames: [
            {
                nameAr: "القائد الأعمى",
                nameEn: "Blind Leader",
                description: "طفل معصوب العينين يقود فريقه عبر عقبات باستخدام صوته فقط",
                gameType: "تحدي فريق",
                energyLevel: "متوسط",
                minDuration: 10,
                maxDuration: 15
            },
            {
                nameAr: "مهمة الإنقاذ",
                nameEn: "Rescue Mission",
                description: "القائد يوزع المهام على فريقه لإنقاذ 'الكنز' من الجزيرة قبل انتهاء الوقت",
                gameType: "تحدي فريق",
                energyLevel: "عالي",
                minDuration: 12,
                maxDuration: 18
            },
            {
                nameAr: "قرارات سريعة",
                nameEn: "Quick Decisions",
                description: "القائد أمام تحديات ويجب أن يختار بسرعة - الفريق ينفذ قراره فوراً",
                gameType: "تنافس",
                energyLevel: "عالي",
                minDuration: 8,
                maxDuration: 12
            },
            {
                nameAr: "المدرب الصغير",
                nameEn: "Little Coach",
                description: "كل طفل يدرب الباقين على حركة - يتناوبون على دور القائد",
                gameType: "حركة",
                energyLevel: "عالي",
                minDuration: 10,
                maxDuration: 15
            }
        ],
        objectiveTemplates: [
            "يتعلم الطفل أساسيات إعطاء التعليمات الواضحة",
            "يمارس الطفل اتخاذ القرارات تحت الضغط",
            "يكتشف الطفل أهمية الثقة بين القائد والفريق",
            "يتعلم الطفل التفويض وتوزيع المهام",
            "يدرك الطفل أن القائد الجيد يستمع لفريقه"
        ]
    },

    // ========== التواصل (Communication) ==========
    "التواصل": {
        requiredGameTypes: ["تمثيل", "تعاون", "لغة جسد"],
        forbiddenPatterns: ["كتابة", "رسم", "قراءة"],
        exampleGames: [
            {
                nameAr: "الهاتف المتحرك",
                nameEn: "Moving Telephone",
                description: "نقل رسالة بالحركات فقط عبر صف من الأطفال - من يحافظ على الرسالة؟",
                gameType: "تمثيل",
                energyLevel: "متوسط",
                minDuration: 8,
                maxDuration: 12
            },
            {
                nameAr: "مرآة المشاعر",
                nameEn: "Emotion Mirror",
                description: "ثنائيات يقلدون مشاعر بعضهم - فرح، حزن، دهشة، خوف",
                gameType: "تمثيل",
                energyLevel: "متوسط",
                minDuration: 6,
                maxDuration: 10
            },
            {
                nameAr: "الأوركسترا الصامتة",
                nameEn: "Silent Orchestra",
                description: "قائد يوجه 'الموسيقيين' بحركات يديه فقط - بلا كلام!",
                gameType: "موسيقى",
                energyLevel: "متوسط",
                minDuration: 8,
                maxDuration: 12
            }
        ],
        objectiveTemplates: [
            "يتعلم الطفل أهمية لغة الجسد في التواصل",
            "يمارس الطفل الاستماع الفعال",
            "يكتشف الطفل طرق التواصل غير اللفظي",
            "يتعلم الطفل التعبير عن مشاعره بوضوح"
        ]
    },

    // ========== الثقة بالنفس (Self-Confidence) ==========
    "الثقة": {
        requiredGameTypes: ["عرض", "تحدي فردي", "احتفال"],
        forbiddenPatterns: ["مقارنة سلبية", "خاسر واحد"],
        exampleGames: [
            {
                nameAr: "نجم اليوم",
                nameEn: "Star of the Day",
                description: "كل طفل يقدم 'موهبة' أمام المجموعة - الجميع يصفقون بحماس",
                gameType: "تمثيل",
                energyLevel: "متوسط",
                minDuration: 10,
                maxDuration: 15
            },
            {
                nameAr: "تحدي السوبرهيرو",
                nameEn: "Superhero Challenge",
                description: "كل طفل يختار قوة خارقة ويمثلها - ثم يستخدمها لحل مشكلة",
                gameType: "تخيل",
                energyLevel: "عالي",
                minDuration: 12,
                maxDuration: 18
            },
            {
                nameAr: "صوتي مسموع",
                nameEn: "My Voice is Heard",
                description: "كل طفل يصرخ اسمه بأعلى صوت ثم يقفز - الجميع يكررون معه",
                gameType: "حركة",
                energyLevel: "عالي",
                minDuration: 5,
                maxDuration: 8
            }
        ],
        objectiveTemplates: [
            "يتعلم الطفل أن يعبر عن نفسه أمام المجموعة",
            "يكتشف الطفل نقاط قوته الفريدة",
            "يمارس الطفل تقبل الثناء والاحتفاء",
            "يتعلم الطفل أن الجميع لديه ما يميزه"
        ]
    },

    // ========== العمل الجماعي (Teamwork) ==========
    "العمل الجماعي": {
        requiredGameTypes: ["تحدي فريق", "تعاون", "تنسيق"],
        forbiddenPatterns: ["منافسة فردية", "فائز واحد فقط"],
        exampleGames: [
            {
                nameAr: "الحبل البشري",
                nameEn: "Human Rope",
                description: "الفريق يتشابك كحبل ويحاول التحرك معاً نحو الهدف",
                gameType: "تحدي فريق",
                energyLevel: "عالي",
                minDuration: 8,
                maxDuration: 12
            },
            {
                nameAr: "البالون الطائر",
                nameEn: "Flying Balloon",
                description: "الفريق يبقي البالون في الهواء دون استخدام اليدين - فقط الرؤوس والأكتاف!",
                gameType: "تحدي فريق",
                energyLevel: "عالي",
                minDuration: 6,
                maxDuration: 10
            },
            {
                nameAr: "الجسر المتحرك",
                nameEn: "Moving Bridge",
                description: "نصف الفريق يصنع جسراً بأجسامهم والنصف الآخر يمر - ثم يتبادلون",
                gameType: "تعاون",
                energyLevel: "عالي",
                minDuration: 10,
                maxDuration: 15
            }
        ],
        objectiveTemplates: [
            "يتعلم الطفل أهمية التنسيق مع الآخرين",
            "يكتشف الطفل أن النجاح الجماعي أفضل من الفردي",
            "يمارس الطفل الاستماع لآراء الفريق",
            "يتعلم الطفل أن كل فرد مهم للفريق"
        ]
    }
};

// ============================================================================
// UNIVERSAL GAMES (Work for any topic)
// ============================================================================

export const UNIVERSAL_GAMES: GameExample[] = [
    // === ICE BREAKERS ===
    {
        nameAr: "عاصفة الأسماء",
        nameEn: "Name Storm",
        description: "كل طفل يقول اسمه مع حركة فريدة - الجميع يقلدون ثم يضيف التالي",
        gameType: "حركة",
        energyLevel: "عالي",
        minDuration: 5,
        maxDuration: 10
    },
    {
        nameAr: "كرة الطاقة",
        nameEn: "Energy Ball",
        description: "مرر 'كرة طاقة' خيالية بين الأطفال - كل واحد يظهر الطاقة بطريقة مختلفة",
        gameType: "تخيل",
        energyLevel: "متوسط",
        minDuration: 5,
        maxDuration: 8
    },

    // === ENERGIZERS ===
    {
        nameAr: "تجمد وانفجر",
        nameEn: "Freeze and Explode",
        description: "الموسيقى تتوقف = تجمد كتمثال، الموسيقى تعود = اقفز وارقص بجنون",
        gameType: "موسيقى",
        energyLevel: "عالي",
        minDuration: 4,
        maxDuration: 7
    },
    {
        nameAr: "الريح والأشجار",
        nameEn: "Wind and Trees",
        description: "طفل = الريح يجري، الباقون = أشجار تتمايل معه، ثم يتبادلون",
        gameType: "حركة",
        energyLevel: "عالي",
        minDuration: 5,
        maxDuration: 8
    },
    {
        nameAr: "سباق الحيوانات",
        nameEn: "Animal Race",
        description: "الميسر ينادي حيوان: 'قطط!' - الجميع يتحركون كالقطط نحو الهدف",
        gameType: "تمثيل",
        energyLevel: "عالي",
        minDuration: 5,
        maxDuration: 10
    },

    // === COOL DOWN ===
    {
        nameAr: "دائرة النجوم",
        nameEn: "Star Circle",
        description: "كل طفل يقول شيئاً تعلمه اليوم ثم يرفع يده كنجمة - الجميع ينضمون",
        gameType: "حركة",
        energyLevel: "منخفض",
        minDuration: 5,
        maxDuration: 8
    },
    {
        nameAr: "التصفيق المتسلسل",
        nameEn: "Wave Clap",
        description: "موجة تصفيق تمر عبر الدائرة - تبدأ بطيئة وتتسارع ثم تهدأ",
        gameType: "موسيقى",
        energyLevel: "منخفض",
        minDuration: 3,
        maxDuration: 5
    }
];

// ============================================================================
// ANTI-REPETITION RULES
// ============================================================================

export const ANTI_REPETITION_RULES = `
# ⛔ ANTI-REPETITION RULES (CRITICAL!)

## YOU MUST ENSURE:

1. **UNIQUE CORE MECHANIC** per activity:
   - If Activity 1 uses "building with bodies" → Activity 2 CANNOT use any building
   - If Activity 2 uses "freeze game" → Activity 3 CANNOT use freeze
   - Each activity must feel COMPLETELY DIFFERENT

2. **VARIED GROUPINGS** across activities:
   - Activity 1: دائرة كاملة (whole circle)
   - Activity 2: فرق من 4-5 (teams)
   - Activity 3: ثنائيات (pairs)
   - Activity 4: فردي ثم مجموعة (individual → group)
   - Activity 5: فريقين كبيرين (two big teams)
   - Activity 6: دائرة ختام (closing circle)

3. **ENERGY VARIATION**:
   - NOT all HIGH energy
   - Pattern: HIGH → HIGH → MEDIUM → HIGH → HIGH → LOW

4. **GAME TYPE DIVERSITY**:
   - MUST include at least 3 different gameTypes
   - Required: حركة + تمثيل + at least one of (موسيقى, تنافس, تخيل, حل مشكلات)

## ❌ FORBIDDEN PATTERNS:
- Two "build X with bodies" activities in same workshop
- Two freeze/statue games back-to-back
- Generic "تحدي الفريق" - must have SPECIFIC mechanic
- Activities that work for ANY topic - must be TOPIC-SPECIFIC
- Repeating the same facilitator phrases across activities

## VARIETY CHECKLIST (Answer YES to all):
□ Are all 6 activities using DIFFERENT core mechanics?
□ Is the grouping different in at least 4 activities?
□ Are there at least 3 different gameTypes?
□ Do activities 2, 4, 5 DIRECTLY relate to "${"{topic}"}"?
□ Would a participant notice each activity is unique?
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get topic-specific games based on the workshop topic
 */
export function getTopicGames(topic: string): TopicGameMapping | null {
    // Check for keyword matches
    const topicLower = topic.toLowerCase();

    for (const [key, mapping] of Object.entries(TOPIC_GAME_MAPPINGS)) {
        if (topicLower.includes(key) || key.includes(topicLower)) {
            return mapping;
        }
    }

    // Check for common mappings
    if (topicLower.includes("إبداع") || topicLower.includes("تفكير") || topicLower.includes("ابتكار")) {
        return TOPIC_GAME_MAPPINGS["الإبداع"];
    }
    if (topicLower.includes("قيادة") || topicLower.includes("قائد")) {
        return TOPIC_GAME_MAPPINGS["القيادة"];
    }
    if (topicLower.includes("تواصل") || topicLower.includes("حوار")) {
        return TOPIC_GAME_MAPPINGS["التواصل"];
    }
    if (topicLower.includes("ثقة") || topicLower.includes("شجاعة")) {
        return TOPIC_GAME_MAPPINGS["الثقة"];
    }
    if (topicLower.includes("فريق") || topicLower.includes("تعاون") || topicLower.includes("جماعي")) {
        return TOPIC_GAME_MAPPINGS["العمل الجماعي"];
    }

    return null;
}

/**
 * Build a topic-specific game examples section for the prompt
 */
export function buildGameExamplesPrompt(topic: string): string {
    const topicGames = getTopicGames(topic);

    let prompt = `\n# 🎮 GAME LIBRARY FOR "${topic}"\n\n`;

    if (topicGames) {
        prompt += `## REQUIRED GAME TYPES for this topic:\n`;
        prompt += topicGames.requiredGameTypes.map(t => `- ${t}`).join('\n');
        prompt += `\n\n## TOPIC-SPECIFIC GAME EXAMPLES (USE THESE AS INSPIRATION):\n\n`;

        topicGames.exampleGames.forEach((game, i) => {
            prompt += `### ${i + 1}. ${game.nameAr} (${game.nameEn})\n`;
            prompt += `- Type: ${game.gameType} | Energy: ${game.energyLevel} | Duration: ${game.minDuration}-${game.maxDuration} min\n`;
            prompt += `- Description: ${game.description}\n\n`;
        });

        prompt += `## FORBIDDEN PATTERNS (DO NOT USE):\n`;
        prompt += topicGames.forbiddenPatterns.map(p => `- ❌ ${p}`).join('\n');

        prompt += `\n\n## LEARNING OBJECTIVES TEMPLATES:\n`;
        prompt += topicGames.objectiveTemplates.map((o, i) => `${i + 1}. ${o}`).join('\n');
    }

    prompt += `\n\n## UNIVERSAL GAMES (Can be used for any topic):\n\n`;
    UNIVERSAL_GAMES.slice(0, 5).forEach((game, i) => {
        prompt += `${i + 1}. **${game.nameAr}**: ${game.description}\n`;
    });

    return prompt;
}
