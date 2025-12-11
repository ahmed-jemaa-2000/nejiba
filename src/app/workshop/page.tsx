"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkshopPlanner } from "@/components/WorkshopPlanner";
import { WorkshopPlan } from "@/components/WorkshopPlan";

export interface WorkshopInput {
    topic: string;
    duration: "45" | "60" | "90";
    ageRange: "6-8" | "8-10" | "10-12" | "8-14" | "mixed";
}

export interface WorkshopActivity {
    timeRange: string;
    title: string;
    titleEn?: string;
    description: string;
    instructions: string[]; // Kept for backward compatibility
    detailedSteps?: string[]; // New detailed steps
    facilitatorTips?: string;
    // Game metadata
    energyLevel?: "🔋" | "🔋🔋" | "🔋🔋🔋" | string;
    learningGoal?: string;
    shyChildTip?: string;
    activeChildTip?: string;
    gameType?: string;
    funFactor?: string;
    groupSize?: string;
    // Enhanced fields for PDF quality
    setupSteps?: string[]; // 2-4 preparation steps
    variations?: string[]; // 2-3 difficulty levels
    safetyTips?: string; // Age-specific safety considerations
    debriefQuestions?: string[]; // 2-3 reflection questions
}

export interface WorkshopPlanData {
    title: {
        ar: string;
        en: string;
    };
    generalInfo: {
        duration: string;
        ageGroup: string;
        participants: string;
        level: string;
        facilitatorCount?: string;
    };
    objectives: {
        ar: string;
        en?: string;
    }[];
    materials: string[] | { item: string; quantity: string; notes?: string }[];
    roomSetup?: string;
    timeline: WorkshopActivity[];
    // Enhanced closing section
    closingReflection?: {
        title: string;
        duration: string;
        description: string;
        questions: string[];
    };
    // Support both old (string[]) and new (object) format
    facilitatorNotes: string[] | {
        beforeWorkshop?: string[];
        duringWorkshop?: string[];
        emergencyActivities?: { name: string; duration: string; description: string }[];
        commonChallenges?: { challenge: string; solution: string }[];
    };
    emergencyBackup?: string;
}

export default function WorkshopPage() {
    const [step, setStep] = useState<"plan" | "view">("plan");
    const [workshopInput, setWorkshopInput] = useState<WorkshopInput | null>(null);
    const [workshopPlan, setWorkshopPlan] = useState<WorkshopPlanData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (input: WorkshopInput) => {
        setWorkshopInput(input);
        setIsGenerating(true);
        setError(null);

        try {
            // Try the AI-powered endpoint first
            const response = await fetch("/api/ai/generate-workshop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const data = await response.json();

                // If no API key, fall back to sample data
                if (data.code === "NO_API_KEY") {
                    console.log("No OpenAI API key, using sample data");
                    setWorkshopPlan(generateSamplePlan(input));
                    setStep("view");
                    return;
                }

                throw new Error(data.error || "فشل في إنشاء الخطة");
            }

            const result = await response.json();
            setWorkshopPlan(result);
            setStep("view");
        } catch (err) {
            console.error("Generation error:", err);

            // Fall back to sample data
            setWorkshopPlan(generateSamplePlan(input));
            setStep("view");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        setStep("plan");
    };

    const handleRegenerate = () => {
        if (workshopInput) {
            handleGenerate(workshopInput);
        }
    };

    const handleUpdateActivity = (index: number, newActivity: WorkshopActivity) => {
        if (!workshopPlan) return;

        const newTimeline = [...workshopPlan.timeline];
        newTimeline[index] = newActivity;

        setWorkshopPlan({
            ...workshopPlan,
            timeline: newTimeline,
        });
    };

    return (
        <main className="min-h-screen p-6 md:p-8 bg-background">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
                <PageHeader
                    title="تخطيط ورشة"
                    subtitle="Plan Workshop"
                    backHref="/"
                />

                {error && (
                    <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                        {error}
                    </div>
                )}

                {step === "plan" && (
                    <WorkshopPlanner
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        initialData={workshopInput}
                    />
                )}

                {step === "view" && workshopPlan && workshopInput && (
                    <WorkshopPlan
                        plan={workshopPlan}
                        input={workshopInput}
                        onBack={handleBack}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isGenerating}
                        onUpdateActivity={handleUpdateActivity}
                    />
                )}
            </div>
        </main>
    );
}

// Sample plan generator for demo/fallback
function generateSamplePlan(input: WorkshopInput): WorkshopPlanData {
    const ageLabels: Record<string, string> = {
        "6-8": "6-8 سنة",
        "8-10": "8-10 سنة",
        "10-12": "10-12 سنة",
        "8-14": "8-14 سنة",
        "mixed": "أعمار مختلطة (6-14 سنة)",
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
