"use client";

import { useState } from "react";
import { Button, Card, FieldGroup, Input, TextArea, Select } from "@/components/ui";
import type { PosterData } from "@/app/poster/page";

interface PosterCreatorProps {
    onGenerate: (data: PosterData) => void;
    isGenerating: boolean;
    initialData?: PosterData | null;
}

const FORMAT_OPTIONS = [
    { value: "facebook", label: "فيسبوك (16:9)", sublabel: "Facebook Post" },
    { value: "instagram", label: "إنستغرام ستوري (9:16)", sublabel: "Instagram Story" },
];

const AUDIENCE_OPTIONS = [
    { value: "children", label: "أطفال (6-12 سنة)" },
    { value: "teens", label: "مراهقين (13-17 سنة)" },
    { value: "adults", label: "بالغين" },
    { value: "families", label: "عائلات" },
    { value: "all", label: "الجميع" },
];

export function PosterCreator({ onGenerate, isGenerating, initialData }: PosterCreatorProps) {
    const [formData, setFormData] = useState<PosterData>({
        format: initialData?.format || "facebook",
        title: initialData?.title || "",
        date: initialData?.date || "",
        time: initialData?.time || "",
        place: initialData?.place || "دار الثقافة بن عروس",
        audience: initialData?.audience || "children",
        description: initialData?.description || "",
        descriptionFr: initialData?.descriptionFr || "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof PosterData, string>>>({});

    const updateField = <K extends keyof PosterData>(field: K, value: PosterData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof PosterData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = "العنوان مطلوب";
        }
        if (!formData.date.trim()) {
            newErrors.date = "التاريخ مطلوب";
        }
        if (!formData.time.trim()) {
            newErrors.time = "الوقت مطلوب";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onGenerate(formData);
        }
    };

    return (
        <Card variant="bordered" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Format Selection */}
                <div className="grid grid-cols-2 gap-3">
                    {FORMAT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField("format", option.value as "facebook" | "instagram")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-start
                ${formData.format === option.value
                                    ? "border-accent bg-accent/10"
                                    : "border-border hover:border-border-hover bg-background-tertiary"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${formData.format === option.value ? "bg-accent/20" : "bg-background-secondary"}`}
                                >
                                    {option.value === "facebook" ? (
                                        <span className="text-lg">📘</span>
                                    ) : (
                                        <span className="text-lg">📸</span>
                                    )}
                                </div>
                                <div className={`w-2 h-2 rounded-full transition-colors
                  ${formData.format === option.value ? "bg-accent" : "bg-border"}`}
                                />
                            </div>
                            <p className="font-medium text-foreground">{option.label}</p>
                            <p className="text-sm text-foreground-secondary">{option.sublabel}</p>
                        </button>
                    ))}
                </div>

                <div className="h-px bg-border" />

                {/* Event Details */}
                <FieldGroup label="عنوان الفعالية" sublabel="Event Title" htmlFor="title" required error={errors.title}>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="مثال: ورشة بناء الثقة بالنفس"
                        error={!!errors.title}
                    />
                </FieldGroup>

                <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="التاريخ" sublabel="Date" htmlFor="date" required error={errors.date}>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => updateField("date", e.target.value)}
                            error={!!errors.date}
                        />
                    </FieldGroup>

                    <FieldGroup label="الوقت" sublabel="Time" htmlFor="time" required error={errors.time}>
                        <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => updateField("time", e.target.value)}
                            error={!!errors.time}
                        />
                    </FieldGroup>
                </div>

                <FieldGroup label="المكان" sublabel="Location" htmlFor="place">
                    <Input
                        id="place"
                        value={formData.place}
                        onChange={(e) => updateField("place", e.target.value)}
                        placeholder="دار الثقافة بن عروس"
                    />
                </FieldGroup>

                <FieldGroup label="الفئة المستهدفة" sublabel="Target Audience" htmlFor="audience">
                    <Select
                        id="audience"
                        value={formData.audience}
                        onChange={(value) => updateField("audience", value)}
                        options={AUDIENCE_OPTIONS}
                    />
                </FieldGroup>

                <FieldGroup label="وصف (بالعربية)" sublabel="Description (Arabic)" htmlFor="description">
                    <TextArea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="وصف قصير للفعالية..."
                        rows={3}
                    />
                </FieldGroup>

                <FieldGroup label="وصف (بالفرنسية)" sublabel="Description (French) - Optional" htmlFor="descriptionFr">
                    <TextArea
                        id="descriptionFr"
                        value={formData.descriptionFr}
                        onChange={(e) => updateField("descriptionFr", e.target.value)}
                        placeholder="Description en français (optionnel)..."
                        rows={2}
                        className="text-start"
                        dir="ltr"
                    />
                </FieldGroup>

                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isGenerating}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v18" />
                            <path d="m9 6 3-3 3 3" />
                            <path d="M3 12h18" />
                        </svg>
                    }
                >
                    {isGenerating ? "جاري الإنشاء..." : "إنشاء الملصق"}
                </Button>
            </form>
        </Card>
    );
}
