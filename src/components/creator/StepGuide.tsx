"use client";

import { useState } from "react";
import type { Step } from "@/app/create/page";

interface StepGuideProps {
    currentStep: Step;
    isCollapsed?: boolean;
}

interface GuideData {
    titleAr: string;
    descriptionAr: string;
    expectedOutputAr: string;
    timeEstimate: string;
    tips: string[];
    icon: string;
}

const STEP_GUIDES: Record<Step, GuideData> = {
    topic: {
        titleAr: "اختر موضوع الورشة",
        descriptionAr: "اكتب فكرة الورشة أو اختر من الأفكار المقترحة. يمكنك وصف الموضوع بالتفصيل للحصول على نتائج أفضل.",
        expectedOutputAr: "سيتم تحديد موضوع الورشة وننتقل لإنشاء الخطة التفصيلية",
        timeEstimate: "1 دقيقة",
        tips: [
            "اختر موضوعاً يهم الأطفال ويناسب أعمارهم",
            "يمكنك الكتابة بالعربية أو الإنجليزية",
            "كن محدداً في وصف الهدف من الورشة"
        ],
        icon: "💡"
    },
    workshop: {
        titleAr: "إنشاء خطة الورشة",
        descriptionAr: "حدد مدة الورشة والفئة العمرية، ثم اضغط 'إنشاء' ليقوم الذكاء الاصطناعي بتوليد خطة تفصيلية كاملة.",
        expectedOutputAr: "خطة ورشة شاملة تتضمن: الأهداف، الجدول الزمني، الأنشطة، والمواد المطلوبة",
        timeEstimate: "30 ثانية",
        tips: [
            "برنامج CASEL يستخدم 90 دقيقة كمدة قياسية",
            "يمكنك تعديل الأنشطة بعد التوليد",
            "احفظ الخطة كـ PDF للطباعة"
        ],
        icon: "📋"
    },
    poster: {
        titleAr: "تصميم الملصق الإعلاني",
        descriptionAr: "اختر نمط التصميم والألوان، ثم دع الذكاء الاصطناعي يصمم ملصقاً احترافياً للإعلان عن ورشتك.",
        expectedOutputAr: "ملصق احترافي جاهز للنشر على فيسبوك أو إنستغرام",
        timeEstimate: "1 دقيقة",
        tips: [
            "أضف تاريخ ووقت الورشة للملصق",
            "يمكنك إعادة التوليد للحصول على تصميم مختلف",
            "قم بتحميل الملصق بجودة عالية"
        ],
        icon: "🎨"
    },
    "content-kit": {
        titleAr: "إنشاء حزمة المحتوى",
        descriptionAr: "توليد نصائح يومية متعلقة بموضوع الورشة، مع صور مصاحبة لكل نصيحة للنشر على وسائل التواصل.",
        expectedOutputAr: "5 نصائح يومية مع صور جاهزة للنشر طوال الأسبوع",
        timeEstimate: "2 دقيقة",
        tips: [
            "انشر نصيحة واحدة يومياً قبل الورشة",
            "يمكنك تعديل النصوص حسب حاجتك",
            "شارك المحتوى لزيادة التفاعل"
        ],
        icon: "📦"
    }
};

export function StepGuide({ currentStep, isCollapsed: initialCollapsed = false }: StepGuideProps) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    const guide = STEP_GUIDES[currentStep];

    if (!guide) return null;

    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            {/* Header - Always visible */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">
                        {guide.icon}
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-foreground">{guide.titleAr}</h3>
                        <p className="text-xs text-accent">⏱️ {guide.timeEstimate}</p>
                    </div>
                </div>
                <div className={`text-foreground-secondary transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {/* Expandable Content */}
            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"}`}>
                <div className="px-4 pb-4 space-y-4">
                    {/* Description */}
                    <p className="text-foreground-secondary text-sm leading-relaxed">
                        {guide.descriptionAr}
                    </p>

                    {/* Expected Output */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 mb-1 font-medium">✨ النتيجة المتوقعة:</p>
                        <p className="text-sm text-foreground">{guide.expectedOutputAr}</p>
                    </div>

                    {/* Tips */}
                    <div className="space-y-2">
                        <p className="text-xs text-foreground-secondary font-medium">💡 نصائح:</p>
                        <ul className="space-y-1">
                            {guide.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-foreground-secondary">
                                    <span className="text-accent mt-0.5">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
