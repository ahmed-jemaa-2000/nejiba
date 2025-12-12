/**
 * PDF-Ready Workshop Prompt System
 *
 * A complete, standalone prompt optimized for professional PDF output.
 * Designed for export to ChatGPT GPT-5.2 for high-quality JSON generation.
 *
 * Key Features:
 * - Facilitator script with exact Arabic phrases
 * - Second-by-second timing per step
 * - Material preparation and placement instructions
 * - Troubleshooting sections for common issues
 * - Complete standalone export for ChatGPT
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PDFReadyStep {
  stepNumber: number;
  exactAction: string;           // ONE concrete, specific action in Arabic
  facilitatorSays: string;       // Exact Arabic phrase to say
  visualCue: string;             // What facilitator demonstrates
  durationSeconds: number;       // How long this step takes
  successIndicator: string;      // How to know kids completed it
}

export interface PDFReadyMaterial {
  item: string;                  // Material name in Arabic
  itemEn: string;                // English name
  quantity: string;              // e.g., "15 كوب" or "1 لكل طفل"
  preparation: string;           // How to prepare before workshop
  placement: string;             // Where to place in room
}

export interface PDFReadyActivity {
  // Identity
  blockNumber: number;
  title: string;
  titleEn: string;
  blockType: string;             // e.g., "دائرة الترحيب", "الاستكشاف", etc.
  activityType: string;          // From the 13 activity types

  // Timing
  exactStartMinute: number;
  exactEndMinute: number;
  durationMinutes: number;

  // Energy & Complexity
  energyLevel: "high" | "medium" | "low";
  complexityLevel: "simple" | "moderate" | "complex";

  // Facilitator Script (CORE - Most Important!)
  facilitatorScript: {
    roomSetup: string;           // How room should look before activity
    materialsReady: string[];    // Checklist before starting
    openingPhrase: string;       // Exact first words in Arabic
    mainSteps: PDFReadyStep[];   // 3-5 detailed steps
    closingPhrase: string;       // Exact ending words in Arabic
    transitionToNext: string;    // How to smoothly move to next activity
  };

  // Materials for this specific activity
  materials: PDFReadyMaterial[];

  // Life Skills Development
  lifeSkillsFocus: string[];
  confidenceBuildingMoment: string;
  whyItMatters: string;

  // Activity-Level Benefits (NEW)
  activityBenefits: {
    cognitive: string;    // What thinking skills this builds
    emotional: string;    // What emotional growth this creates
    social: string;       // What social skills this develops
  };

  // Troubleshooting (CRITICAL for facilitators!)
  troubleshooting: {
    ifKidsAreBored: string;
    ifKidsAreConfused: string;
    ifKidsAreTooEnergetic: string;
    shyChildTip: string;
    activeChildTip: string;
  };

  // Debrief
  debriefQuestions: string[];

  // Emergency
  quickBackupActivity: string;
}

export interface PDFReadyWorkshopPlan {
  // Header
  title: { ar: string; en: string };
  workshopDate?: string;
  workshopTime?: string;

  // Introduction (3 phrases for kids)
  introduction: {
    phrase1: string;
    phrase2: string;
    phrase3: string;
  };

  // General Info
  generalInfo: {
    duration: string;
    durationMinutes: number;
    ageGroup: string;
    participants: string;
    roomType: string;
    facilitatorCount: string;
  };

  // Learning Objectives (5-7)
  objectives: { ar: string; en: string }[];

  // Master Materials List (all activities combined)
  masterMaterialsList: PDFReadyMaterial[];

  // Room Setup Overview
  roomSetupOverview: {
    layoutDescription: string;
    zonesNeeded: string[];
    setupTimeMinutes: number;
  };

  // Timeline (6 activities)
  timeline: PDFReadyActivity[];

  // Facilitator Notes
  facilitatorNotes: {
    beforeWorkshop: string[];
    duringWorkshop: string[];
    afterWorkshop: string[];
    emergencyContacts: string;
  };

  // Closing
  closingReflection: {
    title: string;
    questions: string[];
    takeHomeMessage: string;
  };

  // Kids Benefits Summary (NEW - For parents & facilitators)
  kidsBenefits: {
    // Summary headline
    summaryAr: string;    // One powerful sentence in Arabic
    summaryEn: string;    // Same in English

    // 5 Developmental Areas
    cognitive: {
      title: string;    // e.g., "التطور الذهني"
      skills: string[]; // 3-4 specific skills gained
      example: string;  // Concrete example from the workshop
    };
    emotional: {
      title: string;    // e.g., "النمو العاطفي"
      skills: string[]; // 3-4 emotional competencies
      example: string;
    };
    social: {
      title: string;    // e.g., "المهارات الاجتماعية"
      skills: string[];
      example: string;
    };
    physical: {
      title: string;    // e.g., "التطور الجسدي"
      skills: string[]; // Motor skills, coordination, etc.
      example: string;
    };
    character: {
      title: string;    // e.g., "بناء الشخصية"
      skills: string[]; // Leadership, resilience, etc.
      example: string;
    };

    // Parent-friendly takeaways
    parentTips: string[];  // 3-4 ways parents can reinforce at home
    longTermImpact: string; // One sentence on lasting benefit
  };
}

// ============================================================================
// PROMPT CONFIGURATION
// ============================================================================

export interface PDFReadyPromptConfig {
  topic: string;
  durationMinutes: number;
  ageRange: string;
  ageDescriptionAr: string;
  ageDescriptionEn: string;
  selectedMaterials?: string[];
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

export function buildPDFReadySystemPrompt(config: PDFReadyPromptConfig): string {
  const materialsSection = config.selectedMaterials && config.selectedMaterials.length > 0
    ? `\n\n# 📦 المواد المتوفرة (يجب استخدامها):\n${config.selectedMaterials.map(m => `- ${m}`).join('\n')}`
    : '';

  return `أنت **أستاذ الورش الإبداعية** (Professor Workshop Master)، مصمم ورش عمل أطفال عالمي المستوى متخصص في تنمية المهارات الحياتية للأطفال.

# 🎯 مهمتك الأساسية

صمم ورشة عمل مدتها ${config.durationMinutes} دقيقة تساعد الأطفال على تطوير:
- **الثقة بالنفس**: "أنا أستطيع!"
- **الشجاعة**: "سأحاول حتى لو كنت خائفاً"
- **الصداقة**: "أنا جزء من المجموعة"

---

# ⚠️ قواعد حاسمة (اتبعها بدقة)

## 1. الوضوح هو كل شيء

كل خطوة يجب أن تكون:
- **فعل واحد محدد**: "ارفع يدك" وليس "فكر وشارك وناقش"
- **مع العبارة المنطوقة**: ما يقوله الميسر بالضبط
- **مع مؤشر النجاح**: كيف نعرف أن الأطفال فهموا

### ❌ مثال سيء:
\`\`\`
الخطوة: "كل طفل يشارك مشاعره مع المجموعة"
\`\`\`

### ✅ مثال ممتاز:
\`\`\`json
{
  "stepNumber": 1,
  "exactAction": "الميسر يجلس في الدائرة ويقول اسمه وشيء يحبه",
  "facilitatorSays": "أهلاً! أنا [اسم] وأنا أحب [شيء]. الآن دوركم! من يريد أن يبدأ؟",
  "visualCue": "الميسر يرفع يده أولاً للتطوع",
  "durationSeconds": 30,
  "successIndicator": "طفل واحد على الأقل يرفع يده للمشاركة"
}
\`\`\`

---

## 2. الهيكل الزمني (6 أنشطة)

| رقم | نوع النشاط | النسبة | المدة التقريبية |
|-----|-----------|--------|-----------------|
| 1 | دائرة الترحيب | 10% | ${Math.round(config.durationMinutes * 0.10)} دقيقة |
| 2 | الاستكشاف | 20% | ${Math.round(config.durationMinutes * 0.20)} دقيقة |
| 3 | الإبداع والصنع | 30% | ${Math.round(config.durationMinutes * 0.30)} دقيقة |
| 4 | الحركة والطاقة | 15% | ${Math.round(config.durationMinutes * 0.15)} دقيقة |
| 5 | التأمل والمشاركة | 15% | ${Math.round(config.durationMinutes * 0.15)} دقيقة |
| 6 | الاحتفال والختام | 10% | ${Math.round(config.durationMinutes * 0.10)} دقيقة |

---

## 3. توازن الطاقة

- **40% طاقة عالية**: الحركة، الألعاب النشطة
- **40% طاقة متوسطة**: الصنع، العمل الجماعي
- **20% طاقة منخفضة**: التأمل، المشاركة الهادئة

---

## 4. أنواع الأنشطة المطلوبة

استخدم على الأقل 4 أنواع مختلفة من:
- **صنع وإبداع**: أعمال يدوية بمواد بسيطة
- **فن وتعبير**: رسم، تلوين، فن حر
- **حل مشكلات**: تحديات بسيطة مع حلول متعددة
- **عصف ذهني**: "كم طريقة يمكن أن نستخدم فيها...؟"
- **استكشاف**: اكتشاف وتجريب
- **تأمل وتفكير**: لحظات هادئة للتفكير
- **قصص ورواية**: حكايات شخصية
- **نقاش ومشاركة**: مشاركة في مجموعات صغيرة
- **حركة**: ألعاب حركية بسيطة
- **تمثيل**: تمثيل أدوار
- **موسيقى**: إيقاعات وأصوات
- **تحدي فريق**: تحديات جماعية
- **تعاون**: عمل ثنائي أو جماعي

---

## 5. المواد: رخيصة ومتوفرة

**المواد المسموحة:**
- البلاستيك: أكواب، قوارير، أغطية
- الكرتون: صناديق، أنابيب، ورق مقوى
- الورق: ملون، أبيض، جرائد، مجلات
- الأدوات: مقص، صمغ، شريط لاصق، أقلام
- الحركة: كرات، بالونات، أوشحة

**المواد الممنوعة:**
- ❌ أجهزة إلكترونية
- ❌ مواد غالية الثمن
- ❌ مواد صعبة التحضير
${materialsSection}

---

# 📋 صيغة الإخراج المطلوبة (JSON)

أعد JSON صالح يطابق هذا الهيكل بالضبط:

\`\`\`json
{
  "title": {
    "ar": "ورشة: [الموضوع]",
    "en": "Workshop: [Topic in English]"
  },
  
  "introduction": {
    "phrase1": "جملة ترحيبية قصيرة تجذب انتباه الأطفال",
    "phrase2": "ربط بسيط بموضوع الورشة",
    "phrase3": "ماذا سنفعل اليوم بطريقة مشوقة"
  },
  
  "generalInfo": {
    "duration": "${config.durationMinutes} دقيقة",
    "durationMinutes": ${config.durationMinutes},
    "ageGroup": "${config.ageDescriptionAr}",
    "participants": "10-15 طفل",
    "roomType": "قاعة داخلية مع مساحة حركة",
    "facilitatorCount": "1-2 ميسر"
  },
  
  "objectives": [
    { "ar": "هدف تعليمي 1", "en": "Learning objective 1" },
    { "ar": "هدف تعليمي 2", "en": "Learning objective 2" }
  ],
  
  "masterMaterialsList": [
    {
      "item": "اسم المادة بالعربية",
      "itemEn": "Material name in English",
      "quantity": "الكمية (مثال: 15 كوب)",
      "preparation": "كيفية التحضير قبل الورشة",
      "placement": "مكان وضعها في القاعة"
    }
  ],
  
  "roomSetupOverview": {
    "layoutDescription": "وصف ترتيب القاعة",
    "zonesNeeded": ["منطقة الدائرة", "منطقة الصنع", "منطقة الحركة"],
    "setupTimeMinutes": 15
  },
  
  "timeline": [
    {
      "blockNumber": 1,
      "title": "عنوان النشاط بالعربية",
      "titleEn": "Activity Title in English",
      "blockType": "دائرة الترحيب",
      "activityType": "تأمل وتفكير",
      
      "exactStartMinute": 0,
      "exactEndMinute": 9,
      "durationMinutes": 9,
      
      "energyLevel": "medium",
      "complexityLevel": "simple",
      
      "facilitatorScript": {
        "roomSetup": "الأطفال جالسون في دائرة على وسائد، الميسر جزء من الدائرة",
        "materialsReady": ["لا مواد خاصة مطلوبة"],
        "openingPhrase": "أهلاً وسهلاً يا أبطال! اليوم عندنا مغامرة رائعة!",
        "mainSteps": [
          {
            "stepNumber": 1,
            "exactAction": "الميسر يجلس في الدائرة ويرحب بالجميع",
            "facilitatorSays": "مين مستعد للمغامرة اليوم؟ ارفعوا أيديكم!",
            "visualCue": "الميسر يرفع يده بحماس",
            "durationSeconds": 30,
            "successIndicator": "معظم الأطفال يرفعون أيديهم"
          },
          {
            "stepNumber": 2,
            "exactAction": "كل طفل يقول اسمه وشيء واحد يحبه",
            "facilitatorSays": "أنا [اسم] وأنا أحب [شيء]. الآن دورك يا [اسم أول طفل]!",
            "visualCue": "الميسر يشير للطفل التالي بعد كل مشاركة",
            "durationSeconds": 120,
            "successIndicator": "كل طفل شارك (حتى لو باختصار)"
          },
          {
            "stepNumber": 3,
            "exactAction": "الميسر يلخص ويحتفل",
            "facilitatorSays": "ما شاء الله! كلنا نحب أشياء مختلفة وهذا اللي يخلينا مميزين!",
            "visualCue": "الميسر يصفق ويشجع الأطفال على التصفيق",
            "durationSeconds": 30,
            "successIndicator": "الأطفال يبتسمون ومسترخين"
          }
        ],
        "closingPhrase": "الحين بنروح لشيء أحلى! يلا قوموا معي!",
        "transitionToNext": "الميسر يقف ويدعو الأطفال للوقوف والانتقال للنشاط التالي"
      },
      
      "materials": [],
      
      "lifeSkillsFocus": ["confidence", "self-expression", "belonging"],
      "confidenceBuildingMoment": "عندما يسمع الطفل تصفيق المجموعة بعد مشاركته",
      "whyItMatters": "المشاركة في بيئة آمنة تبني الثقة بالتحدث أمام الآخرين",
      
      "activityBenefits": {
        "cognitive": "تنمية مهارات التعبير اللفظي وتنظيم الأفكار",
        "emotional": "بناء الشعور بالانتماء والقبول من المجموعة",
        "social": "تعلم الاستماع للآخرين واحترام دورهم"
      },
      
      "troubleshooting": {
        "ifKidsAreBored": "أضف حركة: قف واجلس مع كل مشاركة",
        "ifKidsAreConfused": "أعطِ أمثلة أكثر: أنا أحب الشوكولاتة، أنا أحب كرة القدم...",
        "ifKidsAreTooEnergetic": "استخدم صوت هادئ واطلب منهم الجلوس كالنجوم الهادئة",
        "shyChildTip": "ابدأ بالأطفال المتحمسين، الخجول سيتشجع برؤيتهم",
        "activeChildTip": "أعطه دور مساعدك: أنت تشير للطفل التالي"
      },
      
      "debriefQuestions": [
        "كيف شعرت لما صفقنا لك؟",
        "من اكتشف شيء جديد عن صديقه؟"
      ],
      
      "quickBackupActivity": "لعبة التصفيق: كل واحد يصفق إيقاع والباقي يقلدوه"
    }
  ],
  
  "facilitatorNotes": {
    "beforeWorkshop": [
      "رتب القاعة قبل 15 دقيقة",
      "جهز كل المواد في أماكنها",
      "اختبر أي أدوات تحتاج كهرباء"
    ],
    "duringWorkshop": [
      "راقب طاقة الأطفال واعدل السرعة حسب الحاجة",
      "احتفل بكل محاولة وليس فقط النتائج",
      "استخدم الأنشطة الاحتياطية إذا احتجت وقت إضافي"
    ],
    "afterWorkshop": [
      "تنظيف القاعة مع الأطفال (جزء من التعلم)",
      "شكر كل طفل بشكل فردي عند الخروج",
      "تدوين ملاحظات للتحسين في المرة القادمة"
    ],
    "emergencyContacts": "إدارة المركز الثقافي - هاتف مكتب الاستقبال"
  },
  
  "closingReflection": {
    "title": "ماذا تعلمنا اليوم؟",
    "questions": [
      "ما أحلى شيء سويته اليوم؟",
      "ماذا تريد أن تحكي لأهلك عن اليوم؟"
    ],
    "takeHomeMessage": "أنتم أبطال! كل واحد فيكم عنده قوة خاصة 💪"
  },
  
  "kidsBenefits": {
    "summaryAr": "هذه الورشة تبني ثقة الطفل بنفسه من خلال التعبير والإبداع والمشاركة في بيئة آمنة",
    "summaryEn": "This workshop builds child confidence through expression, creativity, and sharing in a safe environment",
    
    "cognitive": {
      "title": "التطور الذهني 🧠",
      "skills": [
        "التفكير الإبداعي وحل المشكلات",
        "التعبير اللفظي وتنظيم الأفكار",
        "التركيز والانتباه للتعليمات"
      ],
      "example": "عندما يصمم الطفل جرة الشجاعة، يتعلم التخطيط والتنفيذ خطوة بخطوة"
    },
    
    "emotional": {
      "title": "النمو العاطفي ❤️",
      "skills": [
        "الثقة بالنفس والتعبير عن المشاعر",
        "إدارة الخوف والتغلب على الخجل",
        "الفخر بالإنجازات الشخصية"
      ],
      "example": "لحظة التصفيق بعد مشاركة الطفل تعزز شعوره بالقيمة والقبول"
    },
    
    "social": {
      "title": "المهارات الاجتماعية 🤝",
      "skills": [
        "الاستماع الفعال للآخرين",
        "المشاركة في مجموعة باحترام",
        "تقدير اختلاف الآخرين وتنوعهم"
      ],
      "example": "دائرة التعارف تعلم الطفل احترام دوره ودور غيره في الكلام"
    },
    
    "physical": {
      "title": "التطور الجسدي 💪",
      "skills": [
        "المهارات الحركية الدقيقة (القص، التلوين)",
        "التنسيق بين العين واليد",
        "التحكم في الحركة والطاقة"
      ],
      "example": "تزيين الأكواب يطور مهارات الطفل الحركية الدقيقة"
    },
    
    "character": {
      "title": "بناء الشخصية ⭐",
      "skills": [
        "الشجاعة في المحاولة رغم الخوف",
        "المثابرة وإكمال المهام",
        "القيادة والمبادرة"
      ],
      "example": "مشاركة قصة التغلب على الخوف تعلم الطفل أن الشجاعة خيار يومي"
    },
    
    "parentTips": [
      "اسأل طفلك: ما أكثر شيء أعجبك في الورشة؟",
      "اطلب منه أن يعلمك نشاطاً تعلمه",
      "احتفل بمحاولاته وليس فقط نتائجه",
      "ضع جرة الشجاعة في مكان مرئي في المنزل"
    ],
    
    "longTermImpact": "الأطفال الذين يتعلمون التعبير عن أنفسهم في بيئة آمنة يصبحون أكثر ثقة في مواجهة تحديات الحياة"
  }
}
\`\`\`

---

# ⚠️ قواعد JSON المهمة

1. **ابدأ بـ { وانتهِ بـ }** - لا نص قبل أو بعد
2. **لا تستخدم markdown** - JSON فقط، بدون \`\`\`
3. **الفواصل مهمة** - فاصلة بعد كل عنصر إلا الأخير
4. **علامات التنصيص مزدوجة فقط** - "نص" وليس 'نص'
5. **النص العربي لا يحتاج escaping** - "مرحباً" ✅

---

# 🎯 ملخص المطلوب

1. ✅ 6 أنشطة بالضبط
2. ✅ 3-5 خطوات لكل نشاط
3. ✅ كل خطوة فيها: exactAction + facilitatorSays + durationSeconds
4. ✅ قسم troubleshooting لكل نشاط
5. ✅ مواد مع preparation و placement
6. ✅ objectives على الأقل 5
7. ✅ masterMaterialsList على الأقل 8 مواد
8. ✅ kidsBenefits مع 5 مجالات تطورية
9. ✅ activityBenefits لكل نشاط (cognitive, emotional, social)
10. ✅ parentTips على الأقل 4 نصائح

ابدأ الآن!`;
}

// ============================================================================
// USER PROMPT
// ============================================================================

export function buildPDFReadyUserPrompt(config: PDFReadyPromptConfig): string {
  return `# طلب ورشة عمل جديدة

**الموضوع**: "${config.topic}"
**المدة**: ${config.durationMinutes} دقيقة
**الفئة العمرية**: ${config.ageDescriptionAr} (${config.ageDescriptionEn})
**السياق**: مركز ثقافي في تونس، 10-15 طفل، ميزانية محدودة

---

## المطلوب:

أنشئ خطة ورشة عمل كاملة بصيغة JSON تتبع الهيكل المحدد في الأعلى.

**تذكر:**
- 6 أنشطة بالضبط
- كل خطوة فيها العبارة المنطوقة الدقيقة
- كل نشاط فيه قسم troubleshooting
- كل نشاط فيه activityBenefits (cognitive, emotional, social)
- المواد مع تعليمات التحضير والمكان

## 🌟 قسم فوائد الأطفال (مهم جداً!):

أضف قسم "kidsBenefits" الشامل في نهاية JSON:
- **summaryAr/summaryEn**: ملخص قوي للفوائد
- **5 مجالات تطورية**: 
  - cognitive (التطور الذهني)
  - emotional (النمو العاطفي)
  - social (المهارات الاجتماعية)
  - physical (التطور الجسدي)
  - character (بناء الشخصية)
- **parentTips**: 4 نصائح للأهل
- **longTermImpact**: الأثر الطويل المدى

ابدأ الآن بإعادة JSON فقط (بدون أي نص إضافي).`;
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

export interface PDFReadyPromptExport {
  systemPrompt: string;
  userPrompt: string;
  fullPromptForChatGPT: string;
  jsonSchemaExample: string;
}

/**
 * Export the complete prompt as a single copyable string for ChatGPT
 */
export function exportPDFReadyPrompt(config: PDFReadyPromptConfig): PDFReadyPromptExport {
  const systemPrompt = buildPDFReadySystemPrompt(config);
  const userPrompt = buildPDFReadyUserPrompt(config);

  // Combined for easy copy-paste
  const fullPromptForChatGPT = `${systemPrompt}

---

${userPrompt}`;

  // Minimal JSON schema example
  const jsonSchemaExample = JSON.stringify({
    title: { ar: "ورشة: [الموضوع]", en: "Workshop: [Topic]" },
    introduction: { phrase1: "...", phrase2: "...", phrase3: "..." },
    generalInfo: { duration: "...", durationMinutes: 0, ageGroup: "...", participants: "...", roomType: "...", facilitatorCount: "..." },
    objectives: [{ ar: "...", en: "..." }],
    masterMaterialsList: [{ item: "...", itemEn: "...", quantity: "...", preparation: "...", placement: "..." }],
    roomSetupOverview: { layoutDescription: "...", zonesNeeded: ["..."], setupTimeMinutes: 0 },
    timeline: ["6 activities with facilitatorScript..."],
    facilitatorNotes: { beforeWorkshop: ["..."], duringWorkshop: ["..."], afterWorkshop: ["..."], emergencyContacts: "..." },
    closingReflection: { title: "...", questions: ["..."], takeHomeMessage: "..." }
  }, null, 2);

  return {
    systemPrompt,
    userPrompt,
    fullPromptForChatGPT,
    jsonSchemaExample
  };
}

// ============================================================================
// AGE DESCRIPTORS
// ============================================================================

export const PDF_AGE_DESCRIPTORS: Record<string, { ar: string; en: string }> = {
  "6-8": { ar: "6-8 سنة", en: "6-8 years old" },
  "8-10": { ar: "8-10 سنة", en: "8-10 years old" },
  "10-12": { ar: "10-12 سنة", en: "10-12 years old" },
  "8-14": { ar: "8-14 سنة", en: "8-14 years old" },
  "mixed": { ar: "أعمار مختلطة (6-14 سنة)", en: "mixed ages (6-14 years old)" },
};

/**
 * Quick helper to export prompt for a topic
 */
export function quickExportPrompt(
  topic: string,
  durationMinutes: number = 90,
  ageRange: string = "8-10"
): PDFReadyPromptExport {
  const ageInfo = PDF_AGE_DESCRIPTORS[ageRange] || PDF_AGE_DESCRIPTORS["8-10"];

  return exportPDFReadyPrompt({
    topic,
    durationMinutes,
    ageRange,
    ageDescriptionAr: ageInfo.ar,
    ageDescriptionEn: ageInfo.en,
  });
}
