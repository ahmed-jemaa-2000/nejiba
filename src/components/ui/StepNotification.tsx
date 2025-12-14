"use client";

import { useState, useEffect, useCallback } from "react";
import type { Step } from "@/app/create/page";

interface StepNotificationProps {
    show: boolean;
    currentStep: Step;
    onDismiss: () => void;
    onAction?: () => void;
}

interface NotificationData {
    messageAr: string;
    nextStepAr: string;
    actionLabelAr: string;
    icon: string;
    nextIcon: string;
}

const NOTIFICATIONS: Partial<Record<Step, NotificationData>> = {
    workshop: {
        messageAr: "تم إنشاء خطة الورشة بنجاح!",
        nextStepAr: "الخطوة التالية: تصميم الملصق الإعلاني",
        actionLabelAr: "إنشاء الملصق",
        icon: "✅",
        nextIcon: "🎨"
    },
    poster: {
        messageAr: "تم إنشاء الملصق بنجاح!",
        nextStepAr: "الخطوة التالية: إنشاء حزمة المحتوى اليومي",
        actionLabelAr: "إنشاء المحتوى",
        icon: "✅",
        nextIcon: "📦"
    },
    "content-kit": {
        messageAr: "تم الانتهاء من كل شيء!",
        nextStepAr: "يمكنك الآن تحميل جميع المحتويات ومشاركتها",
        actionLabelAr: "عرض الكل",
        icon: "🎉",
        nextIcon: "📥"
    }
};

export function StepNotification({ show, currentStep, onDismiss, onAction }: StepNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const notification = NOTIFICATIONS[currentStep];

    const handleDismiss = useCallback(() => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsAnimating(false);
            onDismiss();
        }, 300);
    }, [onDismiss]);

    useEffect(() => {
        if (show && notification) {
            setIsVisible(true);
            // Auto-dismiss after 8 seconds
            const timer = setTimeout(handleDismiss, 8000);
            return () => clearTimeout(timer);
        }
    }, [show, notification, handleDismiss]);

    if (!isVisible || !notification) return null;

    return (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
            <div
                className={`max-w-md w-full bg-background border-2 border-accent/30 rounded-2xl shadow-2xl shadow-accent/20 overflow-hidden transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                    }`}
            >
                {/* Progress bar animation */}
                <div className="h-1 bg-accent/20">
                    <div className="h-full bg-accent animate-[shrink_8s_linear_forwards]" />
                </div>

                <div className="p-4">
                    {/* Success message */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{notification.icon}</span>
                        <p className="font-bold text-foreground">{notification.messageAr}</p>
                    </div>

                    {/* Next step hint */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 mb-4">
                        <span className="text-xl">{notification.nextIcon}</span>
                        <p className="text-sm text-foreground-secondary">{notification.nextStepAr}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {onAction && currentStep !== "content-kit" && (
                            <button
                                onClick={() => {
                                    handleDismiss();
                                    onAction();
                                }}
                                className="flex-1 py-2.5 px-4 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                            >
                                {notification.actionLabelAr} →
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="py-2.5 px-4 text-foreground-secondary hover:bg-background-tertiary rounded-xl transition-colors"
                        >
                            تجاهل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// CSS for the shrinking animation (add to globals.css)
// @keyframes shrink { from { width: 100%; } to { width: 0%; } }
