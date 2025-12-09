import { NextRequest, NextResponse } from "next/server";
import { buildWorkshopPrompt } from "@/lib/prompts/workshopPrompt";

export interface GenerateWorkshopRequest {
    topic: string;
    duration: "30" | "45" | "60";
    ageRange: "6-8" | "8-10" | "10-12" | "mixed";
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateWorkshopRequest = await request.json();

        // Validate required fields
        if (!body.topic) {
            return NextResponse.json(
                { error: "Missing required field: topic" },
                { status: 400 }
            );
        }

        // Build the prompt for workshop generation
        const { systemPrompt, userPrompt } = buildWorkshopPrompt(body);

        // TODO: Integrate with actual AI text generation service
        // Options:
        // 1. OpenAI GPT-4o: https://platform.openai.com/docs/guides/text-generation
        // 2. Anthropic Claude: https://docs.anthropic.com/claude/reference
        // 3. Google Gemini: https://ai.google.dev/gemini-api
        //
        // Example integration with OpenAI:
        // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // const completion = await openai.chat.completions.create({
        //   model: "gpt-4o",
        //   messages: [
        //     { role: "system", content: systemPrompt },
        //     { role: "user", content: userPrompt }
        //   ],
        //   response_format: { type: "json_object" }
        // });
        // const workshopPlan = JSON.parse(completion.choices[0].message.content);

        console.log("Workshop generation prompts:", { systemPrompt, userPrompt });

        // For now, return a sample workshop plan
        const workshopPlan = generateSampleWorkshopPlan(body);

        return NextResponse.json(workshopPlan);
    } catch (error) {
        console.error("Workshop generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate workshop plan" },
            { status: 500 }
        );
    }
}

function generateSampleWorkshopPlan(input: GenerateWorkshopRequest) {
    const ageLabels: Record<string, string> = {
        "6-8": "6-8 سنة",
        "8-10": "8-10 سنة",
        "10-12": "10-12 سنة",
        "mixed": "أعمار مختلطة (6-12 سنة)",
    };

    const durationNum = parseInt(input.duration);

    return {
        title: {
            ar: `ورشة: ${input.topic}`,
            en: `Workshop: ${input.topic}`,
        },
        generalInfo: {
            duration: `${input.duration} دقيقة`,
            ageGroup: ageLabels[input.ageRange],
            participants: "10-15 طفل",
            level: "مبتدئ",
        },
        objectives: [
            { ar: `يتعرّف الطفل على مفهوم ${input.topic}`, en: `Child learns about ${input.topic}` },
            { ar: "يتدرّب على تقديم نفسه أمام الآخرين", en: "Practice presenting themselves" },
            { ar: "يكتشف نقاط قوته الشخصية", en: "Discover personal strengths" },
            { ar: "يطوّر مهارات التواصل مع الأقران", en: "Develop peer communication skills" },
        ],
        materials: [
            "أوراق بيضاء (ورقة لكل طفل)",
            "أقلام ملوّنة (مجموعة لكل طاولة)",
            "كرة صغيرة للعبة التعارف",
            "ملصقات نجوم ذهبية للمكافآت",
            "لوحة ورقية كبيرة (فليب شارت)",
            "أقلام تخطيط عريضة",
        ],
        timeline: [
            {
                timeRange: "0-10 دقيقة",
                title: "الترحيب وكسر الجليد",
                titleEn: "Welcome & Icebreaker",
                description: "لعبة التعارف بالكرة - يرمي كل طفل الكرة ويقدم نفسه مع ذكر صفة إيجابية",
                instructions: [
                    "رحّب بالأطفال واطلب منهم الجلوس في دائرة",
                    "قدّم نفسك كمثال: 'أنا [اسمك] وأنا شخص [صفة إيجابية]'",
                    "مرر الكرة لطفل وشجعه على تقديم نفسه بنفس الطريقة",
                    "استمر حتى يشارك جميع الأطفال",
                ],
                facilitatorTips: "أعطِ وقتًا كافيًا للأطفال الخجولين. لا تضغط - يمكن للطفل أن يقول 'أمرر' إذا لم يكن جاهزًا.",
            },
            {
                timeRange: `10-${Math.round(durationNum * 0.4)} دقيقة`,
                title: "النشاط الرئيسي الأول",
                titleEn: "Main Activity #1",
                description: `استكشاف مفهوم ${input.topic} من خلال نشاط 'شجرة القوة الشخصية'`,
                instructions: [
                    "وزّع ورقة بيضاء على كل طفل",
                    "اطلب منهم رسم شجرة كبيرة",
                    "الجذور = العائلة والأصدقاء الداعمين",
                    "الجذع = مهاراتهم وقدراتهم",
                    "الأوراق = أحلامهم وأهدافهم",
                    "أعط 10 دقائق للرسم ثم شارك البعض",
                ],
                facilitatorTips: "تجوّل بين الأطفال وشجعهم. لا توجد إجابة خاطئة!",
            },
            {
                timeRange: `${Math.round(durationNum * 0.4)}-${Math.round(durationNum * 0.7)} دقيقة`,
                title: "النشاط الجماعي",
                titleEn: "Group Activity",
                description: "العمل في مجموعات صغيرة لإنشاء 'ميثاق الثقة'",
                instructions: [
                    "قسّم الأطفال إلى مجموعات من 3-4",
                    "أعط كل مجموعة ورقة كبيرة وأقلام",
                    "اطلب منهم كتابة 5 قواعد تساعد على بناء الثقة",
                    "كل مجموعة تقدم ميثاقها أمام الآخرين",
                    "صفّق لكل مجموعة وأضف تعليقات إيجابية",
                ],
                facilitatorTips: "تأكد من مشاركة جميع أعضاء المجموعة. ساعد المجموعات المتعثرة بأسئلة توجيهية.",
            },
            {
                timeRange: `${Math.round(durationNum * 0.7)}-${Math.round(durationNum * 0.85)} دقيقة`,
                title: "لعبة حركية",
                titleEn: "Movement Game",
                description: "لعبة 'القائد والتابعون' لتطبيق ما تعلمناه",
                instructions: [
                    "اختر طفلًا ليكون القائد",
                    "القائد يقوم بحركات والآخرون يقلدونه",
                    "بدّل القائد كل 30 ثانية",
                    "شجع الجميع على المشاركة كقادة",
                ],
                facilitatorTips: "هذه اللعبة تساعد على كسر الروتين وتنشيط الأطفال.",
            },
            {
                timeRange: `${Math.round(durationNum * 0.85)}-${durationNum} دقيقة`,
                title: "الختام والتوديع",
                titleEn: "Wrap-up & Goodbye",
                description: "مراجعة ما تعلمناه وتوزيع شهادات المشاركة",
                instructions: [
                    "اجمع الأطفال في دائرة مرة أخرى",
                    "اسأل: 'ما أهم شيء تعلمته اليوم؟'",
                    "وزّع ملصقات النجوم الذهبية على الجميع",
                    "أعلن عن موضوع الورشة القادمة",
                    "ودّع الأطفال بعبارات تشجيعية",
                ],
                facilitatorTips: "اجعل النهاية إيجابية ومحفزة. كل طفل يجب أن يغادر وهو فخور بنفسه.",
            },
        ],
        facilitatorNotes: [
            "حضّر جميع المواد قبل 15 دقيقة على الأقل من بدء الورشة",
            "تأكد من ترتيب المكان بشكل يسمح بالحركة والعمل الجماعي",
            "احتفظ بأنشطة احتياطية في حال انتهت الأنشطة مبكرًا",
            "كن مرنًا - قد تحتاج لتعديل الأوقات حسب تفاعل المجموعة",
            "التقط صورًا للأنشطة (بموافقة مسبقة من الأهالي)",
            "دوّن ملاحظاتك بعد الورشة لتحسين الجلسات القادمة",
        ],
    };
}
