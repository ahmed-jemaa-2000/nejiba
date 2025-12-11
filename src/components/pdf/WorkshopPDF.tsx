
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { WorkshopPlanData, WorkshopInput } from '@/app/workshop/page';

// Register Arabic font
// Using Amiri font from Google Fonts CDN
Font.register({
    family: 'Amiri',
    fonts: [
        { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf' }, // Regular
        { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Bold.ttf', fontWeight: 'bold' }, // Bold
    ],
});

// Using Tajawal for headers/modern look
Font.register({
    family: 'Tajawal',
    fonts: [
        { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf' }, // Regular
        { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf', fontWeight: 'bold' }, // Bold
    ],
});

// Enhanced Color Palette
const colors = {
    // Primary
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    primaryDark: '#4338CA',

    // Activity type colors
    welcome: '#10B981',      // Green
    main: '#3B82F6',         // Blue
    transition: '#F59E0B',   // Amber
    reflection: '#8B5CF6',   // Purple
    closing: '#EC4899',      // Pink

    // Section colors
    materials: '#F59E0B',    // Amber
    schedule: '#06B6D4',     // Cyan
    objectives: '#EC4899',   // Pink
    activities: '#8B5CF6',   // Purple

    // Text
    heading: '#1E293B',
    body: '#334155',
    light: '#64748B',
    white: '#FFFFFF',

    // Backgrounds
    cream: '#FFFBEB',
    lightGreen: '#F0FDF4',
    lightBlue: '#EFF6FF',
    lightPurple: '#FAF5FF',
    lightPink: '#FDF2F8',
    lightAmber: '#FFFBEB',
    gray: '#F8FAFC',
};

// Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.cream,
        fontFamily: 'Amiri',
        padding: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 10,
    },
    headerLeft: {
        fontSize: 10,
        color: '#64748B',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    titleSection: {
        marginBottom: 20,
    },
    workshopTag: {
        fontSize: 12,
        color: '#4F46E5',
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    mainTitle: {
        fontSize: 24,
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 5,
        textAlign: 'right', // RTL
    },
    subTitle: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'right',
    },
    statsGrid: {
        flexDirection: 'row-reverse', // RTL grid
        gap: 10,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 8,
        color: '#64748B',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 12,
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        color: '#0F172A',
    },
    section: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    sectionHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: colors.primaryLight,
        padding: 8,
        borderRadius: 6,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
    },
    list: {
        marginLeft: 0,
    },
    listItem: {
        flexDirection: 'row-reverse',
        fontSize: 10,
        marginBottom: 4,
        textAlign: 'right',
        lineHeight: 1.5,
    },
    bullet: {
        width: 15,
        textAlign: 'center',
        color: '#4F46E5',
        fontSize: 10,
    },
    timelineItem: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderRightWidth: 4,
        borderRightColor: colors.main,  // Will be dynamic based on activity type
        borderWidth: 1,
        borderColor: colors.lightBlue,
    },
    timelineHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    timelineTime: {
        fontSize: 9,
        color: '#4F46E5',
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
    },
    timelineTitle: {
        fontSize: 12,
        fontFamily: 'Tajawal',
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'right',
    },
    timelineDesc: {
        fontSize: 10,
        color: '#334155',
        textAlign: 'right',
        marginBottom: 5,
        lineHeight: 1.4,
    },
    stepItem: {
        flexDirection: 'row-reverse',
        fontSize: 9,
        marginBottom: 3,
        textAlign: 'right',
    },
    stepIndex: {
        width: 15,
        fontSize: 9,
        color: '#64748B',
        textAlign: 'center',
        marginLeft: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#CBD5E1',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
    },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#E0E7FF',
        borderRadius: 4,
        fontSize: 8,
        color: '#3730A3',
        marginRight: 4,
    },
    tagsRow: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        marginTop: 4,
    }
});

interface WorkshopPDFProps {
    plan: WorkshopPlanData;
    input: WorkshopInput;
}

// Helper function to get activity color based on block type or position
const getActivityColor = (index: number, total: number): string => {
    if (index === 0) return colors.welcome;  // First activity (opener)
    if (index === total - 1) return colors.closing;  // Last activity
    if (index === Math.floor(total / 2)) return colors.transition;  // Middle
    return index % 2 === 0 ? colors.main : colors.reflection;  // Alternate colors
};

export const WorkshopPDF = ({ plan, input }: WorkshopPDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRight}>
                        <Text style={styles.logoText}>NEJIBA STUDIO</Text>
                    </View>
                    <Text style={styles.headerLeft}>
                        {new Date().toLocaleDateString('en-GB')}
                    </Text>
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.workshopTag}>خطة ورشة عمل</Text>
                    <Text style={styles.mainTitle}>{plan.title.ar}</Text>
                    <Text style={styles.subTitle}>{plan.title.en}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>المدة الزمنية</Text>
                        <Text style={styles.statValue}>{plan.generalInfo.duration}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>الفئة العمرية</Text>
                        <Text style={styles.statValue}>{plan.generalInfo.ageGroup}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>المشاركون</Text>
                        <Text style={styles.statValue}>{plan.generalInfo.participants}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>عدد الأنشطة</Text>
                        <Text style={styles.statValue}>{plan.timeline.length}</Text>
                    </View>
                </View>

                {/* Learning Objectives */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🎯 أهداف التعلم</Text>
                    </View>
                    <View style={styles.list}>
                        {plan.objectives.map((obj, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.bullet}>{i + 1}.</Text>
                                <Text style={{ flex: 1 }}>{obj.ar}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Materials */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📦 المواد المطلوبة</Text>
                    </View>
                    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 5 }}>
                        {plan.materials.map((m, i) => (
                            <View key={i} style={{
                                width: '48%',
                                flexDirection: 'row-reverse',
                                marginBottom: 4
                            }}>
                                <Text style={{ color: '#4F46E5', fontSize: 10, marginLeft: 4 }}>•</Text>
                                <Text style={{ fontSize: 10, flex: 1 }}>
                                    {typeof m === 'string' ? m : `${m.item} (${m.quantity})`}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Timeline Activities */}
                {plan.timeline.map((activity, i) => {
                    const stepsData = (activity as any).steps || activity.instructions || [];
                    const activityColor = getActivityColor(i, plan.timeline.length);

                    return (
                        <View key={i} style={{...styles.timelineItem, borderRightColor: activityColor, borderColor: activityColor + '20'}} wrap={false}>
                            <View style={styles.timelineHeader}>
                                <View>
                                    <Text style={styles.timelineTitle}>{activity.title}</Text>
                                    <View style={styles.tagsRow}>
                                        <Text style={styles.tag}>{activity.timeRange}</Text>
                                        {activity.gameType && <Text style={styles.tag}>{activity.gameType}</Text>}
                                        {activity.energyLevel && <Text style={styles.tag}>{activity.energyLevel.replace(/🔋/g, '')}</Text>}
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.timelineDesc}>{activity.description}</Text>

                            {/* Steps */}
                            {stepsData.length > 0 && (
                                <View style={{ marginTop: 5 }}>
                                    {stepsData.map((step: any, idx: number) => (
                                        <View key={idx} style={styles.stepItem}>
                                            <Text style={styles.stepIndex}>{idx + 1}</Text>
                                            <Text style={{ flex: 1, color: '#334155' }}>
                                                {typeof step === 'string' ? step : `${step.action}`}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                        </View>
                    );
                })}

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    Nejiba Studio | Powered by AI | Designed for Educators
                </Text>
            </Page>
        </Document>
    );
};
