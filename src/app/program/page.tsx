"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAM_INFO, UNITS, type Workshop, type Unit } from "@/lib/workshop/workshopCurriculum";

export default function ProgramPage() {
    const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set([1])); // Unit 1 expanded by default
    const [copiedWorkshop, setCopiedWorkshop] = useState<number | null>(null);

    const toggleUnit = (unitNumber: number) => {
        setExpandedUnits(prev => {
            const newSet = new Set(prev);
            if (newSet.has(unitNumber)) {
                newSet.delete(unitNumber);
            } else {
                newSet.add(unitNumber);
            }
            return newSet;
        });
    };

    const copyPrompt = async (workshop: Workshop) => {
        try {
            // Use clipboard API if available, otherwise use fallback
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(workshop.prompt);
            } else {
                // Fallback for non-HTTPS contexts
                const textArea = document.createElement('textarea');
                textArea.value = workshop.prompt;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopiedWorkshop(workshop.number);
            setTimeout(() => setCopiedWorkshop(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <main className="min-h-screen bg-background" dir="rtl">
            {/* Hero Section */}
            <header className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 text-white">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                    {/* Navigation */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            الرئيسية
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                            📊 لوحة التحكم
                        </Link>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                            <span className="text-2xl">🎓</span>
                            <span className="text-sm font-medium">CASEL Framework</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            {PROGRAM_INFO.titleAr}
                        </h1>
                        <p className="text-lg text-white/80 mb-6">
                            {PROGRAM_INFO.titleEn}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <Stat icon="📚" value="36" label="ورشة عمل" />
                        <Stat icon="📅" value="9" label="أشهر" />
                        <Stat icon="⏱️" value="90" label="دقيقة/ورشة" />
                        <Stat icon="👥" value="10-15" label="سنة" />
                        <Stat icon="🏛️" value="5" label="وحدات CASEL" />
                    </div>

                    {/* CASEL Competencies visual */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        {UNITS.map((unit) => (
                            <button
                                key={unit.number}
                                onClick={() => {
                                    toggleUnit(unit.number);
                                    // Scroll to unit if expanding
                                    setTimeout(() => {
                                        document.getElementById(`unit-${unit.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
                            >
                                <span>{unit.icon}</span>
                                <span className="text-sm">{unit.titleAr}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Instructions & Workflow - Enhanced for beginners */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 border-y-2 border-amber-300 dark:border-amber-700 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Title */}
                    <div className="text-center mb-6">
                        <span className="inline-block px-4 py-1 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-sm font-bold mb-2">
                            📋 كيف تستخدم البرنامج؟
                        </span>
                        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                            3 خطوات بسيطة للحصول على ورشة عمل كاملة!
                        </h2>
                    </div>

                    {/* Steps */}
                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
                        {/* Step 1 */}
                        <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">اختر ورشة</h3>
                                    <p className="text-sm text-foreground-secondary mb-2">انقر على أي ورشة أدناه لنسخ البرومبت الجاهز</p>
                                    <div className="text-xs text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 rounded-lg px-3 py-2">
                                        💡 اختر من 36 ورشة عمل CASEL
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 rotate-180">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>
                        <div className="flex md:hidden items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 rotate-90">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>

                        {/* Step 2 */}
                        <div className="flex-1 p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">الصق في ChatGPT</h3>
                                    <p className="text-sm text-foreground-secondary mb-2">افتح <a href="https://chat.openai.com" target="_blank" className="text-blue-600 underline">ChatGPT</a> والصق البرومبت</p>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-2">
                                        🤖 ChatGPT سينشئ خطة JSON كاملة
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 rotate-180">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>
                        <div className="flex md:hidden items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 rotate-90">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>

                        {/* Step 3 */}
                        <Link
                            href="/import"
                            className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 border-2 border-emerald-500 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg mb-1">استورد هنا! ←</h3>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">انسخ JSON من ChatGPT واستورده</p>
                                    <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-200 dark:bg-emerald-800/50 rounded-lg px-3 py-2 font-bold">
                                        📄 احصل على PDF جاهز للطباعة!
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Help text */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            ❓ تحتاج مساعدة؟ ابدأ بالخطوة 1 - اختر ورشة من القائمة أدناه!
                        </p>
                    </div>
                </div>
            </div>

            {/* Units */}
            <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
                {UNITS.map((unit) => (
                    <UnitSection
                        key={unit.number}
                        unit={unit}
                        isExpanded={expandedUnits.has(unit.number)}
                        onToggle={() => toggleUnit(unit.number)}
                        copiedWorkshop={copiedWorkshop}
                        onCopyPrompt={copyPrompt}
                    />
                ))}
            </div>

            {/* Footer */}
            <footer className="bg-background-secondary border-t border-border py-10">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="inline-block p-6 rounded-2xl bg-background border border-border">
                        <p className="text-foreground-secondary mb-2">
                            مبني على إطار عمل <span className="font-bold text-foreground">CASEL</span> للتعلم الاجتماعي والعاطفي
                        </p>
                        <p className="text-sm text-foreground-secondary/70">
                            Collaborative for Academic, Social, and Emotional Learning
                        </p>
                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-foreground-secondary">
                                📍 {PROGRAM_INFO.location}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}

// Stat component for hero section
function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <span className="text-xl">{icon}</span>
            <div className="text-right">
                <div className="font-bold text-lg">{value}</div>
                <div className="text-xs text-white/70">{label}</div>
            </div>
        </div>
    );
}

// Unit Section component
function UnitSection({
    unit,
    isExpanded,
    onToggle,
    copiedWorkshop,
    onCopyPrompt,
}: {
    unit: Unit;
    isExpanded: boolean;
    onToggle: () => void;
    copiedWorkshop: number | null;
    onCopyPrompt: (workshop: Workshop) => void;
}) {
    return (
        <section id={`unit-${unit.number}`} className="scroll-mt-4">
            {/* Unit Header */}
            <button
                onClick={onToggle}
                className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${isExpanded
                    ? 'border-transparent shadow-lg'
                    : 'border-border hover:border-border-hover bg-background-secondary'
                    }`}
                style={{
                    background: isExpanded
                        ? `linear-gradient(135deg, ${unit.color}15, ${unit.color}05)`
                        : undefined,
                    borderColor: isExpanded ? unit.color : undefined,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Unit number badge */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                            style={{ backgroundColor: unit.color }}
                        >
                            {unit.number}
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">{unit.icon}</span>
                                <h2 className="text-xl font-bold text-foreground">
                                    {unit.titleAr}
                                </h2>
                                <span className="text-foreground-secondary font-normal">
                                    {unit.titleEn}
                                </span>
                            </div>
                            <p className="text-sm text-foreground-secondary">
                                {unit.descriptionAr} • {unit.weekRange} • {unit.workshops.length} ورش
                            </p>
                        </div>
                    </div>

                    {/* Expand/Collapse indicator */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-background-tertiary">
                            <span className="text-sm text-foreground-secondary">{unit.workshops.length} ورشة</span>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-foreground-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 rounded-full bg-background overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: isExpanded ? '100%' : '0%',
                            backgroundColor: unit.color,
                        }}
                    />
                </div>
            </button>

            {/* Workshops grid */}
            <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                    {unit.workshops.map((workshop) => (
                        <WorkshopCard
                            key={workshop.number}
                            workshop={workshop}
                            unitColor={unit.color}
                            isCopied={copiedWorkshop === workshop.number}
                            onCopy={() => onCopyPrompt(workshop)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Workshop Card component
function WorkshopCard({
    workshop,
    unitColor,
    isCopied,
    onCopy,
}: {
    workshop: Workshop;
    unitColor: string;
    isCopied: boolean;
    onCopy: () => void;
}) {
    return (
        <button
            onClick={onCopy}
            className="group relative p-5 rounded-2xl border-2 text-right transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-background-secondary"
            style={{
                borderColor: isCopied ? workshop.color : 'var(--border)',
                backgroundColor: isCopied ? `${workshop.color}15` : undefined,
            }}
        >
            {/* Workshop Number Badge */}
            <div
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: workshop.color }}
            >
                {workshop.number}
            </div>

            {/* Icon */}
            <div className="text-3xl mb-3">
                {workshop.icon}
            </div>

            {/* Title */}
            <h3 className="font-bold text-foreground mb-1 leading-tight">
                {workshop.titleAr}
            </h3>
            <p className="text-xs text-foreground-secondary mb-2">
                {workshop.titleEn}
            </p>

            {/* Subtitle */}
            <p className="text-sm text-foreground-secondary mb-3 line-clamp-2">
                {workshop.subtitleAr}
            </p>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-1.5">
                {workshop.keySkills.slice(0, 2).map((skill, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-0.5 text-xs rounded-full bg-background-tertiary text-foreground-secondary"
                    >
                        {skill}
                    </span>
                ))}
            </div>

            {/* Copy Indicator Overlay */}
            <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity duration-200 ${isCopied ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundColor: `${workshop.color}ee` }}
            >
                <div className="text-white text-center">
                    <div className="text-3xl mb-1">✓</div>
                    <div className="text-sm font-medium">تم النسخ!</div>
                    <div className="text-xs mt-1 opacity-80">الصقه في ChatGPT</div>
                </div>
            </div>

            {/* Hover hint */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-foreground-secondary/60 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    نسخ
                </span>
            </div>
        </button>
    );
}
