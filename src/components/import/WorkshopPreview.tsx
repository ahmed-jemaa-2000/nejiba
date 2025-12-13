/**
 * Workshop Preview Component
 *
 * Beautiful preview of imported workshop plan with prominent introduction display
 */

"use client";

import { Card } from "@/components/ui";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

interface WorkshopPreviewProps {
    plan: WorkshopPlanData;
}

export function WorkshopPreview({ plan }: WorkshopPreviewProps) {
    return (
        <div className="space-y-6">
            {/* Title */}
            <Card variant="bordered" padding="lg" className="bg-gradient-to-r from-accent/10 to-transparent">
                <h1 className="text-3xl font-bold text-foreground mb-2">{plan.title.ar}</h1>
                {plan.title.en && (
                    <p className="text-lg text-foreground-secondary">{plan.title.en}</p>
                )}
            </Card>

            {/* Introduction - Prominent Display */}
            {plan.introduction && (
                <Card variant="bordered" padding="lg" className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">👋</span>
                        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300">مقدمة الورشة للأطفال</h2>
                    </div>
                    <div className="space-y-3 text-blue-900 dark:text-blue-200">
                        <div className="flex gap-3">
                            <span className="font-bold text-blue-600 dark:text-blue-400">1️⃣</span>
                            <p className="text-lg leading-relaxed">{plan.introduction.phrase1}</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-bold text-blue-600 dark:text-blue-400">2️⃣</span>
                            <p className="text-lg leading-relaxed">{plan.introduction.phrase2}</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-bold text-blue-600 dark:text-blue-400">3️⃣</span>
                            <p className="text-lg leading-relaxed">{plan.introduction.phrase3}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* General Info */}
            <Card variant="bordered" padding="md">
                <h3 className="font-bold text-foreground mb-3">معلومات عامة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-foreground-secondary">المدة</p>
                        <p className="font-semibold text-foreground">{plan.generalInfo.duration}</p>
                    </div>
                    <div>
                        <p className="text-sm text-foreground-secondary">الفئة العمرية</p>
                        <p className="font-semibold text-foreground">{plan.generalInfo.ageGroup}</p>
                    </div>
                    <div>
                        <p className="text-sm text-foreground-secondary">المشاركون</p>
                        <p className="font-semibold text-foreground">{plan.generalInfo.participants}</p>
                    </div>
                    <div>
                        <p className="text-sm text-foreground-secondary">المستوى</p>
                        <p className="font-semibold text-foreground">{plan.generalInfo.level}</p>
                    </div>
                </div>
            </Card>

            {/* Objectives */}
            {plan.objectives && plan.objectives.length > 0 && (
                <Card variant="bordered" padding="md">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <span>🎯</span>
                        الأهداف
                    </h3>
                    <ul className="space-y-2">
                        {plan.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-2 text-foreground-secondary">
                                <span className="text-accent">•</span>
                                <span>{typeof obj === 'string' ? obj : obj.ar}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Materials */}
            {plan.materials && plan.materials.length > 0 && (
                <Card variant="bordered" padding="md">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <span>🧰</span>
                        المواد المطلوبة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {plan.materials.map((material, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                            >
                                {typeof material === 'string' ? material : material.item}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Timeline */}
            {plan.timeline && plan.timeline.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-foreground text-xl flex items-center gap-2">
                        <span>📋</span>
                        جدول الأنشطة
                    </h3>
                    {plan.timeline.map((activity, i) => {
                        const energyColors = {
                            high: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
                            medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
                            low: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
                        };
                        const colorClass = energyColors[activity.energyLevel as keyof typeof energyColors] || 'bg-background-secondary';

                        return (
                            <Card key={i} variant="bordered" padding="md" className={colorClass}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                                                {activity.timeRange}
                                            </span>
                                            {activity.activityType && (
                                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                                    {activity.activityType}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground">{activity.title}</h4>
                                        {activity.blockType && (
                                            <p className="text-sm text-foreground-secondary">{activity.blockType}</p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-foreground-secondary mb-3">{activity.description}</p>

                                {/* Main Steps */}
                                {activity.mainSteps && activity.mainSteps.length > 0 && (
                                    <div className="mb-3">
                                        <p className="font-semibold text-foreground text-sm mb-2">الخطوات:</p>
                                        <ol className="space-y-1 list-decimal list-inside">
                                            {activity.mainSteps.map((step, si) => (
                                                <li key={si} className="text-sm text-foreground-secondary">{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* Life Skills */}
                                {activity.lifeSkillsFocus && activity.lifeSkillsFocus.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-foreground">المهارات الحياتية:</span>
                                        <div className="flex gap-1 flex-wrap">
                                            {activity.lifeSkillsFocus.map((skill, si) => (
                                                <span key={si} className="px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Facilitator Notes */}
            {plan.facilitatorNotes && (
                <Card variant="bordered" padding="md" className="bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <span>📝</span>
                        ملاحظات الميسّر
                    </h3>
                    {typeof plan.facilitatorNotes === 'object' && !Array.isArray(plan.facilitatorNotes) ? (
                        <div className="space-y-3">
                            {plan.facilitatorNotes.beforeWorkshop && plan.facilitatorNotes.beforeWorkshop.length > 0 && (
                                <div>
                                    <p className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-1">قبل الورشة:</p>
                                    <ul className="space-y-1">
                                        {plan.facilitatorNotes.beforeWorkshop.map((note, i) => (
                                            <li key={i} className="text-sm text-purple-700 dark:text-purple-400 flex gap-2">
                                                <span>•</span>
                                                <span>{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {plan.facilitatorNotes.duringWorkshop && plan.facilitatorNotes.duringWorkshop.length > 0 && (
                                <div>
                                    <p className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-1">أثناء الورشة:</p>
                                    <ul className="space-y-1">
                                        {plan.facilitatorNotes.duringWorkshop.map((note, i) => (
                                            <li key={i} className="text-sm text-purple-700 dark:text-purple-400 flex gap-2">
                                                <span>•</span>
                                                <span>{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {(plan.facilitatorNotes as string[]).map((note, i) => (
                                <li key={i} className="text-sm text-purple-700 dark:text-purple-400 flex gap-2">
                                    <span>•</span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            {/* Kids Benefits Section */}
            {(plan as any).kidsBenefits && (
                <div className="space-y-4">
                    <h3 className="font-bold text-foreground text-xl flex items-center gap-2">
                        <span>🌟</span>
                        فوائد الورشة للأطفال
                    </h3>

                    {/* Summary */}
                    {(plan as any).kidsBenefits.summaryAr && (
                        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                            <p className="text-lg text-foreground leading-relaxed">
                                {(plan as any).kidsBenefits.summaryAr}
                            </p>
                        </Card>
                    )}

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Cognitive */}
                        {(plan as any).kidsBenefits.cognitive && (
                            <Card variant="bordered" padding="md" className="bg-blue-50 dark:bg-blue-900/20">
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">
                                    🧠 {(plan as any).kidsBenefits.cognitive.title || "التطور الذهني"}
                                </h4>
                                <ul className="space-y-1">
                                    {((plan as any).kidsBenefits.cognitive.skills || []).map((skill: string, i: number) => (
                                        <li key={i} className="text-sm text-blue-600 dark:text-blue-400 flex gap-2">
                                            <span>•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Emotional */}
                        {(plan as any).kidsBenefits.emotional && (
                            <Card variant="bordered" padding="md" className="bg-pink-50 dark:bg-pink-900/20">
                                <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">
                                    ❤️ {(plan as any).kidsBenefits.emotional.title || "النمو العاطفي"}
                                </h4>
                                <ul className="space-y-1">
                                    {((plan as any).kidsBenefits.emotional.skills || []).map((skill: string, i: number) => (
                                        <li key={i} className="text-sm text-pink-600 dark:text-pink-400 flex gap-2">
                                            <span>•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Social */}
                        {(plan as any).kidsBenefits.social && (
                            <Card variant="bordered" padding="md" className="bg-green-50 dark:bg-green-900/20">
                                <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">
                                    🤝 {(plan as any).kidsBenefits.social.title || "المهارات الاجتماعية"}
                                </h4>
                                <ul className="space-y-1">
                                    {((plan as any).kidsBenefits.social.skills || []).map((skill: string, i: number) => (
                                        <li key={i} className="text-sm text-green-600 dark:text-green-400 flex gap-2">
                                            <span>•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Physical */}
                        {(plan as any).kidsBenefits.physical && (
                            <Card variant="bordered" padding="md" className="bg-yellow-50 dark:bg-yellow-900/20">
                                <h4 className="font-bold text-yellow-700 dark:text-yellow-300 mb-2">
                                    💪 {(plan as any).kidsBenefits.physical.title || "التطور الجسدي"}
                                </h4>
                                <ul className="space-y-1">
                                    {((plan as any).kidsBenefits.physical.skills || []).map((skill: string, i: number) => (
                                        <li key={i} className="text-sm text-yellow-600 dark:text-yellow-400 flex gap-2">
                                            <span>•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Character */}
                        {(plan as any).kidsBenefits.character && (
                            <Card variant="bordered" padding="md" className="bg-purple-50 dark:bg-purple-900/20 md:col-span-2">
                                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">
                                    ⭐ {(plan as any).kidsBenefits.character.title || "بناء الشخصية"}
                                </h4>
                                <ul className="space-y-1">
                                    {((plan as any).kidsBenefits.character.skills || []).map((skill: string, i: number) => (
                                        <li key={i} className="text-sm text-purple-600 dark:text-purple-400 flex gap-2">
                                            <span>•</span>
                                            <span>{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* Parent Tips */}
                    {(plan as any).kidsBenefits.parentTips && (plan as any).kidsBenefits.parentTips.length > 0 && (
                        <Card variant="bordered" padding="md" className="bg-orange-50 dark:bg-orange-900/20">
                            <h4 className="font-bold text-orange-700 dark:text-orange-300 mb-2">
                                👨‍👩‍👧 نصائح للأهل
                            </h4>
                            <ul className="space-y-1">
                                {(plan as any).kidsBenefits.parentTips.map((tip: string, i: number) => (
                                    <li key={i} className="text-sm text-orange-600 dark:text-orange-400 flex gap-2">
                                        <span>•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Long Term Impact */}
                    {(plan as any).kidsBenefits.longTermImpact && (
                        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                            <p className="text-foreground flex items-start gap-2">
                                <span className="text-xl">🚀</span>
                                <span className="leading-relaxed">{(plan as any).kidsBenefits.longTermImpact}</span>
                            </p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
