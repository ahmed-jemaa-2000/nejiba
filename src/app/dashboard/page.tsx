"use client";

/**
 * CASEL Progress Dashboard
 * 
 * Visual dashboard showing:
 * - Overall progress through 36 workshops
 * - Per-unit completion status
 * - Recently completed workshops
 * - Workshop history with quick actions
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { progressStorage, type OverallProgress, type WorkshopProgress } from "@/lib/storage/progressStorage";
import { workshopStorage, type StoredWorkshop } from "@/lib/storage/workshopStorage";
import { UNITS, PROGRAM_INFO } from "@/lib/workshop/workshopCurriculum";
import { Button, Card, useToast } from "@/components/ui";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PremiumWorkshopPDF } from "@/components/pdf/PremiumWorkshopPDF";

export default function DashboardPage() {
    const [progress, setProgress] = useState<OverallProgress | null>(null);
    const [history, setHistory] = useState<StoredWorkshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setIsLoading(true);
        const progressData = progressStorage.getOverallProgress();
        const historyData = workshopStorage.getAll().sort(
            (a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        );

        setProgress(progressData);
        setHistory(historyData);
        setIsLoading(false);
    };

    const handleDeleteWorkshop = (id: string) => {
        if (confirm("هل تريد حذف هذه الورشة؟")) {
            workshopStorage.delete(id);
            loadData();
            showToast("تم حذف الورشة", "success");
        }
    };

    const handleMarkCompleted = (workshopNumber: number, unitNumber: number) => {
        progressStorage.markCompleted(workshopNumber, unitNumber);
        loadData();
        showToast("تم تحديد الورشة كمكتملة ✅", "success");
    };

    const handleMarkIncomplete = (workshopNumber: number) => {
        progressStorage.markIncomplete(workshopNumber);
        loadData();
        showToast("تم إلغاء اكتمال الورشة", "success");
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('ar-TN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading || !progress) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">📊</div>
                    <p className="text-foreground-secondary">جاري التحميل...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            📊 لوحة التحكم
                        </h1>
                        <p className="text-foreground-secondary">
                            تتبع تقدمك في برنامج {PROGRAM_INFO.titleAr}
                        </p>
                    </div>
                    <Link
                        href="/program"
                        className="px-4 py-2 rounded-xl bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-500/30 transition-colors font-medium"
                    >
                        ← اذهب للبرنامج
                    </Link>
                </div>

                {/* Overall Progress Card */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-2 border-violet-500/30">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Progress Circle */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={`${progress.progressPercent * 3.52} 352`}
                                    className="text-violet-500 transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-3xl font-bold text-foreground">{progress.progressPercent}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                                <div className="text-3xl font-bold text-violet-600">{progress.completedWorkshops}</div>
                                <div className="text-sm text-foreground-secondary">ورشة مكتملة</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                                <div className="text-3xl font-bold text-purple-600">{progress.totalWorkshops - progress.completedWorkshops}</div>
                                <div className="text-sm text-foreground-secondary">ورشة متبقية</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                                <div className="text-3xl font-bold text-fuchsia-600">{progress.currentUnit}</div>
                                <div className="text-sm text-foreground-secondary">الوحدة الحالية</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                                <div className="text-3xl font-bold text-pink-600">{history.length}</div>
                                <div className="text-sm text-foreground-secondary">ورشة محفوظة</div>
                            </div>
                        </div>
                    </div>

                    {/* Next Workshop */}
                    {progress.nextWorkshop && (
                        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                            الورشة التالية: رقم {progress.nextWorkshop}
                                        </p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                            ابدأ بها الآن لتكمل تقدمك!
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/program"
                                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
                                >
                                    ابدأ الآن →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Units Progress */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">📚 تقدم الوحدات</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {progress.unitsProgress.map((unitProgress, idx) => {
                            const unit = UNITS[idx];
                            return (
                                <div
                                    key={unitProgress.unitNumber}
                                    className="p-4 rounded-2xl border-2 transition-all"
                                    style={{
                                        borderColor: unit.color,
                                        backgroundColor: `${unit.color}10`,
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{unit.icon}</span>
                                        <span className="font-bold text-foreground">{unit.titleAr}</span>
                                    </div>
                                    <div className="text-sm text-foreground-secondary mb-2">
                                        {unitProgress.completedWorkshops} / {unitProgress.totalWorkshops} ورش
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${unitProgress.progressPercent}%`,
                                                backgroundColor: unit.color,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-center mt-1 font-medium" style={{ color: unit.color }}>
                                        {unitProgress.progressPercent}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Workshop History */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-foreground">📁 سجل الورش المحفوظة</h2>
                        <span className="text-sm text-foreground-secondary">
                            {history.length} ورشة محفوظة
                        </span>
                    </div>

                    {history.length === 0 ? (
                        <Card variant="bordered" padding="lg" className="text-center">
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-foreground-secondary mb-4">لا توجد ورش محفوظة بعد</p>
                            <Link
                                href="/program"
                                className="inline-block px-6 py-3 rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors font-medium"
                            >
                                ابدأ أول ورشة →
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {history.map((workshop) => (
                                <Card key={workshop.id} variant="bordered" padding="md">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl">
                                                📋
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground text-lg">
                                                    {workshop.plan.title.ar}
                                                </h3>
                                                <p className="text-sm text-foreground-secondary">
                                                    {workshop.metadata.duration} • {workshop.metadata.ageRange}
                                                </p>
                                                <p className="text-xs text-foreground-secondary/70">
                                                    {formatDate(workshop.metadata.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* View in Import Page */}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    localStorage.setItem('nejiba_current_workshop', JSON.stringify(workshop.plan));
                                                    window.location.href = '/import';
                                                }}
                                            >
                                                👁️ عرض
                                            </Button>

                                            {/* Download PDF */}
                                            <PDFDownloadLink
                                                document={<PremiumWorkshopPDF plan={workshop.plan} />}
                                                fileName={`workshop-${workshop.plan.title.ar.replace(/\s+/g, '-')}.pdf`}
                                            >
                                                {({ loading }) => (
                                                    <Button variant="primary" size="sm" loading={loading}>
                                                        📄 PDF
                                                    </Button>
                                                )}
                                            </PDFDownloadLink>

                                            {/* Video */}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    localStorage.setItem('nejiba_current_workshop', JSON.stringify(workshop.plan));
                                                    window.location.href = '/video';
                                                }}
                                            >
                                                🎬 فيديو
                                            </Button>

                                            {/* Delete */}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleDeleteWorkshop(workshop.id)}
                                                className="text-red-500 hover:bg-red-500/10"
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Footer */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 border-2 border-amber-300 dark:border-amber-700">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-4 text-lg">
                        ⚡ إجراءات سريعة
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/program"
                            className="px-4 py-2 rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors font-medium"
                        >
                            📚 البرنامج
                        </Link>
                        <Link
                            href="/import"
                            className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
                        >
                            📥 استيراد ورشة
                        </Link>
                        <Link
                            href="/video"
                            className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium"
                        >
                            🎬 مولد الفيديو
                        </Link>
                        <button
                            onClick={() => {
                                const json = JSON.stringify(history.map(w => w.plan), null, 2);
                                navigator.clipboard.writeText(json);
                                showToast("تم نسخ جميع الورش كـ JSON!", "success");
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
                        >
                            📋 نسخ الكل كـ JSON
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
