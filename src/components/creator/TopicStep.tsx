"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";

interface TopicStepProps {
    currentTopic: string;
    onTopicSelected: (topic: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const POPULAR_TOPICS = [
    { icon: "👑", title: "القيادة والمبادرة", titleEn: "Leadership" },
    { icon: "💪", title: "الثقة بالنفس", titleEn: "Self-confidence" },
    { icon: "🎨", title: "الإبداع والتفكير", titleEn: "Creativity" },
    { icon: "🤝", title: "العمل الجماعي", titleEn: "Teamwork" },
    { icon: "💬", title: "التواصل الفعّال", titleEn: "Communication" },
    { icon: "🧠", title: "الذكاء العاطفي", titleEn: "Emotional Intelligence" },
    { icon: "🎯", title: "تحديد الأهداف", titleEn: "Goal Setting" },
    { icon: "🌟", title: "اكتشاف المواهب", titleEn: "Talent Discovery" },
];

const AI_SUGGESTIONS = [
    "بناء الصداقات الإيجابية",
    "فن حل المشكلات",
    "إدارة الوقت للأطفال",
    "التعامل مع المشاعر",
    "صنع القرارات الذكية",
    "الاستماع الفعّال",
];

export function TopicStep({
    currentTopic,
    onTopicSelected,
    isLoading,
    setIsLoading,
}: TopicStepProps) {
    const [customTopic, setCustomTopic] = useState(currentTopic);
    const [aiIdeas, setAiIdeas] = useState<string[]>(AI_SUGGESTIONS);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

    const handleTopicClick = (topic: string) => {
        setCustomTopic(topic);
        onTopicSelected(topic);
    };

    const handleCustomSubmit = () => {
        if (customTopic.trim()) {
            onTopicSelected(customTopic.trim());
        }
    };

    const generateMoreIdeas = async () => {
        setIsGeneratingIdeas(true);
        try {
            const response = await fetch("/api/ai/generate-ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: 6 }),
            });

            if (response.ok) {
                const { ideas } = await response.json();
                setAiIdeas(ideas.map((i: { title: string }) => i.title));
            }
        } catch (error) {
            console.error("Failed to generate ideas:", error);
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    اختر موضوع الورشة
                </h2>
                <p className="text-foreground-secondary">
                    ابدأ باختيار موضوع، وسنساعدك في إنشاء خطة كاملة وملصق احترافي
                </p>
            </div>

            {/* Custom Topic Input */}
            <Card variant="bordered" padding="md" className="bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="اكتب موضوعك الخاص..."
                            className="text-lg"
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                        />
                    </div>
                    <Button
                        onClick={handleCustomSubmit}
                        disabled={!customTopic.trim()}
                        size="lg"
                        icon={<span>→</span>}
                    >
                        متابعة
                    </Button>
                </div>
            </Card>

            {/* Popular Topics */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span>📚</span>
                    مواضيع شائعة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {POPULAR_TOPICS.map((topic) => (
                        <button
                            key={topic.title}
                            onClick={() => handleTopicClick(topic.title)}
                            className="group p-4 bg-background-secondary hover:bg-background-tertiary border border-border hover:border-accent/50 rounded-xl transition-all duration-200 text-start hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            <span className="text-2xl mb-2 block">{topic.icon}</span>
                            <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                                {topic.title}
                            </p>
                            <p className="text-xs text-foreground-secondary mt-1">
                                {topic.titleEn}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Suggestions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <span>✨</span>
                        أفكار إبداعية
                    </h3>
                    <button
                        onClick={generateMoreIdeas}
                        disabled={isGeneratingIdeas}
                        className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
                    >
                        {isGeneratingIdeas ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                جاري الإنشاء...
                            </>
                        ) : (
                            <>
                                <span>🎲</span>
                                أفكار جديدة
                            </>
                        )}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {aiIdeas.map((idea) => (
                        <button
                            key={idea}
                            onClick={() => handleTopicClick(idea)}
                            className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full transition-all duration-200 text-sm hover:scale-105"
                        >
                            {idea}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
