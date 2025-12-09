"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { ActivityRegenerator } from "@/components/ActivityRegenerator";
import type { WorkshopPlanData, WorkshopInput, WorkshopActivity } from "@/app/workshop/page";

interface WorkshopPlanProps {
    plan: WorkshopPlanData;
    input: WorkshopInput;
    onBack: () => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
    onUpdateActivity?: (index: number, activity: WorkshopActivity) => void;
}

export function WorkshopPlan({
    plan,
    input,
    onBack,
    onRegenerate,
    isRegenerating,
    onUpdateActivity,
}: WorkshopPlanProps) {
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleActivityRegenerated = (index: number, newActivity: WorkshopActivity) => {
        setRegeneratingIndex(null);
        onUpdateActivity?.(index, newActivity);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card variant="bordered" padding="lg" className="print:border-none print:shadow-none relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />

                <div className="relative text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-3 animate-pulse">
                        <span className="text-3xl">🌟</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        {plan.title.ar}
                    </h2>
                    <p className="text-foreground-secondary">{plan.title.en}</p>
                </div>
            </Card>

            {/* General Info */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <span>📊</span>
                    معلومات عامة
                    <span className="text-foreground-secondary font-normal text-sm">General Info</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <InfoBadge label="المدة" value={plan.generalInfo.duration} />
                    <InfoBadge label="الفئة العمرية" value={plan.generalInfo.ageGroup} />
                    <InfoBadge label="عدد المشاركين" value={plan.generalInfo.participants} />
                    <InfoBadge label="المستوى" value={plan.generalInfo.level} />
                </div>
            </Card>

            {/* Learning Objectives */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <span>🎯</span>
                    أهداف التعلّم
                    <span className="text-foreground-secondary font-normal text-sm">Learning Objectives</span>
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                    {plan.objectives.map((obj, i) => (
                        <li key={i} className="text-foreground">
                            {obj.ar}
                            {obj.en && (
                                <span className="text-foreground-secondary text-sm ms-2 block md:inline print:inline">
                                    ({obj.en})
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </Card>

            {/* Materials */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <span>🧰</span>
                    المواد المطلوبة
                    <span className="text-foreground-secondary font-normal text-sm">Materials Needed</span>
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.materials.map((material, i) => (
                        <li key={i} className="flex items-center gap-3 text-foreground">
                            <span className="w-5 h-5 border-2 border-border rounded flex-shrink-0 print:border-gray-400" />
                            {material}
                        </li>
                    ))}
                </ul>
            </Card>

            {/* Timeline - THE KEY FEATURE */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <span>⏰</span>
                        الجدول الزمني
                        <span className="text-foreground-secondary font-normal text-sm">Timeline</span>
                    </h3>
                    <span className="text-sm text-foreground-secondary no-print">
                        اضغط على 🔄 لتجديد أي نشاط
                    </span>
                </div>

                <div className="space-y-4">
                    {plan.timeline.map((activity, i) => (
                        <TimelineActivity
                            key={i}
                            activity={activity}
                            index={i}
                            isLast={i === plan.timeline.length - 1}
                            isRegenerating={regeneratingIndex === i}
                            workshopPlan={plan}
                            onStartRegenerate={() => setRegeneratingIndex(i)}
                            onActivityRegenerated={(newActivity) => handleActivityRegenerated(i, newActivity)}
                            onCancelRegenerate={() => setRegeneratingIndex(null)}
                        />
                    ))}
                </div>
            </Card>

            {/* Facilitator Notes */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <span>📝</span>
                    ملاحظات للميسّر
                    <span className="text-foreground-secondary font-normal text-sm">Facilitator Notes</span>
                </h3>
                <ul className="space-y-2">
                    {plan.facilitatorNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                            <span className="text-accent mt-1">•</span>
                            {note}
                        </li>
                    ))}
                </ul>
            </Card>


            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 no-print">
                <Button variant="secondary" size="lg" fullWidth onClick={onBack}>
                    ← تعديل الموضوع
                </Button>
                <Button variant="secondary" size="lg" fullWidth onClick={onRegenerate} loading={isRegenerating}>
                    🔄 إنشاء خطة جديدة
                </Button>
                <Button
                    size="lg"
                    fullWidth
                    onClick={handlePrint}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect width="12" height="8" x="6" y="14" />
                        </svg>
                    }
                >
                    طباعة الخطة
                </Button>
            </div>
        </div>
    );
}

// Sub-components

function InfoBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 bg-background-tertiary rounded-lg print:bg-gray-100">
            <p className="text-sm text-foreground-secondary">{label}</p>
            <p className="font-medium text-foreground">{value}</p>
        </div>
    );
}

interface TimelineActivityProps {
    activity: WorkshopActivity;
    index: number;
    isLast: boolean;
    isRegenerating: boolean;
    workshopPlan: WorkshopPlanData;
    onStartRegenerate: () => void;
    onActivityRegenerated: (activity: WorkshopActivity) => void;
    onCancelRegenerate: () => void;
}

function TimelineActivity({
    activity,
    index,
    isLast,
    isRegenerating,
    workshopPlan,
    onStartRegenerate,
    onActivityRegenerated,
    onCancelRegenerate,
}: TimelineActivityProps) {
    const colors = ["bg-accent", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
    const dotColor = colors[index % colors.length];

    return (
        <div
            className={`relative border-r-2 border-accent/30 pr-4 pb-4 transition-all duration-300 ${isLast ? "pb-0" : ""
                } ${isRegenerating ? "opacity-50" : ""}`}
        >
            {/* Timeline dot */}
            <div className={`absolute -right-[9px] top-0 w-4 h-4 rounded-full ${dotColor} shadow-lg`} />

            <div className="space-y-2">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium text-white ${dotColor} px-2 py-0.5 rounded`}>
                        {activity.timeRange}
                    </span>
                    <h4 className="font-bold text-foreground">{activity.title}</h4>
                    {activity.titleEn && (
                        <span className="text-sm text-foreground-secondary">({activity.titleEn})</span>
                    )}
                </div>

                {/* Description */}
                <p className="text-foreground-secondary">{activity.description}</p>

                {/* Instructions */}
                {activity.instructions.length > 0 && (
                    <div className="mt-2 p-3 bg-background-tertiary rounded-lg print:bg-gray-100">
                        <p className="text-sm font-medium text-foreground mb-2">الخطوات:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground-secondary">
                            {activity.instructions.map((instruction, j) => (
                                <li key={j}>{instruction}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Facilitator Tips */}
                {activity.facilitatorTips && (
                    <div className="mt-2 p-3 bg-accent/10 rounded-lg border border-accent/20 print:bg-blue-50 print:border-blue-200">
                        <p className="text-sm text-accent">
                            <span className="font-medium">💡 نصيحة:</span> {activity.facilitatorTips}
                        </p>
                    </div>
                )}

                {/* Regeneration Controls - NO PRINT */}
                <div className="no-print mt-3 pt-3 border-t border-border/50">
                    {isRegenerating ? (
                        <ActivityRegenerator
                            workshopPlan={workshopPlan}
                            activityIndex={index}
                            onActivitySelected={onActivityRegenerated}
                            onCancel={onCancelRegenerate}
                        />
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={onStartRegenerate}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background-secondary hover:bg-background-tertiary border border-border hover:border-accent/50 rounded-lg transition-all duration-200 text-foreground-secondary hover:text-foreground"
                            >
                                <span>🔄</span>
                                <span>جدّد</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
