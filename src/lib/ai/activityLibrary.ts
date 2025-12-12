/**
 * Activity Library for Kids Workshops
 *
 * Contains 25+ example activities across different topics to guide AI generation.
 * These are EXAMPLES to inspire the AI - it should adapt them, not copy exactly.
 *
 * Each activity demonstrates:
 * - Clear 3-5 step instructions
 * - Specific confidence-building moment
 * - Cheap/accessible materials
 * - Life skills alignment
 */

import { ActivityType, EnergyLevel } from "./activityTypes";

export interface ActivityExample {
  nameAr: string;
  nameEn: string;
  activityType: ActivityType;
  energyLevel: EnergyLevel;

  // Clarity emphasis
  simplifiedDescription: string;  // 1 sentence, kid-level language
  exactSteps: string[];           // 3-5 concrete steps
  visualSetup: string;            // What the space should look like

  // Materials
  requiredMaterials: string[];

  // Duration
  minDuration: number;
  maxDuration: number;

  // Life skills
  lifeSkillsFocus: string[];
  confidenceBuildingMoment: string;  // Specific moment where confidence builds
  whyItMatters: string;              // Developmental benefit
}

export interface TopicActivityMapping {
  topicAr: string;
  topicEn: string;
  requiredTypes: ActivityType[];     // Must include these types in workshop
  forbiddenPatterns: string[];       // Avoid these patterns
  exampleActivities: ActivityExample[];
  clarityGuidelines: string[];       // Topic-specific clarity tips
  materialsSuggestions: string[];    // Recommended materials for this topic
}

/**
 * Complete Activity Library by Topic
 * Topics: Confidence, Creativity, Friendship, Bravery, Communication, Teamwork
 */
export const TOPIC_ACTIVITY_MAPPINGS: Record<string, TopicActivityMapping> = {
  "الثقة بالنفس": {
    topicAr: "الثقة بالنفس",
    topicEn: "Self-Confidence",
    requiredTypes: ["صنع وإبداع", "فن وتعبير", "تأمل وتفكير", "قصص ورواية", "حركة"],
    forbiddenPatterns: [
      "complex competition with winners/losers",
      "public failure moments",
      "comparing kids' work",
      "activities requiring existing skills (reading, writing complex text)"
    ],
    exampleActivities: [
      {
        nameAr: "جرة الشجاعة",
        nameEn: "Courage Jar",
        activityType: "صنع وإبداع",
        energyLevel: "low",
        simplifiedDescription: "كل طفل يصنع جرة ويملؤها بلحظات شجاعة عاشها",
        exactSteps: [
          "خذ كأس بلاستيك وزينه بألوانك المفضلة",
          "اكتب على ورقة صغيرة: 'مرة واحدة كنت شجاع عندما...'",
          "ضع الورقة في جرتك",
          "كل يوم، أضف ورقة جديدة عن لحظة شجاعة"
        ],
        visualSetup: "Tables with cups, markers, colored paper strips pre-cut",
        requiredMaterials: ["plastic cups", "markers", "colored paper", "scissors"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["confidence", "self-awareness", "bravery"],
        confidenceBuildingMoment: "When child reads their brave moment out loud to partner",
        whyItMatters: "يتعلم الطفل أن الشجاعة ليست 'عدم الخوف' بل 'التصرف رغم الخوف'"
      },
      {
        nameAr: "أنا ملصق البطل",
        nameEn: "I Am Hero Poster",
        activityType: "فن وتعبير",
        energyLevel: "low",
        simplifiedDescription: "ارسم نفسك كبطل خارق مع كلمات قوتك",
        exactSteps: [
          "ارسم صورة كبيرة لنفسك في منتصف الورقة",
          "حول رأسك، اكتب 3 أشياء أنت جيد فيها",
          "ارسم رمز (shield, star, heart) لكل قوة",
          "شارك ملصقك مع صديق"
        ],
        visualSetup: "Large paper sheets taped to tables, markers spread out, sample poster visible",
        requiredMaterials: ["large paper", "markers", "stickers", "sample poster"],
        minDuration: 20,
        maxDuration: 25,
        lifeSkillsFocus: ["confidence", "self-expression", "positive-self-talk"],
        confidenceBuildingMoment: "When child shares their 3 strengths with friend",
        whyItMatters: "الطفل يتعرف على نقاط قوته ويراها مرسومة أمامه - يصبح البطل حقيقي"
      },
      {
        nameAr: "مسابقة التحديق الودودة",
        nameEn: "Friendly Staring Contest",
        activityType: "حركة",
        energyLevel: "medium",
        simplifiedDescription: "انظر في عيني صديقك دون أن تضحك - تعلم قوة التواصل بالعين",
        exactSteps: [
          "اجلس وجهاً لوجه مع شريكك على مسافة مريحة",
          "عند سماع 'ابدأ!' انظر في عيني شريكك",
          "أول من يضحك أو يدير رأسه 'يخسر' (لكن الجميع يفوز!)",
          "غير الشريك وجرب مرة أخرى"
        ],
        visualSetup: "Pairs sitting in two lines facing each other, comfortable distance (1 meter)",
        requiredMaterials: ["timer", "upbeat music for transitions"],
        minDuration: 8,
        maxDuration: 12,
        lifeSkillsFocus: ["confidence", "eye-contact", "communication", "comfort-with-attention"],
        confidenceBuildingMoment: "When child maintains eye contact for full 30 seconds without looking away",
        whyItMatters: "التواصل بالعين مهارة ثقة - الطفل يتعلم أن ينظر للآخرين بدون خجل"
      },
      {
        nameAr: "قصة 'اليوم الذي تغلبت على خوفي'",
        nameEn: "The Day I Overcame My Fear",
        activityType: "قصص ورواية",
        energyLevel: "low",
        simplifiedDescription: "احكِ قصة قصيرة عن وقت كنت خائفاً ثم أصبحت شجاعاً",
        exactSteps: [
          "فكر في وقت كنت خائفاً (مثلاً: أول يوم مدرسة، تجربة طعام جديد)",
          "أخبر شريكك: 'كنت خائفاً من... لكنني...'",
          "ارسم صورة بسيطة لتلك اللحظة",
          "شارك مع المجموعة إذا أردت (ليس إجباري)"
        ],
        visualSetup: "Circle on floor with cushions, calm atmosphere, sample story cards displayed",
        requiredMaterials: ["story cards with prompts", "paper", "pencils", "cushions"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["bravery", "vulnerability", "storytelling", "peer-support"],
        confidenceBuildingMoment: "When child shares their fear story and gets supportive applause from group",
        whyItMatters: "مشاركة الخوف مع الآخرين تقلل قوته - الطفل يرى أن الجميع يخاف أحياناً"
      },
      {
        nameAr: "دائرة 'أنا فخور بنفسي لأنني...'",
        nameEn: "I'm Proud Circle",
        activityType: "تأمل وتفكير",
        energyLevel: "low",
        simplifiedDescription: "كل طفل يشارك شيء فخور بنفسه بسببه",
        exactSteps: [
          "اجلس في دائرة مع الجميع",
          "الميسر يبدأ: 'أنا فخور بنفسي لأنني...'",
          "كل طفل يكمل الجملة بدوره",
          "الجميع يصفق لكل طفل بعد المشاركة"
        ],
        visualSetup: "Comfortable circle, facilitator sits with kids (not standing), calm music in background",
        requiredMaterials: ["cushions or comfortable seating", "talking stick (optional)"],
        minDuration: 10,
        maxDuration: 15,
        lifeSkillsFocus: ["self-awareness", "pride", "public-speaking", "recognition"],
        confidenceBuildingMoment: "When child hears group applause after sharing their proud moment",
        whyItMatters: "الاحتفال بالنجاحات الصغيرة يبني ثقة تراكمية - كل نجاح صغير يُحتفل به"
      }
    ],
    clarityGuidelines: [
      "Use 'I am...' statements throughout activities",
      "Avoid abstract concepts - use concrete examples of confidence",
      "Every activity should have a 'share with friend' moment (not always large group)",
      "Emphasize process over product - no 'best poster' comparisons",
      "Frame 'losing' positively - everyone learns, no real losers"
    ],
    materialsSuggestions: [
      "plastic cups", "large paper", "markers", "stickers",
      "cushions", "story cards", "mirrors", "emotion cards"
    ]
  },

  "الإبداع": {
    topicAr: "الإبداع",
    topicEn: "Creativity",
    requiredTypes: ["صنع وإبداع", "فن وتعبير", "عصف ذهني", "استكشاف"],
    forbiddenPatterns: [
      "one right answer",
      "copying examples exactly",
      "judging creativity quality",
      "requiring artistic skill"
    ],
    exampleActivities: [
      {
        nameAr: "فن الرسم بالخيط",
        nameEn: "String Painting",
        activityType: "فن وتعبير",
        energyLevel: "medium",
        simplifiedDescription: "اغمس خيط في الألوان واسحبه على الورق لتصنع أشكالاً غير متوقعة",
        exactSteps: [
          "اغمس قطعة خيط طويلة في اللون المفضل",
          "ضع الخيط على الورقة بشكل متعرج (أي شكل تحب)",
          "ضع ورقة ثانية فوقها واضغط بيديك",
          "اسحب الخيط ببطء وافتح الورقة - مفاجأة!"
        ],
        visualSetup: "Tables covered with plastic sheets, paint cups with strings, paper stacks, sample ready",
        requiredMaterials: ["string/yarn pieces (30cm)", "paint", "paper", "plastic tablecloths"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["creativity", "experimentation", "surprise-enjoyment", "process-art"],
        confidenceBuildingMoment: "When child sees their unexpected creation and says 'I made this!' with surprise joy",
        whyItMatters: "الفن التلقائي يعلم الطفل أن الإبداع ليس 'مهارة' بل 'تجربة' - لا توجد طريقة خاطئة"
      },
      {
        nameAr: "روبوت من كرتون",
        nameEn: "Cardboard Robot",
        activityType: "صنع وإبداع",
        energyLevel: "medium",
        simplifiedDescription: "اصنع روبوت من صناديق كرتون وزينه بطريقتك الخاصة",
        exactSteps: [
          "اختر 3-4 صناديق كرتون بأحجام مختلفة",
          "الصندوق الكبير = جسم، الصغير = رأس",
          "الصق الصناديق معاً بالشريط اللاصق القوي",
          "ارسم وجه روبوتك وأزراره وزينه بطريقتك"
        ],
        visualSetup: "Floor space cleared, cardboard boxes sorted by size, tape stations, decoration materials spread out",
        requiredMaterials: ["cardboard boxes (various sizes)", "strong tape", "markers", "bottle caps", "foil", "stickers"],
        minDuration: 25,
        maxDuration: 35,
        lifeSkillsFocus: ["creativity", "planning", "problem-solving", "3D-thinking"],
        confidenceBuildingMoment: "When child names their robot and presents it to group with pride",
        whyItMatters: "البناء ثلاثي الأبعاد يطور التفكير المكاني - الطفل يرى أفكاره تصبح حقيقة ملموسة"
      },
      {
        nameAr: "100 استخدام للكوب",
        nameEn: "100 Uses for a Cup",
        activityType: "عصف ذهني",
        energyLevel: "high",
        simplifiedDescription: "كم طريقة تستطيع أن تستخدم فيها كوب؟ فكر بطرق مجنونة!",
        exactSteps: [
          "خذ كوب بلاستيك بيدك",
          "اجلس مع فريقك (4 أطفال)",
          "كل واحد يمثل استخدام مختلف للكوب بجسمه (قبعة، طبل، تلسكوب، منزل للعصفور...)",
          "الفريق الذي يجد 10 استخدامات يفوز (لكن الجميع أبطال!)"
        ],
        visualSetup: "Open floor space, teams spread out in corners, plastic cups distributed, whiteboard visible to count ideas",
        requiredMaterials: ["plastic cups", "timer", "whiteboard to tally ideas", "energetic music"],
        minDuration: 10,
        maxDuration: 15,
        lifeSkillsFocus: ["divergent-thinking", "creativity", "teamwork", "spontaneity"],
        confidenceBuildingMoment: "When child's 'crazy idea' gets team laughing and excited ('Yes! A spaceship hat!')",
        whyItMatters: "التفكير التباعدي (divergent thinking) هو أساس الإبداع - كل فكرة 'غريبة' محتفى بها"
      },
      {
        nameAr: "صندوق الأسرار: ماذا يمكن أن يكون؟",
        nameEn: "Mystery Box: What Could It Be?",
        activityType: "استكشاف",
        energyLevel: "medium",
        simplifiedDescription: "المس شيء في الصندوق وخمّن: ماذا يمكن أن يكون؟",
        exactSteps: [
          "ضع يدك في الصندوق السري (لا تنظر!)",
          "المس الشيء - ما ملمسه؟ ناعم؟ خشن؟",
          "خمّن 3 أشياء يمكن أن يكون",
          "أخرج الشيء واكتشف المفاجأة!"
        ],
        visualSetup: "Mystery boxes (shoe boxes with hand holes), various textured objects inside, circle seating",
        requiredMaterials: ["boxes with hand holes", "textured objects (sponge, pine cone, fabric, toy)", "cushions for circle"],
        minDuration: 12,
        maxDuration: 18,
        lifeSkillsFocus: ["sensory-exploration", "hypothesis-making", "curiosity", "bravery"],
        confidenceBuildingMoment: "When child guesses correctly or makes creative guess and group says 'Good idea!'",
        whyItMatters: "الاستكشاف الحسي يبني الثقة بالحواس - الطفل يتعلم أن يثق بملاحظاته"
      },
      {
        nameAr: "لوحة جماعية: كل واحد يضيف شيء",
        nameEn: "Collaborative Mural",
        activityType: "تعاون",
        energyLevel: "medium",
        simplifiedDescription: "نرسم معاً على ورقة كبيرة - كل واحد يضيف جزء من الحلم",
        exactSteps: [
          "كل طفل يأخذ لون مختلف",
          "الميسر يقول موضوع (مثلاً: مدينة الأحلام)",
          "كل طفل يرسم شيء واحد على اللوحة الكبيرة",
          "نشاهد اللوحة معاً - ماذا صنعنا؟"
        ],
        visualSetup: "Large paper (3m) on floor or wall, markers spread around, kids can stand/sit around it",
        requiredMaterials: ["very large paper roll", "many markers", "tape to hang paper"],
        minDuration: 20,
        maxDuration: 25,
        lifeSkillsFocus: ["collaboration", "contribution", "shared-creation", "pride"],
        confidenceBuildingMoment: "When child points to their contribution and says 'I added this part!'",
        whyItMatters: "العمل الجماعي الإبداعي يعلم أن كل مساهمة مهمة - اللوحة جميلة لأن الجميع أضاف شيء"
      }
    ],
    clarityGuidelines: [
      "Show, don't just tell - demonstrate each step first",
      "Emphasize 'there's no wrong way' repeatedly throughout activities",
      "Use process art approach (focus on doing, not final product beauty)",
      "Give examples but encourage different results ('Make yours different!')",
      "Celebrate 'mistakes' as discoveries"
    ],
    materialsSuggestions: [
      "string", "paint", "paper", "cardboard boxes", "recyclables",
      "plastic cups", "markers", "tape", "mystery box objects", "large paper rolls"
    ]
  },

  "الصداقة": {
    topicAr: "الصداقة",
    topicEn: "Friendship",
    requiredTypes: ["تعاون", "نقاش ومشاركة", "حركة", "تأمل وتفكير"],
    forbiddenPatterns: [
      "competition between friends",
      "activities causing exclusion",
      "forcing kids to hug/touch if uncomfortable",
      "public sharing of 'best friend' (makes others feel bad)"
    ],
    exampleActivities: [
      {
        nameAr: "رسم الشريك بدون نظر",
        nameEn: "Partner Portrait (No Peeking)",
        activityType: "تعاون",
        energyLevel: "medium",
        simplifiedDescription: "ارسم صورة شريكك بينما هو يصف نفسه - بدون أن تنظر للورقة!",
        exactSteps: [
          "اجلس مع شريكك، كل واحد عنده ورقة وقلم",
          "الشريك الأول يصف وجهه: 'عيوني كبيرة، شعري قصير...'",
          "الثاني يرسم بدون أن ينظر للورقة!",
          "تبادلوا الأدوار واضحكوا على النتائج معاً"
        ],
        visualSetup: "Pairs sitting face-to-face at tables, paper and pencils ready, sample 'silly drawing' displayed",
        requiredMaterials: ["paper", "pencils", "optional: clipboards"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["cooperation", "listening", "describing", "laughter-sharing"],
        confidenceBuildingMoment: "When partners laugh together at the silly drawings (shared joy moment)",
        whyItMatters: "الضحك المشترك يبني روابط - الصداقة تنمو عندما نضحك معاً على شيء بريء"
      },
      {
        nameAr: "ماذا نحب في صديقنا؟",
        nameEn: "What We Love About Our Friend",
        activityType: "نقاش ومشاركة",
        energyLevel: "low",
        simplifiedDescription: "كل طفل يسمع 3 أشياء يحبها أصدقاؤه فيه",
        exactSteps: [
          "اجلس في دائرة صغيرة (5-6 أطفال)",
          "طفل واحد يجلس في الوسط",
          "كل طفل في الدائرة يقول شيء واحد يحبه في الطفل الوسط",
          "تبادلوا حتى الجميع يجلس في الوسط"
        ],
        visualSetup: "Small circles (5-6 kids each), cushions, calm atmosphere, facilitator models first",
        requiredMaterials: ["cushions", "talking stick (optional)", "soft background music"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["giving-compliments", "receiving-praise", "empathy", "appreciation"],
        confidenceBuildingMoment: "When child hears 3-5 genuine compliments from peers and smiles with pride",
        whyItMatters: "سماع ما يحبه الآخرون فينا يبني self-worth - الطفل يرى نفسه من عيون أصدقائه"
      },
      {
        nameAr: "مرآة الصديق",
        nameEn: "Friend Mirror",
        activityType: "حركة",
        energyLevel: "medium",
        simplifiedDescription: "قلد حركات صديقك تماماً - كأنك مرآته!",
        exactSteps: [
          "قف وجهاً لوجه مع شريكك",
          "الشريك الأول يتحرك ببطء (يرفع يد، يميل، يبتسم...)",
          "الثاني يقلده تماماً - كأنه مرآة!",
          "تبادلوا الأدوار بعد دقيقة"
        ],
        visualSetup: "Open space, pairs spread out facing each other (2m apart), calm music playing",
        requiredMaterials: ["open floor space", "calm music", "timer"],
        minDuration: 10,
        maxDuration: 15,
        lifeSkillsFocus: ["attention", "synchronization", "non-verbal-communication", "patience"],
        confidenceBuildingMoment: "When pairs synchronize perfectly and smile at each other with connection",
        whyItMatters: "التقليد يبني attunement - الطفل يتعلم أن 'يقرأ' صديقه ويتناغم معه"
      },
      {
        nameAr: "قصة 'صديقي ساعدني يوم...'",
        nameEn: "My Friend Helped Me Story",
        activityType: "قصص ورواية",
        energyLevel: "low",
        simplifiedDescription: "احكِ قصة عن وقت ساعدك فيه صديق أو ساعدت فيه صديق",
        exactSteps: [
          "فكر في وقت ساعدك فيه صديق (أو ساعدت أنت)",
          "أخبر شريكك القصة: 'يوم واحد، صديقي ساعدني عندما...'",
          "ارسم صورة بسيطة لتلك اللحظة",
          "إذا أردت، شارك مع المجموعة الكبيرة"
        ],
        visualSetup: "Pairs sitting together comfortably, paper and crayons available, story prompt cards visible",
        requiredMaterials: ["paper", "crayons", "story prompt cards", "cushions"],
        minDuration: 15,
        maxDuration: 20,
        lifeSkillsFocus: ["gratitude", "reciprocity", "storytelling", "appreciation"],
        confidenceBuildingMoment: "When child shares helping story and group says 'You're a good friend!'",
        whyItMatters: "تذكر لحظات المساعدة يعزز friendship values - الطفل يرى نمط 'نحن نساعد بعضنا'"
      },
      {
        nameAr: "حلقة التمرير: نبني قصة معاً",
        nameEn: "Pass the Story Circle",
        activityType: "تعاون",
        energyLevel: "low",
        simplifiedDescription: "كل واحد يضيف جملة للقصة - نصنع قصة مشتركة!",
        exactSteps: [
          "اجلسوا في دائرة",
          "الميسر يبدأ: 'كان يا مكان طفل اسمه...'",
          "كل طفل يضيف جملة واحدة للقصة",
          "القصة تدور في الدائرة حتى نصل للنهاية"
        ],
        visualSetup: "Circle seating, talking stick to pass, whiteboard to draw story elements (optional)",
        requiredMaterials: ["talking stick or ball to pass", "cushions", "optional: whiteboard for visual"],
        minDuration: 12,
        maxDuration: 18,
        lifeSkillsFocus: ["listening", "building-on-ideas", "patience", "co-creation"],
        confidenceBuildingMoment: "When child's sentence makes story funny/interesting and group laughs/claps",
        whyItMatters: "القصة التعاونية تعلم أن 'أفكارنا معاً أقوى من أفكار واحد' - synergy"
      }
    ],
    clarityGuidelines: [
      "All activities use pairs or small groups (not isolating)",
      "Emphasize 'we're all friends here' - inclusive language",
      "Model giving specific, genuine compliments (not generic 'you're nice')",
      "Frame activities as 'together' not 'against' each other",
      "Celebrate moments of connection (eye contact, shared laughter, helping)"
    ],
    materialsSuggestions: [
      "paper", "pencils", "cushions", "talking stick",
      "story cards", "music", "compliment prompt cards"
    ]
  }
};

/**
 * Get activity mapping for a topic
 * Supports fuzzy matching for common variations
 */
export function getTopicActivities(topic: string): TopicActivityMapping | null {
  const topicLower = topic.toLowerCase();

  // Direct match
  for (const [key, mapping] of Object.entries(TOPIC_ACTIVITY_MAPPINGS)) {
    if (topicLower.includes(key) || key.includes(topicLower)) {
      return mapping;
    }
  }

  // Fuzzy matching for common terms
  if (topicLower.includes("ثقة") || topicLower.includes("شجاعة") || topicLower.includes("جرأة")) {
    return TOPIC_ACTIVITY_MAPPINGS["الثقة بالنفس"];
  }

  if (topicLower.includes("إبداع") || topicLower.includes("ابداع") || topicLower.includes("خيال")) {
    return TOPIC_ACTIVITY_MAPPINGS["الإبداع"];
  }

  if (topicLower.includes("صداقة") || topicLower.includes("أصدقاء") || topicLower.includes("اصحاب")) {
    return TOPIC_ACTIVITY_MAPPINGS["الصداقة"];
  }

  // Default: return confidence if nothing matches
  return TOPIC_ACTIVITY_MAPPINGS["الثقة بالنفس"];
}

/**
 * Build activity examples prompt section for AI
 * This prompt is injected into the workshop generation system prompt
 */
export function buildActivityExamplesPrompt(topic: string): string {
  const topicActivities = getTopicActivities(topic);

  if (!topicActivities) {
    return `\n# 🎨 ACTIVITY EXAMPLES\n\nNo specific examples for this topic. Use general creative, reflective, and active activities that build confidence, bravery, and friendship.\n`;
  }

  let prompt = `\n# 🎨 ACTIVITY LIBRARY FOR "${topicActivities.topicAr}" (${topicActivities.topicEn})\n\n`;

  prompt += `## REQUIRED ACTIVITY TYPES for this topic:\n`;
  prompt += topicActivities.requiredTypes.map((t, i) => `${i + 1}. ${t}`).join('\n');
  prompt += `\n\n`;

  prompt += `## ⚠️ CLARITY GUIDELINES (VERY IMPORTANT):\n`;
  prompt += topicActivities.clarityGuidelines.map(g => `- ${g}`).join('\n');
  prompt += `\n\n`;

  prompt += `## 📦 RECOMMENDED MATERIALS:\n`;
  prompt += topicActivities.materialsSuggestions.join(', ');
  prompt += `\n\n`;

  prompt += `## 🎯 ACTIVITY EXAMPLES (USE AS INSPIRATION - ADAPT, DON'T COPY EXACTLY):\n\n`;

  topicActivities.exampleActivities.forEach((activity, i) => {
    prompt += `### ${i + 1}. ${activity.nameAr} (${activity.nameEn})\n`;
    prompt += `**Type:** ${activity.activityType} | **Energy:** ${activity.energyLevel}\n`;
    prompt += `**Description:** ${activity.simplifiedDescription}\n`;
    prompt += `**Steps (${activity.exactSteps.length}):**\n`;
    activity.exactSteps.forEach((step, si) => {
      prompt += `  ${si + 1}. ${step}\n`;
    });
    prompt += `**Visual Setup:** ${activity.visualSetup}\n`;
    prompt += `**⭐ Confidence Moment:** ${activity.confidenceBuildingMoment}\n`;
    prompt += `**💡 Why It Matters:** ${activity.whyItMatters}\n`;
    prompt += `**Materials:** ${activity.requiredMaterials.join(', ')}\n`;
    prompt += `**Duration:** ${activity.minDuration}-${activity.maxDuration} min\n`;
    prompt += `\n`;
  });

  prompt += `## ❌ FORBIDDEN PATTERNS (DO NOT USE):\n`;
  prompt += topicActivities.forbiddenPatterns.map(p => `- ${p}`).join('\n');
  prompt += `\n\n`;

  prompt += `**IMPORTANT REMINDERS:**\n`;
  prompt += `- Each activity must have 3-5 steps MAX (counted above)\n`;
  prompt += `- Include specific confidence-building moment for each activity\n`;
  prompt += `- Use cheap, accessible materials only\n`;
  prompt += `- Mix energy levels (not all high)\n`;
  prompt += `- Focus on process, not perfect products\n`;

  return prompt;
}

/**
 * Get list of all topics with activity libraries
 */
export function getAvailableTopics(): Array<{ ar: string; en: string }> {
  return Object.values(TOPIC_ACTIVITY_MAPPINGS).map(mapping => ({
    ar: mapping.topicAr,
    en: mapping.topicEn
  }));
}

/**
 * Check if a topic has a dedicated activity library
 */
export function hasActivityLibrary(topic: string): boolean {
  return getTopicActivities(topic) !== null;
}
