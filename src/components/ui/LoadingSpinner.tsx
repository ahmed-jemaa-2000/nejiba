"use client";

interface LoadingSpinnerProps {
    message?: string;
    submessage?: string;
    size?: "sm" | "md" | "lg";
}

const LOADING_MESSAGES = [
    "جاري إنشاء المحتوى...",
    "الذكاء الاصطناعي يفكر...",
    "إبداع قيد التحضير...",
    "لحظات وجاهز...",
];

export function LoadingSpinner({
    message,
    submessage,
    size = "md",
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                {/* Outer glow */}
                <div className={`absolute inset-0 ${sizeClasses[size]} border-accent/30 rounded-full blur-sm animate-pulse`} />
                {/* Spinner */}
                <div
                    className={`${sizeClasses[size]} border-accent border-t-transparent rounded-full animate-spin`}
                />
            </div>
            {message && (
                <p className="text-foreground font-medium animate-pulse">{message}</p>
            )}
            {submessage && (
                <p className="text-foreground-secondary text-sm">{submessage}</p>
            )}
        </div>
    );
}

interface GeneratingOverlayProps {
    isVisible: boolean;
    stage?: "thinking" | "generating" | "finishing";
}

export function GeneratingOverlay({ isVisible, stage = "generating" }: GeneratingOverlayProps) {
    if (!isVisible) return null;

    const stageConfig = {
        thinking: {
            icon: "🤔",
            message: "الذكاء الاصطناعي يفكر...",
            submessage: "تحليل الموضوع وإعداد المحتوى",
        },
        generating: {
            icon: "✨",
            message: "جاري إنشاء المحتوى...",
            submessage: "إبداع الأفكار والأنشطة",
        },
        finishing: {
            icon: "🎯",
            message: "اللمسات الأخيرة...",
            submessage: "تنسيق الخطة النهائية",
        },
    };

    const config = stageConfig[stage];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-6 p-8">
                {/* Animated icon */}
                <div className="relative inline-block">
                    <span className="text-6xl animate-bounce" style={{ animationDuration: "1.5s" }}>
                        {config.icon}
                    </span>
                    {/* Sparkles */}
                    <span className="absolute -top-2 -right-2 text-2xl animate-ping">✨</span>
                    <span className="absolute -bottom-2 -left-2 text-2xl animate-ping" style={{ animationDelay: "0.5s" }}>✨</span>
                </div>

                {/* Spinner */}
                <LoadingSpinner size="lg" />

                {/* Messages */}
                <div className="space-y-2">
                    <p className="text-xl font-bold text-foreground">{config.message}</p>
                    <p className="text-foreground-secondary">{config.submessage}</p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-accent animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SuccessConfetti() {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: "-10px",
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                >
                    <span
                        className="text-2xl"
                        style={{ transform: `rotate(${Math.random() * 360}deg)` }}
                    >
                        {["🌟", "✨", "🎉", "🎊", "⭐"][Math.floor(Math.random() * 5)]}
                    </span>
                </div>
            ))}
        </div>
    );
}
