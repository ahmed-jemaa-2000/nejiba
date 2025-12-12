/**
 * Enhanced Workshop PDF Component
 *
 * Beautiful PDF export with prominent introduction display
 */

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { WorkshopPlanData } from '@/lib/ai/providers/base';

// Register Arabic fonts - Using Noto Sans Arabic (reliable CDN)
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

// Enhanced color palette
const colors = {
    primary: '#4F46E5',
    accent: '#10B981',

    // Introduction section
    introBackground: '#DBEAFE',
    introBorder: '#3B82F6',
    introText: '#1E40AF',

    // Activity energy colors
    highEnergy: '#FEE2E2',
    mediumEnergy: '#FEF3C7',
    lowEnergy: '#D1FAE5',

    // Text
    heading: '#1E293B',
    body: '#334155',
    light: '#64748B',
    white: '#FFFFFF',

    // Backgrounds
    cream: '#FFFBEB',
    gray: '#F8FAFC',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'NotoSansArabic',
        padding: 40,
        backgroundColor: colors.cream,
        textAlign: 'right', // RTL support
    },

    // Cover Page
    coverPage: {
        fontFamily: 'NotoSansArabic',
        padding: 40,
        backgroundColor: colors.white,
        textAlign: 'right', // RTL support
    },
    coverTitle: {
        fontSize: 32,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginTop: 100,
        marginBottom: 20,
    },
    coverSubtitle: {
        fontSize: 18,
        fontFamily: 'NotoSansArabic',
        color: colors.light,
        textAlign: 'center',
        marginBottom: 60,
    },

    // Introduction Section (Prominent!)
    introSection: {
        backgroundColor: colors.introBackground,
        borderWidth: 3,
        borderColor: colors.introBorder,
        borderRadius: 10,
        padding: 20,
        marginTop: 40,
        marginBottom: 40,
        textAlign: 'right', // RTL for Arabic
    },
    introTitle: {
        fontSize: 20,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.introText,
        marginBottom: 15,
        textAlign: 'center',
    },
    introPhrase: {
        fontSize: 15,
        fontFamily: 'NotoSansArabic',
        color: colors.introText,
        marginBottom: 15,
        lineHeight: 2,
        paddingRight: 30,
        paddingLeft: 10,
        textAlign: 'right', // RTL for Arabic
        width: '100%',
    },
    introNumber: {
        fontSize: 18,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        marginLeft: 10,
    },

    // General Info
    infoSection: {
        marginBottom: 20,
        textAlign: 'right', // RTL
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.heading,
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: 5,
        textAlign: 'right', // RTL
        width: '100%',
    },
    infoGrid: {
        flexDirection: 'row-reverse', // RTL grid
        flexWrap: 'wrap',
        marginBottom: 15,
        gap: 8,
    },
    infoItem: {
        width: '48%',
        marginBottom: 8,
        backgroundColor: colors.gray,
        borderWidth: 1,
        borderColor: colors.light + '30',
        borderRadius: 8,
        padding: 10,
    },
    infoLabel: {
        fontSize: 10,
        fontFamily: 'NotoSansArabic',
        color: colors.light,
        marginBottom: 2,
        textAlign: 'right', // RTL
    },
    infoValue: {
        fontSize: 12,
        fontFamily: 'NotoSansArabic',
        color: colors.body,
        fontWeight: 'bold',
        textAlign: 'right', // RTL
    },

    // Objectives
    objectivesList: {
        marginBottom: 20,
        textAlign: 'right', // RTL
    },
    objectiveItem: {
        flexDirection: 'row-reverse', // RTL: bullet on right
        marginBottom: 6,
        paddingRight: 10,
        textAlign: 'right',
    },
    objectiveBullet: {
        fontSize: 12,
        fontFamily: 'NotoSansArabic',
        color: colors.accent,
        marginLeft: 5,
        marginRight: 8,
    },
    objectiveText: {
        fontSize: 11,
        fontFamily: 'NotoSansArabic',
        color: colors.body,
        flex: 1,
        lineHeight: 1.6,
        textAlign: 'right', // RTL
        maxWidth: '90%',
    },

    // Materials
    materialsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    materialChip: {
        backgroundColor: colors.accent + '20',
        borderWidth: 1,
        borderColor: colors.accent,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        margin: 3,
    },
    materialText: {
        fontSize: 10,
        fontFamily: 'NotoSansArabic',
        color: colors.accent,
        textAlign: 'right', // RTL
    },

    // Timeline
    timelineSection: {
        marginTop: 20,
    },
    activityCard: {
        marginBottom: 15,
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        breakInside: 'avoid',
        width: '100%',
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activityTitle: {
        fontSize: 14,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.heading,
        textAlign: 'right', // RTL
        width: '100%',
        marginBottom: 8,
    },
    activityMeta: {
        flexDirection: 'row-reverse', // RTL: time on right
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'flex-start',
    },
    activityTime: {
        fontSize: 9,
        fontFamily: 'NotoSansArabic',
        backgroundColor: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginLeft: 5,
    },
    activityType: {
        fontSize: 9,
        fontFamily: 'NotoSansArabic',
        backgroundColor: colors.primary + '30',
        color: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    activityDescription: {
        fontSize: 10,
        fontFamily: 'NotoSansArabic',
        color: colors.body,
        marginBottom: 8,
        lineHeight: 1.6,
        textAlign: 'right', // RTL
        width: '100%',
    },
    stepsTitle: {
        fontSize: 11,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.heading,
        marginBottom: 6,
        textAlign: 'right', // RTL
        width: '100%',
    },
    stepsList: {
        marginBottom: 8,
    },
    stepItem: {
        fontSize: 10,
        fontFamily: 'NotoSansArabic',
        color: colors.body,
        marginBottom: 4,
        paddingRight: 15,
        lineHeight: 1.5,
        textAlign: 'right', // RTL
        width: '100%',
    },
    lifeSkillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    lifeSkillChip: {
        fontSize: 8,
        fontFamily: 'NotoSansArabic',
        backgroundColor: colors.white,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        margin: 2,
        textAlign: 'right',
    },

    // Facilitator Notes
    notesSection: {
        backgroundColor: colors.gray,
        borderWidth: 1,
        borderColor: colors.light + '40',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
    },
    notesTitle: {
        fontSize: 14,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.heading,
        marginBottom: 10,
        textAlign: 'right', // RTL
    },
    noteSubtitle: {
        fontSize: 11,
        fontFamily: 'NotoSansArabic',
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'right', // RTL
    },
    noteItem: {
        fontSize: 10,
        fontFamily: 'NotoSansArabic',
        color: colors.body,
        marginBottom: 4,
        paddingRight: 15,
        lineHeight: 1.5,
        textAlign: 'right', // RTL
        width: '100%',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        fontFamily: 'NotoSansArabic',
        color: colors.light,
        borderTopWidth: 1,
        borderTopColor: colors.light + '40',
        paddingTop: 10,
    },
});

interface EnhancedWorkshopPDFProps {
    plan: WorkshopPlanData;
}

export const EnhancedWorkshopPDF: React.FC<EnhancedWorkshopPDFProps> = ({ plan }) => {
    // Get energy theme (background + border)
    const getEnergyTheme = (level?: string) => {
        const normalized = (level || '').toString().toLowerCase();
        if (normalized === 'high') return { bg: colors.highEnergy, border: '#FCA5A5' };
        if (normalized === 'low') return { bg: colors.lowEnergy, border: '#6EE7B7' };
        return { bg: colors.mediumEnergy, border: '#FCD34D' };
    };

    const getSteps = (activity: WorkshopPlanData["timeline"][number]): string[] =>
        activity.mainSteps ??
        activity.instructions ??
        activity.detailedSteps ??
        activity.setupSteps ??
        [];

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.coverPage}>
                <Text style={styles.coverTitle}>{plan.title.ar}</Text>
                {plan.title.en && <Text style={styles.coverSubtitle}>{plan.title.en}</Text>}

                {/* Introduction - Prominent Display */}
                {plan.introduction && (
                    <View style={styles.introSection}>
                        <Text style={styles.introTitle}>👋 مقدمة الورشة للأطفال</Text>
                        <View style={{ flexDirection: 'row-reverse', marginBottom: 12, paddingRight: 10 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'NotoSansArabic', fontWeight: 'bold', color: colors.introText, marginLeft: 10 }}>
                                1️⃣
                            </Text>
                            <Text style={{ fontSize: 15, fontFamily: 'NotoSansArabic', color: colors.introText, flex: 1, textAlign: 'right', lineHeight: 2 }}>
                                {plan.introduction.phrase1}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row-reverse', marginBottom: 12, paddingRight: 10 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'NotoSansArabic', fontWeight: 'bold', color: colors.introText, marginLeft: 10 }}>
                                2️⃣
                            </Text>
                            <Text style={{ fontSize: 15, fontFamily: 'NotoSansArabic', color: colors.introText, flex: 1, textAlign: 'right', lineHeight: 2 }}>
                                {plan.introduction.phrase2}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row-reverse', marginBottom: 0, paddingRight: 10 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'NotoSansArabic', fontWeight: 'bold', color: colors.introText, marginLeft: 10 }}>
                                3️⃣
                            </Text>
                            <Text style={{ fontSize: 15, fontFamily: 'NotoSansArabic', color: colors.introText, flex: 1, textAlign: 'right', lineHeight: 2 }}>
                                {plan.introduction.phrase3}
                            </Text>
                        </View>
                    </View>
                )}

                {/* General Info on Cover */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>المدة</Text>
                        <Text style={styles.infoValue}>{plan.generalInfo.duration}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>الفئة العمرية</Text>
                        <Text style={styles.infoValue}>{plan.generalInfo.ageGroup}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>المشاركون</Text>
                        <Text style={styles.infoValue}>{plan.generalInfo.participants}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>المستوى</Text>
                        <Text style={styles.infoValue}>{plan.generalInfo.level}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    🤖 تم الإنشاء باستخدام Nejiba Studio • مستورد من ChatGPT
                </Text>
            </Page>

            {/* Content Page */}
            <Page size="A4" style={styles.page}>
                {/* Objectives */}
                {plan.objectives && plan.objectives.length > 0 && (
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>🎯 الأهداف</Text>
                        <View style={styles.objectivesList}>
                            {plan.objectives.map((obj, i) => (
                                <View key={i} style={styles.objectiveItem}>
                                    <Text style={styles.objectiveBullet}>•</Text>
                                    <Text style={styles.objectiveText}>
                                        {typeof obj === 'string' ? obj : obj.ar}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Materials */}
                {plan.materials && plan.materials.length > 0 && (
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>🧰 المواد المطلوبة</Text>
                        <View style={styles.materialsContainer}>
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
                    </View>
                )}

                <Text style={styles.footer}>صفحة {1} • {plan.title.ar}</Text>
            </Page>

            {/* Activities Pages */}
            {plan.timeline && plan.timeline.map((activity, index) => (
                <Page key={index} size="A4" style={styles.page}>
                    <View style={styles.timelineSection}>
                        <View
                            style={[
                                styles.activityCard,
                                {
                                    backgroundColor: getEnergyTheme(activity.energyLevel).bg,
                                    borderColor: getEnergyTheme(activity.energyLevel).border,
                                    borderRightWidth: 4,
                                    borderRightColor: colors.primary,
                                }
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.activityMeta}>
                                <Text style={styles.activityTime}>{activity.timeRange}</Text>
                                {activity.activityType && (
                                    <Text style={styles.activityType}>{activity.activityType}</Text>
                                )}
                            </View>

                            <Text style={styles.activityTitle}>{activity.title}</Text>

                            {activity.blockType && (
                                <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.light, marginBottom: 8, textAlign: 'right' }}>
                                    {activity.blockType}
                                </Text>
                            )}

                            {/* Description */}
                            <Text style={styles.activityDescription}>{activity.description}</Text>

                            {/* Main Steps */}
                            {getSteps(activity).length > 0 && (
                                <View style={styles.stepsList}>
                                    <Text style={styles.stepsTitle}>الخطوات:</Text>
                                    {getSteps(activity).map((step, si) => (
                                        <View key={si} style={{ flexDirection: 'row-reverse', marginBottom: 4, paddingRight: 10 }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.accent, marginLeft: 5 }}>
                                                .{si + 1}
                                            </Text>
                                            <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.5 }}>
                                                {step}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* What You Need */}
                            {activity.whatYouNeed && activity.whatYouNeed.length > 0 && (
                                <View style={{ marginBottom: 8 }}>
                                    <Text style={styles.stepsTitle}>المواد المطلوبة:</Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.body, textAlign: 'right', lineHeight: 1.5 }}>
                                        {activity.whatYouNeed.join(' • ')}
                                    </Text>
                                </View>
                            )}

                            {/* Visual Cues */}
                            {activity.visualCues && activity.visualCues.length > 0 && (
                                <View style={{ marginBottom: 8 }}>
                                    <Text style={styles.stepsTitle}>الإشارات البصرية:</Text>
                                    {activity.visualCues.map((cue, ci) => (
                                        <View key={ci} style={{ flexDirection: 'row-reverse', marginBottom: 3, paddingRight: 5 }}>
                                            <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', color: colors.accent, marginLeft: 5 }}>•</Text>
                                            <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.4 }}>
                                                {cue}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Spoken Phrases */}
                            {activity.spokenPhrases && activity.spokenPhrases.length > 0 && (
                                <View style={{ marginBottom: 8 }}>
                                    <Text style={styles.stepsTitle}>العبارات المنطوقة:</Text>
                                    {activity.spokenPhrases.map((phrase, pi) => (
                                        <View key={pi} style={{ flexDirection: 'row-reverse', marginBottom: 3, paddingRight: 5 }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', marginLeft: 5 }}>💬</Text>
                                            <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.4 }}>
                                                {phrase}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Confidence Building Moment */}
                            {activity.confidenceBuildingMoment && (
                                <View style={{ marginBottom: 8, backgroundColor: colors.white, padding: 10, borderRadius: 5 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', color: colors.primary, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' }}>
                                        ✨ لحظة بناء الثقة:
                                    </Text>
                                    <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', color: colors.body, textAlign: 'right', lineHeight: 1.5 }}>
                                        {activity.confidenceBuildingMoment}
                                    </Text>
                                </View>
                            )}

                            {/* Life Skills */}
                            {activity.lifeSkillsFocus && activity.lifeSkillsFocus.length > 0 && (
                                <View style={[styles.lifeSkillsContainer, { flexDirection: 'row-reverse' }]}>
                                    <Text style={{ fontSize: 9, fontFamily: 'NotoSansArabic', fontWeight: 'bold', marginLeft: 5, textAlign: 'right' }}>
                                        المهارات:
                                    </Text>
                                    {activity.lifeSkillsFocus.map((skill, si) => (
                                        <View key={si} style={styles.lifeSkillChip}>
                                            <Text style={{ fontFamily: 'NotoSansArabic' }}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        صفحة {index + 2} • نشاط {index + 1} من {plan.timeline.length}
                    </Text>
                </Page>
            ))}

            {/* Facilitator Notes Page */}
            {plan.facilitatorNotes && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>📝 ملاحظات الميسّر</Text>

                        {typeof plan.facilitatorNotes === 'object' && !Array.isArray(plan.facilitatorNotes) ? (
                            <>
                                {plan.facilitatorNotes.beforeWorkshop && plan.facilitatorNotes.beforeWorkshop.length > 0 && (
                                    <View>
                                        <Text style={styles.noteSubtitle}>قبل الورشة:</Text>
                                        {plan.facilitatorNotes.beforeWorkshop.map((note, i) => (
                                            <View key={i} style={{ flexDirection: 'row-reverse', marginBottom: 4, paddingRight: 5 }}>
                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.accent, marginLeft: 5 }}>•</Text>
                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.5 }}>
                                                    {note}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {plan.facilitatorNotes.duringWorkshop && plan.facilitatorNotes.duringWorkshop.length > 0 && (
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={styles.noteSubtitle}>أثناء الورشة:</Text>
                                        {plan.facilitatorNotes.duringWorkshop.map((note, i) => (
                                            <View key={i} style={{ flexDirection: 'row-reverse', marginBottom: 4, paddingRight: 5 }}>
                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.accent, marginLeft: 5 }}>•</Text>
                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.5 }}>
                                                    {note}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        ) : (
                            (plan.facilitatorNotes as string[]).map((note, i) => (
                                <View key={i} style={{ flexDirection: 'row-reverse', marginBottom: 4, paddingRight: 5 }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.accent, marginLeft: 5 }}>•</Text>
                                    <Text style={{ fontSize: 10, fontFamily: 'NotoSansArabic', color: colors.body, flex: 1, textAlign: 'right', lineHeight: 1.5 }}>
                                        {note}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>

                    <Text style={styles.footer}>
                        ملاحظات الميسّر • {plan.title.ar}
                    </Text>
                </Page>
            )}
        </Document>
    );
};
