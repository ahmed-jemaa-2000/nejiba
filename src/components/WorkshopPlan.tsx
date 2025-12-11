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
        <div className="space-y-6" dir="rtl">
            {/* Header - Works on both Screen and Print */}
            <Card variant="bordered" padding="lg" className="print:border-2 print:border-blue-500 relative overflow-hidden">
                {/* Decorative gradient - hide on print */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none print:hidden" />

                <div className="relative text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-3 animate-pulse print:hidden">
                        <span className="text-3xl">🌟</span>
                    </div>

                    {/* Print header info */}
                    <div className="hidden print:block text-sm text-gray-500 mb-2">
                        نادي الطفل القائد • {new Date().toLocaleDateString('ar-TN')}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-foreground print:text-blue-800">
                        {plan.title.ar}
                    </h2>
                    <p className="text-foreground-secondary print:text-gray-600">{plan.title.en}</p>

                    {/* Quick stats for print */}
                    <div className="hidden print:flex justify-center gap-4 text-sm text-gray-600 mt-4">
                        <span>⏱️ {plan.generalInfo.duration}</span>
                        <span>👥 {plan.generalInfo.ageGroup}</span>
                        <span>🎯 {plan.timeline.length} أنشطة</span>
                    </div>
                </div>
            </Card>

            {/* Executive Summary - Works on both Screen and Print */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2 print:text-gray-800">
                    <span>📋</span>
                    ملخص تنفيذي
                    <span className="text-foreground-secondary font-normal text-sm print:text-gray-500">Executive Summary</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 bg-background-tertiary rounded-lg text-center print:bg-gray-50 print:border print:border-gray-200">
                        <p className="text-2xl mb-1">⏱️</p>
                        <p className="text-sm text-foreground-secondary print:text-gray-600">المدة الإجمالية</p>
                        <p className="font-bold text-foreground print:text-gray-800">{plan.generalInfo.duration}</p>
                    </div>
                    <div className="p-3 bg-background-tertiary rounded-lg text-center print:bg-gray-50 print:border print:border-gray-200">
                        <p className="text-2xl mb-1">🎯</p>
                        <p className="text-sm text-foreground-secondary print:text-gray-600">عدد الأنشطة</p>
                        <p className="font-bold text-foreground print:text-gray-800">{plan.timeline.length} أنشطة</p>
                    </div>
                    <div className="p-3 bg-background-tertiary rounded-lg text-center print:bg-gray-50 print:border print:border-gray-200">
                        <p className="text-2xl mb-1">📦</p>
                        <p className="text-sm text-foreground-secondary print:text-gray-600">المواد المطلوبة</p>
                        <p className="font-bold text-foreground print:text-gray-800">{plan.materials.length} عناصر</p>
                    </div>
                    <div className="p-3 bg-background-tertiary rounded-lg text-center print:bg-gray-50 print:border print:border-gray-200">
                        <p className="text-2xl mb-1">👥</p>
                        <p className="text-sm text-foreground-secondary print:text-gray-600">المشاركون</p>
                        <p className="font-bold text-foreground print:text-gray-800">{plan.generalInfo.participants}</p>
                    </div>
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
                            {typeof material === 'string' ? (
                                material
                            ) : (
                                <span>
                                    <strong>{material.item}</strong>
                                    {material.quantity && <span className="text-foreground-secondary"> ({material.quantity})</span>}
                                    {material.notes && <span className="text-foreground-secondary text-sm"> - {material.notes}</span>}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>

            {/* Room Setup - NEW */}
            {plan.roomSetup && (
                <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                    <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                        <span>🏠</span>
                        ترتيب الغرفة
                        <span className="text-foreground-secondary font-normal text-sm">Room Setup</span>
                    </h3>
                    <p className="text-foreground-secondary">{plan.roomSetup}</p>
                </Card>
            )}

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

            {/* Closing Reflection - NEW */}
            {plan.closingReflection && (
                <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                    <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                        <span>🌟</span>
                        {plan.closingReflection.title}
                        <span className="text-foreground-secondary font-normal text-sm">Closing Reflection</span>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">{plan.closingReflection.duration}</span>
                    </h3>
                    <p className="text-foreground-secondary mb-4">{plan.closingReflection.description}</p>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground">أسئلة للتأمل:</p>
                        <ul className="space-y-1">
                            {plan.closingReflection.questions.map((q, i) => (
                                <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                                    <span className="text-accent">{i + 1}.</span>
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            )}

            {/* Facilitator Notes - Updated to handle both formats */}
            <Card variant="bordered" padding="md" className="print:border print:border-gray-300">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <span>📝</span>
                    ملاحظات للميسّر
                    <span className="text-foreground-secondary font-normal text-sm">Facilitator Notes</span>
                </h3>

                {/* Handle both string[] and object formats */}
                {Array.isArray(plan.facilitatorNotes) ? (
                    // Legacy format: string[]
                    <ul className="space-y-2">
                        {plan.facilitatorNotes.map((note: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                                <span className="text-accent mt-1">•</span>
                                {note}
                            </li>
                        ))}
                    </ul>
                ) : (
                    // New structured format
                    <div className="space-y-4">
                        {/* Before Workshop */}
                        {plan.facilitatorNotes.beforeWorkshop && plan.facilitatorNotes.beforeWorkshop.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-foreground mb-2">🛠️ قبل الورشة:</p>
                                <ul className="space-y-1">
                                    {plan.facilitatorNotes.beforeWorkshop.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-foreground-secondary text-sm">
                                            <span className="text-accent">•</span>
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* During Workshop */}
                        {plan.facilitatorNotes.duringWorkshop && plan.facilitatorNotes.duringWorkshop.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-foreground mb-2">🎯 أثناء الورشة:</p>
                                <ul className="space-y-1">
                                    {plan.facilitatorNotes.duringWorkshop.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-foreground-secondary text-sm">
                                            <span className="text-accent">•</span>
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Emergency Activities */}
                        {plan.facilitatorNotes.emergencyActivities && plan.facilitatorNotes.emergencyActivities.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-foreground mb-2">🆘 ألعاب بديلة سريعة:</p>
                                <div className="space-y-2">
                                    {plan.facilitatorNotes.emergencyActivities.map((activity, i) => (
                                        <div key={i} className="p-2 bg-background-secondary rounded text-sm">
                                            <p className="font-medium text-foreground">{activity.name} <span className="text-foreground-secondary">({activity.duration})</span></p>
                                            <p className="text-foreground-secondary">{activity.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Common Challenges */}
                        {plan.facilitatorNotes.commonChallenges && plan.facilitatorNotes.commonChallenges.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-foreground mb-2">⚠️ تحديات شائعة وحلولها:</p>
                                <div className="space-y-2">
                                    {plan.facilitatorNotes.commonChallenges.map((item, i) => (
                                        <div key={i} className="p-2 bg-yellow-500/10 rounded text-sm">
                                            <p className="font-medium text-yellow-400 print:text-yellow-700">التحدي: {item.challenge}</p>
                                            <p className="text-foreground-secondary">الحل: {item.solution}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Emergency Backup */}
            {plan.emergencyBackup && (
                <Card variant="bordered" padding="md" className="print:border print:border-gray-300 bg-red-500/5">
                    <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                        <span>🆘</span>
                        لعبة احتياطية
                        <span className="text-foreground-secondary font-normal text-sm">Emergency Backup</span>
                    </h3>
                    <p className="text-foreground-secondary">{plan.emergencyBackup}</p>
                </Card>
            )}


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

    // Get detailedSteps or fall back to instructions for backward compatibility
    const steps = (activity as any).detailedSteps || activity.instructions || [];
    const energyLevel = (activity as any).energyLevel;
    const learningGoal = (activity as any).learningGoal;
    const shyChildTip = (activity as any).shyChildTip;
    const activeChildTip = (activity as any).activeChildTip;

    return (
        <div
            className={`relative border-r-2 border-accent/30 pr-4 pb-6 transition-all duration-300 print:break-inside-avoid ${isLast ? "pb-0" : ""
                } ${isRegenerating ? "opacity-50" : ""}`}
        >
            {/* Timeline dot */}
            <div className={`absolute -right-[9px] top-0 w-4 h-4 rounded-full ${dotColor} shadow-lg print:shadow-none`} />

            <div className="space-y-3">
                {/* Header with Energy Level and Game Type */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium text-white ${dotColor} px-2 py-0.5 rounded print:text-black print:bg-gray-200`}>
                        {activity.timeRange}
                    </span>
                    {energyLevel && (
                        <span className="text-sm px-2 py-0.5 bg-background-secondary rounded print:bg-gray-100">
                            {energyLevel}
                        </span>
                    )}
                    {(activity as any).gameType && (
                        <span className="text-sm px-2 py-0.5 bg-green-500/20 text-green-400 rounded print:bg-green-100 print:text-green-700">
                            🎮 {(activity as any).gameType}
                        </span>
                    )}
                    <h4 className="font-bold text-foreground print:text-black">{activity.title}</h4>
                    {activity.titleEn && (
                        <span className="text-sm text-foreground-secondary print:text-gray-600">({activity.titleEn})</span>
                    )}
                </div>

                {/* Fun Factor - Why kids will LOVE this */}
                {(activity as any).funFactor && (
                    <div className="flex items-start gap-2 text-sm bg-yellow-500/10 text-yellow-400 p-2 rounded-lg print:bg-yellow-50 print:text-yellow-700">
                        <span>🎉</span>
                        <span><strong>لماذا سيحب الأطفال:</strong> {(activity as any).funFactor}</span>
                    </div>
                )}

                {/* Learning Goal */}
                {learningGoal && (
                    <div className="flex items-start gap-2 text-sm text-accent print:text-blue-700">
                        <span>🎯</span>
                        <span><strong>الهدف:</strong> {learningGoal}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-foreground-secondary print:text-gray-700">{activity.description}</p>

                {/* Setup Steps - NEW */}
                {activity.setupSteps && activity.setupSteps.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 print:bg-blue-50 print:border-blue-200">
                        <p className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2 print:text-blue-700">
                            <span>🛠️</span>
                            التحضير قبل البدء
                            <span className="font-normal text-xs">Setup</span>
                        </p>
                        <ul className="space-y-1 text-sm text-foreground-secondary">
                            {activity.setupSteps.map((step, j) => (
                                <li key={j} className="flex items-start gap-2">
                                    <span className="text-blue-400">•</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Detailed Steps - Handle both new object format and legacy string format */}
                {(() => {
                    // Try to get steps from various sources
                    const stepsData = (activity as any).steps || (activity as any).detailedSteps || activity.instructions || [];

                    if (stepsData.length === 0) return null;

                    // Check if it's the new object format or legacy string format
                    const isNewFormat = typeof stepsData[0] === 'object' && stepsData[0].spokenPromptAr;

                    return (
                        <div className="mt-3 p-4 bg-background-tertiary rounded-xl border border-border print:bg-gray-50 print:border-gray-300">
                            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 print:text-black">
                                <span>📝</span>
                                الخطوات التفصيلية ({stepsData.length} خطوات)
                            </p>
                            <ol className="space-y-3 text-sm">
                                {stepsData.map((step: any, j: number) => (
                                    <li
                                        key={j}
                                        className="flex items-start gap-3 text-foreground-secondary print:text-gray-700"
                                    >
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold print:bg-gray-200 print:text-black">
                                            {j + 1}
                                        </span>
                                        {isNewFormat ? (
                                            <div className="pt-0.5 space-y-1 flex-1">
                                                {step.timeHint && (
                                                    <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                                                        {step.timeHint}
                                                    </span>
                                                )}
                                                {step.spokenPromptAr && (
                                                    <p className="text-foreground font-medium">
                                                        &quot;{step.spokenPromptAr}&quot;
                                                    </p>
                                                )}
                                                {step.action && (
                                                    <p className="text-foreground-secondary text-xs">
                                                        ← {step.action}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="pt-0.5">{step}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    );
                })()}

                {/* Variations - Handle both object and array formats */}
                {(() => {
                    const variations = activity.variations;
                    if (!variations) return null;

                    // Check if object format { easy, medium, hard }
                    if (typeof variations === 'object' && !Array.isArray(variations)) {
                        const varObj = variations as { easy?: string; medium?: string; hard?: string };
                        if (!varObj.easy && !varObj.medium && !varObj.hard) return null;

                        return (
                            <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 print:bg-green-50 print:border-green-200">
                                <p className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2 print:text-green-700">
                                    <span>🎚️</span>
                                    تعديلات حسب المستوى
                                    <span className="font-normal text-xs">Variations</span>
                                </p>
                                <ul className="space-y-2 text-sm text-foreground-secondary">
                                    {varObj.easy && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-400">🟢</span>
                                            <span>{varObj.easy}</span>
                                        </li>
                                    )}
                                    {varObj.medium && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-400">🟡</span>
                                            <span>{varObj.medium}</span>
                                        </li>
                                    )}
                                    {varObj.hard && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-400">🔴</span>
                                            <span>{varObj.hard}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        );
                    }

                    // Legacy array format
                    if (Array.isArray(variations) && variations.length > 0) {
                        return (
                            <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 print:bg-green-50 print:border-green-200">
                                <p className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2 print:text-green-700">
                                    <span>🎚️</span>
                                    تعديلات حسب المستوى
                                    <span className="font-normal text-xs">Variations</span>
                                </p>
                                <ul className="space-y-1 text-sm text-foreground-secondary">
                                    {variations.map((variation: string, j: number) => (
                                        <li key={j} className="flex items-start gap-2">
                                            <span>{variation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }

                    return null;
                })()}

                {/* Safety Tips - NEW */}
                {activity.safetyTips && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20 print:bg-red-50 print:border-red-200">
                        <p className="text-sm text-red-400 print:text-red-700">
                            <span className="font-bold">⚠️ السلامة:</span> {activity.safetyTips}
                        </p>
                    </div>
                )}

                {/* Debrief Questions - NEW */}
                {activity.debriefQuestions && activity.debriefQuestions.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 print:bg-purple-50 print:border-purple-200">
                        <p className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2 print:text-purple-700">
                            <span>💬</span>
                            أسئلة للنقاش بعد النشاط
                            <span className="font-normal text-xs">Debrief</span>
                        </p>
                        <ul className="space-y-1 text-sm text-foreground-secondary">
                            {activity.debriefQuestions.map((question, j) => (
                                <li key={j} className="flex items-start gap-2">
                                    <span className="text-purple-400">{j + 1}.</span>
                                    <span>{question}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tips Section - Grid for print */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2">
                    {/* Facilitator Tip */}
                    {activity.facilitatorTips && (
                        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 print:bg-blue-50 print:border-blue-200">
                            <p className="text-sm text-accent print:text-blue-700">
                                <span className="font-bold">💡 نصيحة:</span> {activity.facilitatorTips}
                            </p>
                        </div>
                    )}

                    {/* Shy Child Tip */}
                    {shyChildTip && (
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 print:bg-purple-50 print:border-purple-200">
                            <p className="text-sm text-purple-400 print:text-purple-700">
                                <span className="font-bold">🤫 للطفل الخجول:</span> {shyChildTip}
                            </p>
                        </div>
                    )}

                    {/* Active Child Tip */}
                    {activeChildTip && (
                        <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 print:bg-orange-50 print:border-orange-200">
                            <p className="text-sm text-orange-400 print:text-orange-700">
                                <span className="font-bold">⚡ للطفل كثير الحركة:</span> {activeChildTip}
                            </p>
                        </div>
                    )}
                </div>

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
