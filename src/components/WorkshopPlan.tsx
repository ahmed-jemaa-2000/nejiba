"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { ActivityRegenerator } from "@/components/ActivityRegenerator";
import type { WorkshopPlanData, WorkshopInput, WorkshopActivity } from "@/app/workshop/page";
import type { WorkshopPlanData as BaseWorkshopPlanData } from "@/lib/ai/providers/base";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PremiumWorkshopPDF } from "@/components/pdf/PremiumWorkshopPDF";

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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const printDate = useMemo(
        () =>
            new Date().toLocaleDateString("ar-TN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        []
    );

    const handleActivityRegenerated = (index: number, newActivity: WorkshopActivity) => {
        setRegeneratingIndex(null);
        onUpdateActivity?.(index, newActivity);
    };

    return (
        <div className="report-page space-y-6" dir="rtl">
            <div className="no-print rounded-2xl border border-border/60 bg-background-secondary px-4 py-3 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm text-foreground-secondary">ورشة: {input.topic}</p>
                        <p className="text-xs text-foreground-secondary">
                            المدة: {input.duration} دقيقة · الفئة: {input.ageRange}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={onBack}>
                            عودة
                        </Button>
                        <Button variant="secondary" onClick={onRegenerate} loading={isRegenerating}>
                            إعادة توليد الخطة
                        </Button>
                        {isClient && (
                            <PDFDownloadLink
                                document={<PremiumWorkshopPDF plan={plan as unknown as BaseWorkshopPlanData} />}
                                fileName={`workshop-${input.topic.replace(/\s+/g, '-')}-premium.pdf`}
                            >
                                {({ blob, url, loading, error }) => (
                                    <Button variant="gradient" loading={loading}>
                                        {loading ? "جاري التحضير..." : "تحميل PDF"}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>
            </div>

            {/* Cover / summary */}
            <section className="report-paper report-cover rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-indigo-500/10 print:shadow-none">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 text-slate-700">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Nejiba Studio | Leader Kids Club
                            </p>
                            <p className="text-sm">التاريخ: {printDate}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-900 px-3 py-2 text-white">NS</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-slate-900">
                        <p className="text-sm font-semibold text-indigo-600">خطة ورشة</p>
                        <h1 className="text-3xl font-black leading-tight">{plan.title.ar}</h1>
                        <p className="text-slate-500">{plan.title.en}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <StatTile label="المدة" value={plan.generalInfo.duration} />
                        <StatTile label="الفئة العمرية" value={plan.generalInfo.ageGroup} />
                        <StatTile label="عدد الأنشطة" value={`${plan.timeline.length}`} />
                        <StatTile label="المواد" value={`${plan.materials.length}`} />
                    </div>
                </div>
            </section>

            <Section title="ملخص سريع" subtitle="Overview">
                <div className="report-grid-two grid gap-4 md:grid-cols-2">
                    <InfoRow label="المشاركون" value={plan.generalInfo.participants} />
                    <InfoRow label="مستوى الورشة" value={plan.generalInfo.level} />
                    {plan.generalInfo.facilitatorCount && (
                        <InfoRow label="عدد الميسرين" value={plan.generalInfo.facilitatorCount} />
                    )}
                </div>
            </Section>

            <Section title="أهداف التعلم" subtitle="Learning objectives">
                <ol className="space-y-2 text-foreground">
                    {plan.objectives.map((obj, i) => (
                        <li key={i} className="list-decimal list-inside">
                            {obj.ar}{" "}
                            {obj.en && <span className="text-foreground-secondary text-sm">({obj.en})</span>}
                        </li>
                    ))}
                </ol>
            </Section>

            <Section title="المواد المطلوبة" subtitle="Materials">
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {plan.materials.map((material, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2 text-slate-900">
                            <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border border-slate-200" />
                            {typeof material === "string" ? (
                                material
                            ) : (
                                <div>
                                    <p className="font-semibold">{material.item}</p>
                                    <p className="text-sm text-slate-600">
                                        {material.quantity}
                                        {material.notes ? ` · ${material.notes}` : ""}
                                    </p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </Section>

            {plan.roomSetup && (
                <Section title="تجهيز القاعة" subtitle="Room setup">
                    <p className="text-foreground-secondary leading-relaxed">{plan.roomSetup}</p>
                </Section>
            )}

            <Section title="الأنشطة بالتسلسل" subtitle="Timeline">
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
            </Section>

            {plan.closingReflection && (
                <Section title={plan.closingReflection.title} subtitle="Closing reflection">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                            {plan.closingReflection.duration}
                        </span>
                    </div>
                    <p className="text-foreground-secondary">{plan.closingReflection.description}</p>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">أسئلة النقاش:</p>
                        <ul className="space-y-1 text-foreground-secondary">
                            {plan.closingReflection.questions.map((q, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="text-indigo-600">{i + 1}.</span>
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>
            )}

            <Section title="ملاحظات الميسر" subtitle="Facilitator notes">
                {Array.isArray(plan.facilitatorNotes) ? (
                    <ul className="space-y-2">
                        {plan.facilitatorNotes.map((note, i) => (
                            <li key={i} className="flex gap-2 text-foreground-secondary">
                                <span className="text-indigo-600">•</span>
                                <span>{note}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="space-y-4">
                        {plan.facilitatorNotes.beforeWorkshop && plan.facilitatorNotes.beforeWorkshop.length > 0 && (
                            <NotesBlock title="قبل الورشة" items={plan.facilitatorNotes.beforeWorkshop} />
                        )}
                        {plan.facilitatorNotes.duringWorkshop && plan.facilitatorNotes.duringWorkshop.length > 0 && (
                            <NotesBlock title="أثناء الورشة" items={plan.facilitatorNotes.duringWorkshop} />
                        )}
                    </div>
                )}
            </Section>

            {/* Kids Benefits Section (NEW) */}
            {(plan as any).kidsBenefits && (
                <Section title="🌟 فوائد الورشة للأطفال" subtitle="Kids Benefits">
                    {/* Summary */}
                    {(plan as any).kidsBenefits.summaryAr && (
                        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 text-center mb-6 border border-indigo-200">
                            <p className="text-lg font-medium text-indigo-800">
                                {(plan as any).kidsBenefits.summaryAr}
                            </p>
                        </div>
                    )}

                    {/* 5 Developmental Areas Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Cognitive */}
                        {(plan as any).kidsBenefits.cognitive && (
                            <BenefitCard
                                icon="🧠"
                                title={(plan as any).kidsBenefits.cognitive.title || "التطور الذهني"}
                                skills={(plan as any).kidsBenefits.cognitive.skills || []}
                                example={(plan as any).kidsBenefits.cognitive.example}
                                color="blue"
                            />
                        )}

                        {/* Emotional */}
                        {(plan as any).kidsBenefits.emotional && (
                            <BenefitCard
                                icon="❤️"
                                title={(plan as any).kidsBenefits.emotional.title || "النمو العاطفي"}
                                skills={(plan as any).kidsBenefits.emotional.skills || []}
                                example={(plan as any).kidsBenefits.emotional.example}
                                color="pink"
                            />
                        )}

                        {/* Social */}
                        {(plan as any).kidsBenefits.social && (
                            <BenefitCard
                                icon="🤝"
                                title={(plan as any).kidsBenefits.social.title || "المهارات الاجتماعية"}
                                skills={(plan as any).kidsBenefits.social.skills || []}
                                example={(plan as any).kidsBenefits.social.example}
                                color="green"
                            />
                        )}

                        {/* Physical */}
                        {(plan as any).kidsBenefits.physical && (
                            <BenefitCard
                                icon="💪"
                                title={(plan as any).kidsBenefits.physical.title || "التطور الجسدي"}
                                skills={(plan as any).kidsBenefits.physical.skills || []}
                                example={(plan as any).kidsBenefits.physical.example}
                                color="amber"
                            />
                        )}

                        {/* Character */}
                        {(plan as any).kidsBenefits.character && (
                            <BenefitCard
                                icon="⭐"
                                title={(plan as any).kidsBenefits.character.title || "بناء الشخصية"}
                                skills={(plan as any).kidsBenefits.character.skills || []}
                                example={(plan as any).kidsBenefits.character.example}
                                color="purple"
                            />
                        )}
                    </div>

                    {/* Parent Tips */}
                    {(plan as any).kidsBenefits.parentTips && (plan as any).kidsBenefits.parentTips.length > 0 && (
                        <div className="rounded-xl bg-green-50 border-2 border-green-400 p-4 mb-4">
                            <h4 className="text-lg font-bold text-green-700 mb-3 text-center">
                                👨‍👩‍👧 نصائح للأهل
                            </h4>
                            <ul className="space-y-2">
                                {(plan as any).kidsBenefits.parentTips.map((tip: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-green-700">
                                        <span className="font-bold">✓</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Long-term Impact */}
                    {(plan as any).kidsBenefits.longTermImpact && (
                        <div className="rounded-xl bg-slate-900 p-4 text-center">
                            <p className="text-white font-medium">
                                🚀 {(plan as any).kidsBenefits.longTermImpact}
                            </p>
                        </div>
                    )}
                </Section>
            )}

        </div>
    );
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
}: {
    activity: WorkshopActivity;
    index: number;
    isLast: boolean;
    isRegenerating: boolean;
    workshopPlan: WorkshopPlanData;
    onStartRegenerate: () => void;
    onActivityRegenerated: (activity: WorkshopActivity) => void;
    onCancelRegenerate: () => void;
}) {
    // V3: Check mainSteps FIRST (new field), then fall back to old fields for backward compatibility
    const stepsData =
        activity.mainSteps ||           // V3 field (NEW - check first!)
        activity.instructions ||         // V2 fallback
        activity.detailedSteps ||        // V1 fallback
        (activity as any).steps ||       // Legacy fallback
        [];
    const variations = activity.variations;
    const shyChildTip = (activity as any).shyChildTip;
    const activeChildTip = (activity as any).activeChildTip;

    return (
        <div className="report-timeline-item rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold text-indigo-600">{activity.timeRange}</p>
                    <h4 className="text-lg font-bold text-slate-900">{activity.title}</h4>
                    {activity.titleEn && <p className="text-xs text-slate-500">{activity.titleEn}</p>}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    {activity.learningGoal && <Tag>🎯 {activity.learningGoal}</Tag>}
                    {activity.energyLevel && <Tag>⚡ {activity.energyLevel}</Tag>}
                    {activity.groupSize && <Tag>👥 {activity.groupSize}</Tag>}
                    {!isLast && <Tag>⏳ {activity.timeRange}</Tag>}
                </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">{activity.description}</p>

            {/* V3: Activity Type Badge */}
            {activity.activityType && (
                <div className="mt-3">
                    <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                        {activity.activityType}
                    </span>
                </div>
            )}

            {/* V3: Why It Matters */}
            {activity.whyItMatters && (
                <div className="mt-3 rounded-xl border-l-4 border-blue-400 bg-blue-50 p-3">
                    <h5 className="mb-1 text-sm font-semibold text-blue-900">💡 لماذا هذا النشاط مهم</h5>
                    <p className="text-sm text-blue-800">{activity.whyItMatters}</p>
                </div>
            )}

            {/* V3: What You Need (Materials) */}
            {activity.whatYouNeed && activity.whatYouNeed.length > 0 && (
                <Block title="📦 ما تحتاجه">
                    <ul className="space-y-1 text-sm text-slate-700">
                        {activity.whatYouNeed.map((material, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-indigo-600">•</span>
                                <span>{material}</span>
                            </li>
                        ))}
                    </ul>
                </Block>
            )}

            {/* V3: Main Steps (3-5 clear steps) */}
            {activity.mainSteps && activity.mainSteps.length > 0 && (
                <Block title={`📝 الخطوات الأساسية (${activity.mainSteps.length} خطوات)`}>
                    <ol className="space-y-2 text-sm text-slate-700">
                        {activity.mainSteps.map((step, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                                    {i + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </Block>
            )}

            {/* V3: Visual Cues (What facilitator demonstrates) */}
            {activity.visualCues && activity.visualCues.length > 0 && (
                <div className="mt-3 rounded-xl border-l-4 border-green-400 bg-green-50 p-3">
                    <h5 className="mb-2 text-sm font-semibold text-green-900">👁️ إشارات بصرية للميسر</h5>
                    <ul className="space-y-1 text-sm text-green-800">
                        {activity.visualCues.map((cue, i) => (
                            <li key={i} className="flex gap-2">
                                <span>•</span>
                                <span>{cue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* V3: Spoken Phrases (What facilitator says) */}
            {activity.spokenPhrases && activity.spokenPhrases.length > 0 && (
                <div className="mt-3 rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-3">
                    <h5 className="mb-2 text-sm font-semibold text-yellow-900">💬 عبارات يقولها الميسر</h5>
                    <ul className="space-y-1 text-sm text-yellow-800">
                        {activity.spokenPhrases.map((phrase, i) => (
                            <li key={i} className="flex gap-2">
                                <span>•</span>
                                <span>&quot;{phrase}&quot;</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* V3: Confidence Building Moment */}
            {activity.confidenceBuildingMoment && (
                <div className="mt-3 rounded-xl border-l-4 border-pink-400 bg-pink-50 p-3">
                    <h5 className="mb-1 text-sm font-semibold text-pink-900">⭐ لحظة بناء الثقة</h5>
                    <p className="text-sm italic text-pink-800">{activity.confidenceBuildingMoment}</p>
                </div>
            )}

            {/* V3: Life Skills Focus */}
            {activity.lifeSkillsFocus && activity.lifeSkillsFocus.length > 0 && (
                <div className="mt-3">
                    <h5 className="mb-2 text-sm font-semibold text-slate-900">🎯 المهارات الحياتية</h5>
                    <div className="flex flex-wrap gap-2">
                        {activity.lifeSkillsFocus.map((skill, i) => (
                            <span key={i} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {activity.setupSteps && activity.setupSteps.length > 0 && (
                <Block title="تهيئة المكان">
                    <ul className="space-y-1 text-sm text-slate-700">
                        {activity.setupSteps.map((step, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-indigo-600">•</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </Block>
            )}

            {stepsData.length > 0 && (
                <Block title="خطوات التنفيذ">
                    <ol className="space-y-2 text-sm text-slate-700">
                        {stepsData.map((step: any, i: number) => (
                            <li key={i} className="flex gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                                    {i + 1}
                                </span>
                                <div className="space-y-1">
                                    {typeof step === "string" ? (
                                        step
                                    ) : (
                                        <>
                                            {step.timeHint && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                    {step.timeHint}
                                                </span>
                                            )}
                                            {step.spokenPromptAr && <p className="font-semibold">“{step.spokenPromptAr}”</p>}
                                            {step.action && <p className="text-slate-600">{step.action}</p>}
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </Block>
            )}


            {activity.safetyTips && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
                    ⚠️ السلامة: {activity.safetyTips}
                </div>
            )}

            {activity.debriefQuestions && activity.debriefQuestions.length > 0 && (
                <Block title="أسئلة نقاش سريعة">
                    <ul className="space-y-1 text-sm text-slate-700">
                        {activity.debriefQuestions.map((question, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-purple-600">{i + 1}.</span>
                                <span>{question}</span>
                            </li>
                        ))}
                    </ul>
                </Block>
            )}


            <div className="no-print mt-4 border-t border-slate-100 pt-3">
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
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
                        >
                            إعادة توليد هذا النشاط
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="report-paper report-section space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-indigo-500/10 print:shadow-none">
            <div className="space-y-1">
                {subtitle && <p className="text-xs uppercase tracking-[0.15em] text-indigo-600">{subtitle}</p>}
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            </div>
            <div className="space-y-3 text-slate-900">{children}</div>
        </section>
    );
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function NotesBlock({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <ul className="space-y-1 text-sm text-slate-700">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-2">
                        <span className="text-indigo-600">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{children}</span>;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">{title}</p>
            {children}
        </div>
    );
}

function Pill({ label, value, color }: { label: string; value: string; color: "green" | "amber" | "red" }) {
    const colorMap = {
        green: "bg-green-50 text-green-800 border-green-100",
        amber: "bg-amber-50 text-amber-800 border-amber-100",
        red: "bg-red-50 text-red-800 border-red-100",
    } as const;

    return (
        <div className={`rounded-lg border px-3 py-2 text-sm ${colorMap[color]}`}>
            <p className="font-semibold">{label}</p>
            <p>{value}</p>
        </div>
    );
}

function TipCard({ label, text, color }: { label: string; text: string; color: "blue" | "purple" | "orange" }) {
    const palette = {
        blue: "bg-blue-50 border-blue-100 text-blue-800",
        purple: "bg-purple-50 border-purple-100 text-purple-800",
        orange: "bg-orange-50 border-orange-100 text-orange-800",
    } as const;

    return (
        <div className={`rounded-xl border px-3 py-2 text-sm ${palette[color]}`}>
            <p className="font-semibold">{label}</p>
            <p className="text-sm">{text}</p>
        </div>
    );
}

function BenefitCard({
    icon,
    title,
    skills,
    example,
    color,
}: {
    icon: string;
    title: string;
    skills: string[];
    example?: string;
    color: "blue" | "pink" | "green" | "amber" | "purple";
}) {
    const colorMap = {
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        pink: "bg-pink-50 border-pink-200 text-pink-700",
        green: "bg-green-50 border-green-200 text-green-700",
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        purple: "bg-purple-50 border-purple-200 text-purple-700",
    } as const;

    return (
        <div className={`rounded-xl border-2 p-4 ${colorMap[color]}`}>
            <div className="text-center mb-3">
                <span className="text-3xl">{icon}</span>
                <h4 className="font-bold mt-2">{title}</h4>
            </div>
            <ul className="space-y-1 text-sm">
                {skills.map((skill, i) => (
                    <li key={i} className="flex gap-2">
                        <span>•</span>
                        <span>{skill}</span>
                    </li>
                ))}
            </ul>
            {example && (
                <p className="mt-3 text-xs italic opacity-80 border-t pt-2 border-current/20">
                    💡 {example}
                </p>
            )}
        </div>
    );
}
