"use client";

import { useState } from "react";

interface PipelineOverviewProps {
    isOpen: boolean;
    onClose: () => void;
    onStart?: () => void;
}

const PIPELINE_STEPS = [
    {
        number: "1️⃣",
        titleAr: "الفكرة",
        descriptionAr: "اختيار موضوع الورشة",
        timeAr: "1 دقيقة",
        outputAr: "موضوع محدد",
        color: "from-blue-500 to-blue-600"
    },
    {
        number: "2️⃣",
        titleAr: "الخطة",
        descriptionAr: "إنشاء خطة تفصيلية بالذكاء الاصطناعي",
        timeAr: "30 ثانية",
        outputAr: "خطة كاملة + PDF",
        color: "from-purple-500 to-purple-600"
    },
    {
        number: "3️⃣",
        titleAr: "الملصق",
        descriptionAr: "تصميم ملصق إعلاني احترافي",
        timeAr: "1 دقيقة",
        outputAr: "صورة للنشر",
        color: "from-pink-500 to-pink-600"
    },
    {
        number: "4️⃣",
        titleAr: "المحتوى",
        descriptionAr: "إنشاء نصائح يومية مع صور",
        timeAr: "2 دقيقة",
        outputAr: "5 نصائح + صور",
        color: "from-emerald-500 to-emerald-600"
    }
];

export function PipelineOverview({ isOpen, onClose, onStart }: PipelineOverviewProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
            onClose();
        }, 200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${isAnimating ? "opacity-0" : "opacity-100"
                    }`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-lg bg-background border border-border rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-border bg-gradient-to-r from-accent/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎯</span>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">رحلة إنشاء محتوى الورشة</h2>
                                <p className="text-sm text-foreground-secondary">4 خطوات سهلة • ~5 دقائق إجمالي</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-full bg-background-tertiary hover:bg-border flex items-center justify-center text-foreground-secondary hover:text-foreground transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Steps */}
                <div className="p-6 space-y-4">
                    {PIPELINE_STEPS.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                                    {step.number}
                                </div>
                                {index < PIPELINE_STEPS.length - 1 && (
                                    <div className="w-0.5 h-8 bg-border mt-2" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-foreground">{step.titleAr}</h3>
                                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                        ⏱️ {step.timeAr}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground-secondary mb-1">{step.descriptionAr}</p>
                                <p className="text-xs text-emerald-400">→ النتيجة: {step.outputAr}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-background-secondary">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                handleClose();
                                onStart?.();
                            }}
                            className="flex-1 py-3 px-6 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors"
                        >
                            ✓ فهمت، لنبدأ!
                        </button>
                        <button
                            onClick={handleClose}
                            className="py-3 px-4 text-foreground-secondary hover:text-foreground hover:bg-background-tertiary rounded-xl transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                    <p className="text-center text-xs text-foreground-secondary/60 mt-3">
                        💡 يمكنك الضغط على "؟" في أي وقت لعرض هذا الدليل
                    </p>
                </div>
            </div>
        </div>
    );
}
