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
            await navigator.clipboard.writeText(workshop.prompt);
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
                    {/* Back button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        العودة للرئيسية
                    </Link>

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

            {/* Instructions & Workflow */}
            <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-y border-accent/20 py-6">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        {/* Step 1 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">1</div>
                            <div className="text-right">
                                <p className="font-bold text-foreground">انقر على أي ورشة</p>
                                <p className="text-xs text-foreground-secondary">لنسخ البرومبت</p>
                            </div>
                        </div>

                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent hidden md:block rotate-180">
                            <path d="m15 18-6-6 6-6" />
                        </svg>

                        {/* Step 2 */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">2</div>
                            <div className="text-right">
                                <p className="font-bold text-foreground">الصقه في ChatGPT</p>
                                <p className="text-xs text-foreground-secondary">لتوليد خطة JSON</p>
                            </div>
                        </div>

                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent hidden md:block rotate-180">
                            <path d="m15 18-6-6 6-6" />
                        </svg>

                        {/* Step 3 */}
                        <Link
                            href="/import"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-700">استيراد JSON هنا</p>
                                <p className="text-xs text-emerald-600">لعرض الخطة وتصديرها PDF</p>
                            </div>
                            <span className="text-emerald-500 text-xl">→</span>
                        </Link>
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
