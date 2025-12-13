"use client";

import { useState } from "react";
import { Button, Card, FieldGroup, Input, Select } from "@/components/ui";
import type { WorkshopInput } from "@/app/workshop/page";

interface WorkshopPlannerProps {
    onGenerate: (input: WorkshopInput) => void;
    isGenerating: boolean;
    initialData?: WorkshopInput | null;
}

const DURATION_OPTIONS = [
    { value: "30", label: "30 دقيقة" },
    { value: "45", label: "45 دقيقة" },
    { value: "60", label: "60 دقيقة" },
    { value: "90", label: "90 دقيقة", sublabel: "CASEL" },
];

const AGE_RANGE_OPTIONS = [
    { value: "6-8", label: "6-8 سنة", sublabel: "أطفال صغار" },
    { value: "8-10", label: "8-10 سنة", sublabel: "أطفال" },
    { value: "10-12", label: "10-12 سنة", sublabel: "ما قبل المراهقة" },
    { value: "10-15", label: "10-15 سنة", sublabel: "مراهقون - CASEL" },
    { value: "mixed", label: "أعمار مختلطة", sublabel: "6-12 سنة" },
];

const TOPIC_SUGGESTIONS = [
    "بناء الثقة بالنفس",
    "التواصل الفعّال",
    "العمل الجماعي",
    "القيادة والمبادرة",
    "التفكير الإبداعي",
    "إدارة المشاعر",
    "حل المشكلات",
    "التعاطف مع الآخرين",
];

export function WorkshopPlanner({ onGenerate, isGenerating, initialData }: WorkshopPlannerProps) {
    const [formData, setFormData] = useState<WorkshopInput>({
        topic: initialData?.topic || "",
        duration: initialData?.duration || "60",
        ageRange: initialData?.ageRange || "8-10",
    });

    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic.trim()) {
            setError("يرجى إدخال موضوع الورشة");
            return;
        }
        setError("");
        onGenerate(formData);
    };

    const selectTopic = (topic: string) => {
        setFormData((prev) => ({ ...prev, topic }));
        setError("");
    };

    return (
        <Card variant="bordered" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Input */}
                <FieldGroup
                    label="موضوع الورشة"
                    sublabel="Workshop Topic"
                    htmlFor="topic"
                    required
                    error={error}
                >
                    <Input
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => {
                            setFormData((prev) => ({ ...prev, topic: e.target.value }));
                            if (error) setError("");
                        }}
                        placeholder="مثال: بناء الثقة بالنفس"
                        error={!!error}
                    />
                </FieldGroup>

                {/* Topic Suggestions */}
                <div>
                    <p className="text-sm text-foreground-secondary mb-3">
                        اقتراحات مواضيع
                        <span className="ms-2 text-foreground-secondary/60">Topic Suggestions</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TOPIC_SUGGESTIONS.map((topic) => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => selectTopic(topic)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                  ${formData.topic === topic
                                        ? "bg-accent text-white"
                                        : "bg-background-tertiary text-foreground-secondary hover:bg-border hover:text-foreground"
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Duration Selection */}
                <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                        مدة الورشة
                        <span className="text-foreground-secondary font-normal ms-2">Duration</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {DURATION_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, duration: option.value as WorkshopInput["duration"] }))}
                                className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 font-medium
                  ${formData.duration === option.value
                                        ? "border-accent bg-accent/10 text-accent"
                                        : "border-border hover:border-border-hover bg-background-tertiary text-foreground"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Age Range Selection */}
                <FieldGroup
                    label="الفئة العمرية"
                    sublabel="Age Range"
                    htmlFor="ageRange"
                >
                    <Select
                        id="ageRange"
                        value={formData.ageRange}
                        onChange={(value) => setFormData((prev) => ({ ...prev, ageRange: value as WorkshopInput["ageRange"] }))}
                        options={AGE_RANGE_OPTIONS}
                    />
                </FieldGroup>

                {/* Generate Button */}
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isGenerating}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                        </svg>
                    }
                >
                    {isGenerating ? "جاري إنشاء الخطة..." : "إنشاء خطة الورشة"}
                </Button>

                {/* Info Note */}
                <p className="text-sm text-center text-foreground-secondary/60">
                    سيتم إنشاء خطة تفصيلية تشمل الأهداف والمواد والجدول الزمني
                </p>
            </form>
        </Card>
    );
}
