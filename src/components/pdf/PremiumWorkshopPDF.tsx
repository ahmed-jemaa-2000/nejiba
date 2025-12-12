/**
 * Premium Workshop PDF Component
 * 
 * Professional, print-optimized PDF for Arabic workshop plans
 * Features:
 * - Premium typography with Cairo font
 * - Kids Benefits section with 5 developmental areas
 * - Facilitator script with exact phrases
 * - Parent tips section
 * - Print-optimized colors and layout
 */

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { WorkshopPlanData } from '@/lib/ai/providers/base';

// ============================================================================
// FONT REGISTRATION
// ============================================================================

// Primary font: Cairo (excellent Arabic readability)
Font.register({
    family: 'Cairo',
    fonts: [
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@4.5.12/files/cairo-arabic-400-normal.woff',
            fontWeight: 'normal'
        },
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@4.5.12/files/cairo-arabic-700-normal.woff',
            fontWeight: 'bold'
        },
    ],
});

// Fallback: Noto Sans Arabic
Font.register({
    family: 'NotoSansArabic',
    fonts: [
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@4.5.11/files/noto-sans-arabic-arabic-400-normal.woff',
            fontWeight: 'normal'
        },
        {
            src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@4.5.11/files/noto-sans-arabic-arabic-700-normal.woff',
            fontWeight: 'bold'
        },
    ],
});

// ============================================================================
// PREMIUM COLOR PALETTE
// ============================================================================

const colors = {
    // Primary brand
    primary: '#4F46E5',
    primaryDark: '#3730A3',
    primaryLight: '#E0E7FF',

    // Accent
    accent: '#10B981',
    accentLight: '#D1FAE5',

    // Developmental areas
    cognitive: '#3B82F6',
    cognitiveLight: '#DBEAFE',
    emotional: '#EC4899',
    emotionalLight: '#FCE7F3',
    social: '#10B981',
    socialLight: '#D1FAE5',
    physical: '#F59E0B',
    physicalLight: '#FEF3C7',
    character: '#8B5CF6',
    characterLight: '#EDE9FE',

    // Energy levels
    highEnergy: '#FEE2E2',
    highEnergyBorder: '#F87171',
    mediumEnergy: '#FEF3C7',
    mediumEnergyBorder: '#FBBF24',
    lowEnergy: '#D1FAE5',
    lowEnergyBorder: '#34D399',

    // Text
    heading: '#1E293B',
    body: '#334155',
    muted: '#64748B',
    white: '#FFFFFF',

    // Backgrounds
    pageBg: '#FFFFFF',
    cardBg: '#F8FAFC',
    headerBg: '#1E1B4B',

    // Borders
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // Page styles
    page: {
        fontFamily: 'Cairo',
        padding: 35,
        backgroundColor: colors.pageBg,
        direction: 'rtl',
    },

    // Cover page
    coverPage: {
        fontFamily: 'Cairo',
        padding: 0,
        backgroundColor: colors.white,
    },
    coverHeader: {
        backgroundColor: colors.headerBg,
        padding: 40,
        paddingTop: 60,
        paddingBottom: 50,
    },
    coverTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 10,
    },
    coverSubtitle: {
        fontSize: 14,
        color: '#A5B4FC',
        textAlign: 'center',
    },
    coverBody: {
        padding: 35,
    },

    // Introduction box
    introBox: {
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        marginBottom: 25,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    introTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryDark,
        textAlign: 'center',
        marginBottom: 15,
    },
    introPhrase: {
        fontSize: 13,
        color: colors.primaryDark,
        textAlign: 'right',
        marginBottom: 10,
        lineHeight: 1.8,
        paddingRight: 5,
    },

    // Info grid
    infoGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    infoCard: {
        width: '48%',
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    infoLabel: {
        fontSize: 9,
        color: colors.muted,
        textAlign: 'right',
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'right',
    },

    // Section headers
    sectionHeader: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'right',
    },

    // Objectives
    objectiveItem: {
        flexDirection: 'row-reverse',
        marginBottom: 8,
        paddingRight: 5,
    },
    objectiveNumber: {
        width: 22,
        height: 22,
        backgroundColor: colors.accent,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    objectiveNumberText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.white,
    },
    objectiveText: {
        flex: 1,
        fontSize: 11,
        color: colors.body,
        textAlign: 'right',
        lineHeight: 1.6,
    },

    // Materials
    materialsGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 8,
    },
    materialChip: {
        backgroundColor: colors.accentLight,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    materialText: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: 'bold',
    },

    // Activity card
    activityCard: {
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    activityHeader: {
        padding: 12,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'right',
        flex: 1,
    },
    activityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    activityBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    activityBody: {
        padding: 15,
        backgroundColor: colors.white,
    },
    activityDescription: {
        fontSize: 11,
        color: colors.body,
        textAlign: 'right',
        lineHeight: 1.6,
        marginBottom: 12,
    },

    // Steps
    stepsContainer: {
        marginTop: 10,
    },
    stepsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'right',
        marginBottom: 10,
    },
    stepItem: {
        flexDirection: 'row-reverse',
        marginBottom: 8,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 10,
    },
    stepNumber: {
        width: 24,
        height: 24,
        backgroundColor: colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    stepNumberText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.white,
    },
    stepContent: {
        flex: 1,
    },
    stepAction: {
        fontSize: 11,
        color: colors.heading,
        textAlign: 'right',
        lineHeight: 1.5,
    },
    stepPhrase: {
        fontSize: 10,
        color: colors.primary,
        textAlign: 'right',
        marginTop: 4,
    },

    // Confidence moment
    confidenceBox: {
        backgroundColor: colors.characterLight,
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderRightWidth: 4,
        borderRightColor: colors.character,
    },
    confidenceTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.character,
        textAlign: 'right',
        marginBottom: 4,
    },
    confidenceText: {
        fontSize: 10,
        color: colors.body,
        textAlign: 'right',
        lineHeight: 1.5,
    },

    // Skills chips
    skillsRow: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
    },
    skillChip: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    skillText: {
        fontSize: 8,
        color: colors.primaryDark,
    },

    // Benefits page
    benefitsPage: {
        fontFamily: 'Cairo',
        padding: 35,
        backgroundColor: colors.white,
    },
    benefitsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'center',
        marginBottom: 25,
    },
    benefitsGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 12,
    },
    benefitCard: {
        width: '48%',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    benefitIcon: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
    },
    benefitTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    benefitSkill: {
        fontSize: 9,
        textAlign: 'right',
        marginBottom: 4,
        paddingRight: 10,
    },
    benefitExample: {
        fontSize: 8,
        textAlign: 'right',
        marginTop: 8,
        color: colors.muted,
    },

    // Parent tips
    parentTipsBox: {
        backgroundColor: colors.accentLight,
        borderRadius: 12,
        padding: 15,
        marginTop: 20,
        borderWidth: 2,
        borderColor: colors.accent,
    },
    parentTipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.accent,
        textAlign: 'center',
        marginBottom: 12,
    },
    parentTip: {
        fontSize: 10,
        color: colors.body,
        textAlign: 'right',
        marginBottom: 6,
        paddingRight: 15,
    },

    // Long term impact
    impactBox: {
        backgroundColor: colors.headerBg,
        borderRadius: 12,
        padding: 15,
        marginTop: 15,
    },
    impactText: {
        fontSize: 11,
        color: colors.white,
        textAlign: 'center',
        lineHeight: 1.8,
    },

    // Facilitator notes
    notesSection: {
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'right',
        marginBottom: 15,
    },
    notesSubtitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
        marginTop: 12,
        marginBottom: 8,
    },
    noteItem: {
        fontSize: 10,
        color: colors.body,
        textAlign: 'right',
        marginBottom: 5,
        paddingRight: 15,
        lineHeight: 1.5,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 35,
        right: 35,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: colors.muted,
    },
    pageNumber: {
        fontSize: 8,
        color: colors.muted,
    },
});

// ============================================================================
// COMPONENT
// ============================================================================

interface PremiumWorkshopPDFProps {
    plan: WorkshopPlanData;
}

export const PremiumWorkshopPDF: React.FC<PremiumWorkshopPDFProps> = ({ plan }) => {
    // Helper: Get energy theme
    const getEnergyTheme = (level?: string) => {
        const normalized = (level || '').toString().toLowerCase();
        if (normalized === 'high') return {
            bg: colors.highEnergy,
            border: colors.highEnergyBorder,
            text: '#991B1B'
        };
        if (normalized === 'low') return {
            bg: colors.lowEnergy,
            border: colors.lowEnergyBorder,
            text: '#065F46'
        };
        return {
            bg: colors.mediumEnergy,
            border: colors.mediumEnergyBorder,
            text: '#92400E'
        };
    };

    // Helper: Get steps from activity
    const getSteps = (activity: WorkshopPlanData["timeline"][number]): string[] =>
        activity.mainSteps ??
        activity.instructions ??
        activity.detailedSteps ??
        activity.setupSteps ??
        [];

    // Type guard for kidsBenefits
    const kidsBenefits = (plan as any).kidsBenefits;

    return (
        <Document>
            {/* ============ COVER PAGE ============ */}
            <Page size="A4" style={styles.coverPage}>
                {/* Header with title */}
                <View style={styles.coverHeader}>
                    <Text style={styles.coverTitle}>{plan.title.ar}</Text>
                    {plan.title.en && <Text style={styles.coverSubtitle}>{plan.title.en}</Text>}
                </View>

                <View style={styles.coverBody}>
                    {/* Introduction */}
                    {plan.introduction && (
                        <View style={styles.introBox}>
                            <Text style={styles.introTitle}>مقدمة الورشة للأطفال</Text>
                            <Text style={styles.introPhrase}>1. {plan.introduction.phrase1}</Text>
                            <Text style={styles.introPhrase}>2. {plan.introduction.phrase2}</Text>
                            <Text style={styles.introPhrase}>3. {plan.introduction.phrase3}</Text>
                        </View>
                    )}

                    {/* Info grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>المدة</Text>
                            <Text style={styles.infoValue}>{plan.generalInfo.duration}</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>الفئة العمرية</Text>
                            <Text style={styles.infoValue}>{plan.generalInfo.ageGroup}</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>المشاركون</Text>
                            <Text style={styles.infoValue}>{plan.generalInfo.participants}</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>عدد الأنشطة</Text>
                            <Text style={styles.infoValue}>{plan.timeline?.length || 0} أنشطة</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>الطفل القائد - Nejiba Studio</Text>
                    <Text style={styles.pageNumber}>1</Text>
                </View>
            </Page>

            {/* ============ OBJECTIVES & MATERIALS PAGE ============ */}
            <Page size="A4" style={styles.page}>
                {/* Objectives */}
                {plan.objectives && plan.objectives.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>أهداف التعلم</Text>
                        </View>
                        {plan.objectives.map((obj, i) => (
                            <View key={i} style={styles.objectiveItem}>
                                <View style={styles.objectiveNumber}>
                                    <Text style={styles.objectiveNumberText}>{i + 1}</Text>
                                </View>
                                <Text style={styles.objectiveText}>
                                    {typeof obj === 'string' ? obj : obj.ar}
                                </Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Materials */}
                {plan.materials && plan.materials.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>المواد المطلوبة</Text>
                        </View>
                        <View style={styles.materialsGrid}>
                            {plan.materials.map((material, i) => (
                                <View key={i} style={styles.materialChip}>
                                    <Text style={styles.materialText}>
                                        {typeof material === 'string'
                                            ? material
                                            : material.quantity
                                                ? `${material.item} (${material.quantity})`
                                                : material.item}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{plan.title.ar}</Text>
                    <Text style={styles.pageNumber}>2</Text>
                </View>
            </Page>

            {/* ============ ACTIVITY PAGES ============ */}
            {plan.timeline && plan.timeline.map((activity, index) => {
                const energyTheme = getEnergyTheme(activity.energyLevel);
                const steps = getSteps(activity);

                return (
                    <Page key={index} size="A4" style={styles.page}>
                        <View style={[styles.activityCard, {
                            borderColor: energyTheme.border,
                            backgroundColor: energyTheme.bg
                        }]}>
                            {/* Activity header */}
                            <View style={[styles.activityHeader, { backgroundColor: energyTheme.bg }]}>
                                <Text style={styles.activityTitle}>
                                    {index + 1}. {activity.title}
                                </Text>
                                <View style={[styles.activityBadge, { backgroundColor: energyTheme.border }]}>
                                    <Text style={[styles.activityBadgeText, { color: colors.white }]}>
                                        {activity.timeRange}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.activityBody}>
                                {/* Activity type & energy */}
                                <View style={{ flexDirection: 'row-reverse', gap: 8, marginBottom: 10 }}>
                                    {activity.activityType && (
                                        <View style={[styles.activityBadge, { backgroundColor: colors.primaryLight }]}>
                                            <Text style={[styles.activityBadgeText, { color: colors.primary }]}>
                                                {activity.activityType}
                                            </Text>
                                        </View>
                                    )}
                                    {activity.energyLevel && (
                                        <View style={[styles.activityBadge, { backgroundColor: energyTheme.bg, borderWidth: 1, borderColor: energyTheme.border }]}>
                                            <Text style={[styles.activityBadgeText, { color: energyTheme.text }]}>
                                                {activity.energyLevel === 'high' ? '🔋🔋🔋 عالي' :
                                                    activity.energyLevel === 'low' ? '🔋 هادئ' : '🔋🔋 متوسط'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Description */}
                                <Text style={styles.activityDescription}>{activity.description}</Text>

                                {/* Steps */}
                                {steps.length > 0 && (
                                    <View style={styles.stepsContainer}>
                                        <Text style={styles.stepsTitle}>الخطوات:</Text>
                                        {steps.map((step, si) => (
                                            <View key={si} style={styles.stepItem}>
                                                <View style={styles.stepNumber}>
                                                    <Text style={styles.stepNumberText}>{si + 1}</Text>
                                                </View>
                                                <View style={styles.stepContent}>
                                                    <Text style={styles.stepAction}>{step}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Spoken Phrases */}
                                {activity.spokenPhrases && activity.spokenPhrases.length > 0 && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={styles.stepsTitle}>العبارات المنطوقة:</Text>
                                        {activity.spokenPhrases.map((phrase, pi) => (
                                            <Text key={pi} style={styles.stepPhrase}>"{phrase}"</Text>
                                        ))}
                                    </View>
                                )}

                                {/* Confidence building moment */}
                                {activity.confidenceBuildingMoment && (
                                    <View style={styles.confidenceBox}>
                                        <Text style={styles.confidenceTitle}>لحظة بناء الثقة:</Text>
                                        <Text style={styles.confidenceText}>{activity.confidenceBuildingMoment}</Text>
                                    </View>
                                )}

                                {/* Life skills */}
                                {activity.lifeSkillsFocus && activity.lifeSkillsFocus.length > 0 && (
                                    <View style={styles.skillsRow}>
                                        {activity.lifeSkillsFocus.map((skill, si) => (
                                            <View key={si} style={styles.skillChip}>
                                                <Text style={styles.skillText}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>نشاط {index + 1} من {plan.timeline.length}</Text>
                            <Text style={styles.pageNumber}>{index + 3}</Text>
                        </View>
                    </Page>
                );
            })}

            {/* ============ KIDS BENEFITS PAGE ============ */}
            {kidsBenefits && (
                <Page size="A4" style={styles.benefitsPage}>
                    <Text style={styles.benefitsTitle}>فوائد الورشة للأطفال</Text>

                    {/* Summary */}
                    {kidsBenefits.summaryAr && (
                        <View style={{ marginBottom: 20, padding: 15, backgroundColor: colors.primaryLight, borderRadius: 12 }}>
                            <Text style={{ fontSize: 12, color: colors.primaryDark, textAlign: 'center', lineHeight: 1.8 }}>
                                {kidsBenefits.summaryAr}
                            </Text>
                        </View>
                    )}

                    {/* Benefits grid */}
                    <View style={styles.benefitsGrid}>
                        {/* Cognitive */}
                        {kidsBenefits.cognitive && (
                            <View style={[styles.benefitCard, { backgroundColor: colors.cognitiveLight }]}>
                                <Text style={styles.benefitIcon}>[ذهني]</Text>
                                <Text style={[styles.benefitTitle, { color: colors.cognitive }]}>
                                    {kidsBenefits.cognitive.title || 'التطور الذهني'}
                                </Text>
                                {kidsBenefits.cognitive.skills?.map((skill: string, i: number) => (
                                    <Text key={i} style={[styles.benefitSkill, { color: colors.cognitive }]}>• {skill}</Text>
                                ))}
                            </View>
                        )}

                        {/* Emotional */}
                        {kidsBenefits.emotional && (
                            <View style={[styles.benefitCard, { backgroundColor: colors.emotionalLight }]}>
                                <Text style={styles.benefitIcon}>[عاطفي]</Text>
                                <Text style={[styles.benefitTitle, { color: colors.emotional }]}>
                                    {kidsBenefits.emotional.title || 'النمو العاطفي'}
                                </Text>
                                {kidsBenefits.emotional.skills?.map((skill: string, i: number) => (
                                    <Text key={i} style={[styles.benefitSkill, { color: colors.emotional }]}>• {skill}</Text>
                                ))}
                            </View>
                        )}

                        {/* Social */}
                        {kidsBenefits.social && (
                            <View style={[styles.benefitCard, { backgroundColor: colors.socialLight }]}>
                                <Text style={styles.benefitIcon}>[اجتماعي]</Text>
                                <Text style={[styles.benefitTitle, { color: colors.social }]}>
                                    {kidsBenefits.social.title || 'المهارات الاجتماعية'}
                                </Text>
                                {kidsBenefits.social.skills?.map((skill: string, i: number) => (
                                    <Text key={i} style={[styles.benefitSkill, { color: colors.social }]}>• {skill}</Text>
                                ))}
                            </View>
                        )}

                        {/* Physical */}
                        {kidsBenefits.physical && (
                            <View style={[styles.benefitCard, { backgroundColor: colors.physicalLight }]}>
                                <Text style={styles.benefitIcon}>[جسدي]</Text>
                                <Text style={[styles.benefitTitle, { color: colors.physical }]}>
                                    {kidsBenefits.physical.title || 'التطور الجسدي'}
                                </Text>
                                {kidsBenefits.physical.skills?.map((skill: string, i: number) => (
                                    <Text key={i} style={[styles.benefitSkill, { color: colors.physical }]}>• {skill}</Text>
                                ))}
                            </View>
                        )}

                        {/* Character */}
                        {kidsBenefits.character && (
                            <View style={[styles.benefitCard, { backgroundColor: colors.characterLight, width: '100%' }]}>
                                <Text style={styles.benefitIcon}>[شخصية]</Text>
                                <Text style={[styles.benefitTitle, { color: colors.character }]}>
                                    {kidsBenefits.character.title || 'بناء الشخصية'}
                                </Text>
                                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
                                    {kidsBenefits.character.skills?.map((skill: string, i: number) => (
                                        <Text key={i} style={[styles.benefitSkill, { color: colors.character, width: '50%' }]}>• {skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Parent Tips */}
                    {kidsBenefits.parentTips && kidsBenefits.parentTips.length > 0 && (
                        <View style={styles.parentTipsBox}>
                            <Text style={styles.parentTipsTitle}>نصائح للأهل</Text>
                            {kidsBenefits.parentTips.map((tip: string, i: number) => (
                                <Text key={i} style={styles.parentTip}>- {tip}</Text>
                            ))}
                        </View>
                    )}

                    {/* Long term impact */}
                    {kidsBenefits.longTermImpact && (
                        <View style={styles.impactBox}>
                            <Text style={styles.impactText}>
                                الأثر طويل المدى: {kidsBenefits.longTermImpact}
                            </Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>فوائد الورشة للأطفال</Text>
                        <Text style={styles.pageNumber}>{(plan.timeline?.length || 0) + 3}</Text>
                    </View>
                </Page>
            )}

            {/* ============ FACILITATOR NOTES PAGE ============ */}
            {plan.facilitatorNotes && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>ملاحظات الميسّر</Text>

                        {typeof plan.facilitatorNotes === 'object' && !Array.isArray(plan.facilitatorNotes) ? (
                            <>
                                {plan.facilitatorNotes.beforeWorkshop && plan.facilitatorNotes.beforeWorkshop.length > 0 && (
                                    <>
                                        <Text style={styles.notesSubtitle}>قبل الورشة:</Text>
                                        {plan.facilitatorNotes.beforeWorkshop.map((note, i) => (
                                            <Text key={i} style={styles.noteItem}>• {note}</Text>
                                        ))}
                                    </>
                                )}

                                {plan.facilitatorNotes.duringWorkshop && plan.facilitatorNotes.duringWorkshop.length > 0 && (
                                    <>
                                        <Text style={styles.notesSubtitle}>أثناء الورشة:</Text>
                                        {plan.facilitatorNotes.duringWorkshop.map((note, i) => (
                                            <Text key={i} style={styles.noteItem}>• {note}</Text>
                                        ))}
                                    </>
                                )}
                            </>
                        ) : (
                            Array.isArray(plan.facilitatorNotes) && plan.facilitatorNotes.map((note, i) => (
                                <Text key={i} style={styles.noteItem}>• {note}</Text>
                            ))
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>ملاحظات الميسّر</Text>
                        <Text style={styles.pageNumber}>{(plan.timeline?.length || 0) + 4}</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};

export default PremiumWorkshopPDF;
