"use client";

import { useState, useEffect } from "react";

interface GenerationLoaderProps {
    isVisible: boolean;
    type?: "poster" | "workshop" | "tips";
}

const GENERATION_STAGES = {
    poster: [
        { message: "تحليل موضوع الورشة...", icon: "🔍", duration: 2000 },
        { message: "تصميم التكوين البصري...", icon: "🎨", duration: 3000 },
        { message: "إضافة الألوان والتفاصيل...", icon: "🌈", duration: 3000 },
        { message: "اللمسات الأخيرة...", icon: "✨", duration: 2000 },
    ],
    workshop: [
        { message: "تحليل الموضوع التعليمي...", icon: "📚", duration: 2000 },
        { message: "تصميم الأنشطة التفاعلية...", icon: "🎯", duration: 3000 },
        { message: "إعداد الجدول الزمني...", icon: "⏰", duration: 2000 },
        { message: "إضافة نصائح الميسّر...", icon: "💡", duration: 2000 },
    ],
    tips: [
        { message: "تحليل محتوى الورشة...", icon: "🔍", duration: 2000 },
        { message: "إنشاء النصائح اليومية...", icon: "📝", duration: 3000 },
        { message: "تصميم المحتوى المرئي...", icon: "🎨", duration: 3000 },
    ],
};

const FUN_TIPS = [
    "هل تعلم؟ الأطفال يتعلمون أفضل من خلال اللعب! 🎮",
    "نصيحة: الابتسامة تجعل التعلم أسهل 😊",
    "هل تعلم؟ ٤٥ دقيقة هي المدة المثالية للورشة! ⏰",
    "نصيحة: تفاعل مع الأطفال بأسئلة مفتوحة 💬",
    "هل تعلم؟ الحركة تساعد الدماغ على التركيز! 🏃",
    "نصيحة: استخدم الألوان الزاهية لجذب الانتباه 🌈",
    "هل تعلم؟ الموسيقى تحسن المزاج والتعلم! 🎵",
    "نصيحة: امنح كل طفل فرصة للمشاركة ⭐",
];

export function GenerationLoader({ isVisible, type = "poster" }: GenerationLoaderProps) {
    const [currentStage, setCurrentStage] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);
    const stages = GENERATION_STAGES[type];

    useEffect(() => {
        if (!isVisible) {
            setCurrentStage(0);
            return;
        }

        let totalTime = 0;
        const timers: NodeJS.Timeout[] = [];

        stages.forEach((stage, index) => {
            if (index > 0) {
                const timer = setTimeout(() => {
                    setCurrentStage(index);
                }, totalTime);
                timers.push(timer);
            }
            totalTime += stage.duration;
        });

        // Cycle tips every 3 seconds
        const tipTimer = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % FUN_TIPS.length);
        }, 3000);

        return () => {
            timers.forEach(t => clearTimeout(t));
            clearInterval(tipTimer);
        };
    }, [isVisible, stages]);

    if (!isVisible) return null;

    const stage = stages[currentStage];
    const progress = ((currentStage + 1) / stages.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg">
            <div className="max-w-md w-full mx-4 text-center space-y-8">
                {/* Animated Icon */}
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shadow-2xl shadow-accent/20">
                        <span className="text-6xl animate-bounce" style={{ animationDuration: "1.5s" }}>
                            {stage.icon}
                        </span>
                    </div>
                </div>

                {/* Progress Text */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground animate-pulse">
                        {stage.message}
                    </h3>

                    {/* Progress Bar */}
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Stage Indicators */}
                    <div className="flex justify-center gap-2">
                        {stages.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index <= currentStage
                                        ? "bg-accent scale-125"
                                        : "bg-border"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Fun Tip */}
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                    <p className="text-sm text-accent animate-in fade-in duration-500" key={currentTip}>
                        {FUN_TIPS[currentTip]}
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="flex justify-center gap-4 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-accent animate-ping" style={{ animationDelay: "0s" }} />
                    <div className="w-3 h-3 rounded-full bg-accent animate-ping" style={{ animationDelay: "0.2s" }} />
                    <div className="w-3 h-3 rounded-full bg-accent animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
            </div>
        </div>
    );
}

export default GenerationLoader;
