"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, Card } from "@/components/ui";

interface WorkshopIdea {
    id: string;
    title: string;
    description: string;
    theme: string;
    suggestedDuration: number;
    difficulty: "easy" | "medium" | "hard";
}

const THEME_OPTIONS = [
    { value: "", label: "جميع المواضيع", labelEn: "All themes" },
    { value: "القيادة", label: "القيادة", labelEn: "Leadership" },
    { value: "الإبداع", label: "الإبداع", labelEn: "Creativity" },
    { value: "التواصل", label: "التواصل", labelEn: "Communication" },
    { value: "العمل الجماعي", label: "العمل الجماعي", labelEn: "Teamwork" },
    { value: "الثقة بالنفس", label: "الثقة بالنفس", labelEn: "Self-confidence" },
    { value: "الذكاء العاطفي", label: "الذكاء العاطفي", labelEn: "Emotional Intelligence" },
];

const DIFFICULTY_BADGES: Record<string, { label: string; color: string }> = {
    easy: { label: "سهل", color: "bg-emerald-500/20 text-emerald-400" },
    medium: { label: "متوسط", color: "bg-amber-500/20 text-amber-400" },
    hard: { label: "متقدم", color: "bg-rose-500/20 text-rose-400" },
};

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<WorkshopIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set());

    // Load saved ideas from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("savedIdeas");
        if (saved) {
            setSavedIdeas(new Set(JSON.parse(saved)));
        }
    }, []);

    const generateIdeas = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ai/generate-ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    theme: selectedTheme || undefined,
                    count: 10,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.code === "NO_API_KEY") {
                    // Use sample ideas
                    setIdeas(getSampleIdeas());
                    return;
                }
                throw new Error(data.error || "فشل في إنشاء الأفكار");
            }

            const { ideas: newIdeas } = await response.json();
            setIdeas(newIdeas);
        } catch (err) {
            console.error("Error:", err);
            setIdeas(getSampleIdeas());
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSave = (ideaId: string) => {
        const newSaved = new Set(savedIdeas);
        if (newSaved.has(ideaId)) {
            newSaved.delete(ideaId);
        } else {
            newSaved.add(ideaId);
        }
        setSavedIdeas(newSaved);
        localStorage.setItem("savedIdeas", JSON.stringify([...newSaved]));
    };

    const createWorkshopFromIdea = (idea: WorkshopIdea) => {
        const params = new URLSearchParams({
            topic: idea.title,
            duration: String(idea.suggestedDuration),
        });
        window.location.href = `/workshop?${params.toString()}`;
    };

    return (
        <main className="min-h-screen p-6 md:p-8 bg-background">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <PageHeader
                    title="مولّد الأفكار"
                    subtitle="Ideas Generator"
                    backHref="/"
                />

                {/* Controls */}
                <Card variant="bordered" padding="md" className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                تصنيف الموضوع
                                <span className="text-foreground-secondary font-normal ms-2">Theme Filter</span>
                            </label>
                            <select
                                value={selectedTheme}
                                onChange={(e) => setSelectedTheme(e.target.value)}
                                className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            >
                                {THEME_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                size="lg"
                                onClick={generateIdeas}
                                loading={isLoading}
                                icon={<span className="text-lg">✨</span>}
                            >
                                {isLoading ? "جاري الإنشاء..." : "أنشئ 10 أفكار"}
                            </Button>
                        </div>
                    </div>
                </Card>

                {error && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                        {error}
                    </div>
                )}

                {/* Ideas Grid */}
                {ideas.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {ideas.map((idea) => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                isSaved={savedIdeas.has(idea.id)}
                                onToggleSave={() => toggleSave(idea.id)}
                                onCreateWorkshop={() => createWorkshopFromIdea(idea)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card variant="bordered" padding="lg" className="text-center">
                        <div className="py-12">
                            <span className="text-6xl mb-4 block">💡</span>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                ابدأ بإنشاء أفكار جديدة
                            </h3>
                            <p className="text-foreground-secondary mb-6">
                                اضغط على الزر أعلاه للحصول على 10 أفكار لورشات إبداعية
                            </p>
                            <Button onClick={generateIdeas} loading={isLoading}>
                                ✨ أنشئ أفكار الآن
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </main>
    );
}

interface IdeaCardProps {
    idea: WorkshopIdea;
    isSaved: boolean;
    onToggleSave: () => void;
    onCreateWorkshop: () => void;
}

function IdeaCard({ idea, isSaved, onToggleSave, onCreateWorkshop }: IdeaCardProps) {
    const difficulty = DIFFICULTY_BADGES[idea.difficulty];

    return (
        <Card
            variant="bordered"
            padding="md"
            className="group hover:border-accent/50 transition-all duration-200"
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                        {idea.title}
                    </h3>
                    <button
                        onClick={onToggleSave}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${isSaved
                                ? "text-amber-400 bg-amber-500/20"
                                : "text-foreground-secondary hover:text-amber-400 hover:bg-amber-500/10"
                            }`}
                    >
                        {isSaved ? "★" : "☆"}
                    </button>
                </div>

                {/* Description */}
                <p className="text-foreground-secondary text-sm line-clamp-2">
                    {idea.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-lg">
                        {idea.theme}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-lg ${difficulty.color}`}>
                        {difficulty.label}
                    </span>
                    <span className="px-2 py-1 text-xs bg-background-tertiary text-foreground-secondary rounded-lg">
                        {idea.suggestedDuration} دقيقة
                    </span>
                </div>

                {/* Action */}
                <button
                    onClick={onCreateWorkshop}
                    className="w-full mt-2 px-4 py-2 text-sm bg-background-tertiary hover:bg-accent/20 hover:text-accent border border-border hover:border-accent/50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <span>📋</span>
                    <span>إنشاء خطة ورشة</span>
                </button>
            </div>
        </Card>
    );
}

function getSampleIdeas(): WorkshopIdea[] {
    return [
        {
            id: "1",
            title: "القائد الصغير",
            description: "ورشة تفاعلية لتعليم الأطفال مبادئ القيادة الأساسية من خلال الألعاب والأنشطة الجماعية",
            theme: "القيادة",
            suggestedDuration: 60,
            difficulty: "easy",
        },
        {
            id: "2",
            title: "فنان بلا حدود",
            description: "إطلاق العنان للإبداع من خلال الرسم الحر والتعبير الفني بدون قيود",
            theme: "الإبداع",
            suggestedDuration: 45,
            difficulty: "easy",
        },
        {
            id: "3",
            title: "جسر التواصل",
            description: "تعلم فنون الاستماع الفعال والتعبير عن الأفكار بوضوح",
            theme: "التواصل",
            suggestedDuration: 60,
            difficulty: "medium",
        },
        {
            id: "4",
            title: "فريق الأبطال",
            description: "أنشطة تعاونية لبناء روح الفريق وتقدير دور كل فرد",
            theme: "العمل الجماعي",
            suggestedDuration: 60,
            difficulty: "easy",
        },
        {
            id: "5",
            title: "مرآة الثقة",
            description: "اكتشاف نقاط القوة الشخصية وبناء صورة إيجابية عن الذات",
            theme: "الثقة بالنفس",
            suggestedDuration: 45,
            difficulty: "medium",
        },
        {
            id: "6",
            title: "قوس قزح المشاعر",
            description: "التعرف على المشاعر المختلفة وكيفية التعامل معها بشكل صحي",
            theme: "الذكاء العاطفي",
            suggestedDuration: 60,
            difficulty: "medium",
        },
        {
            id: "7",
            title: "مختبر الأفكار",
            description: "تحفيز التفكير الإبداعي وحل المشكلات بطرق مبتكرة",
            theme: "الإبداع",
            suggestedDuration: 60,
            difficulty: "hard",
        },
        {
            id: "8",
            title: "سفراء السلام",
            description: "تعلم مهارات حل النزاعات والوساطة بين الأقران",
            theme: "التواصل",
            suggestedDuration: 60,
            difficulty: "hard",
        },
        {
            id: "9",
            title: "صانع القرار",
            description: "تعلم كيفية اتخاذ القرارات الذكية والتفكير في العواقب",
            theme: "القيادة",
            suggestedDuration: 45,
            difficulty: "medium",
        },
        {
            id: "10",
            title: "بطل التحديات",
            description: "التعامل مع المخاوف والتحديات وتحويلها إلى فرص للنمو",
            theme: "الثقة بالنفس",
            suggestedDuration: 60,
            difficulty: "medium",
        },
    ];
}
