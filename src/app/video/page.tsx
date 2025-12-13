"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button, Card, useToast } from "@/components/ui";
import type { VideoScriptOutput, VideoScene, Character } from "@/lib/ai/prompts/amalVideoGenerator";
import type { WorkshopPlanData } from "@/lib/ai/providers/base";

export default function VideoPage() {
    const [workshopTitle, setWorkshopTitle] = useState("");
    const [ageGroup, setAgeGroup] = useState("10-15 سنة");
    const [duration, setDuration] = useState("90 دقيقة");
    const [activities, setActivities] = useState("");
    const [hasReferenceImage, setHasReferenceImage] = useState(true);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

    // New: AI Enhancement
    const [enhanceWithAI, setEnhanceWithAI] = useState(true);

    // New: JSON Import
    const [jsonInput, setJsonInput] = useState("");
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [importedWorkshop, setImportedWorkshop] = useState<WorkshopPlanData | null>(null);

    const [videoScript, setVideoScript] = useState<VideoScriptOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedScene, setCopiedScene] = useState<number | null>(null);

    const { showToast } = useToast();

    // Handle JSON import
    const handleJsonImport = useCallback(() => {
        if (!jsonInput.trim()) {
            showToast("الرجاء إدخال JSON أولاً", "error");
            return;
        }

        try {
            const parsed = JSON.parse(jsonInput);
            setImportedWorkshop(parsed);

            // Auto-fill form from imported workshop
            if (parsed.title?.ar) {
                setWorkshopTitle(parsed.title.ar);
            }
            if (parsed.generalInfo?.ageGroup) {
                setAgeGroup(parsed.generalInfo.ageGroup);
            }
            if (parsed.generalInfo?.duration) {
                setDuration(parsed.generalInfo.duration);
            }

            // Extract activities from timeline
            const timelineActivities = (parsed.timeline || [])
                .filter((act: any) => {
                    const type = String(act.activityType || act.blockType || '').toLowerCase();
                    return !type.includes('intro') && !type.includes('closing') && !type.includes('opener');
                })
                .slice(0, 4)
                .map((act: any) => act.title);

            if (timelineActivities.length > 0) {
                setActivities(timelineActivities.join("\n"));
            }

            setShowJsonImport(false);
            showToast("تم استيراد الورشة بنجاح! ✅", "success");
        } catch (e) {
            showToast("خطأ في JSON - تأكد من الصيغة", "error");
        }
    }, [jsonInput, showToast]);

    const handleGenerate = useCallback(async () => {
        if (!workshopTitle.trim()) {
            showToast("الرجاء إدخال اسم الورشة", "error");
            return;
        }

        if (!activities.trim()) {
            showToast("الرجاء إدخال الأنشطة", "error");
            return;
        }

        setIsGenerating(true);
        try {
            const activityList = activities.split("\n").filter(a => a.trim());

            const response = await fetch("/api/ai/workshop-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // If we have imported workshop, send it for AI enhancement
                    workshop: importedWorkshop,
                    workshopInput: {
                        titleAr: workshopTitle,
                        ageGroup,
                        duration,
                        activities: activityList,
                    },
                    characterId: "amal",
                    hasReferenceImage,
                    enhance: enhanceWithAI,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate video");
            }

            const data = await response.json();
            setVideoScript(data);
            showToast(`تم توليد ${data.scenes.length} مشاهد بنجاح! ✨`, "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "حدث خطأ";
            showToast(message, "error");
        } finally {
            setIsGenerating(false);
        }
    }, [workshopTitle, ageGroup, duration, activities, hasReferenceImage, enhanceWithAI, importedWorkshop, showToast]);

    const copyPrompt = useCallback((scene: VideoScene, type: 'veo' | 'arabic') => {
        const text = type === 'veo' ? scene.veoPrompt : scene.arabicScript;
        navigator.clipboard.writeText(text);
        setCopiedScene(scene.sceneNumber);
        showToast(`تم نسخ ${type === 'veo' ? 'Veo 2 Prompt' : 'النص العربي'} ✓`, "success");
        setTimeout(() => setCopiedScene(null), 2000);
    }, [showToast]);

    const copyAllPrompts = useCallback(() => {
        if (!videoScript) return;

        let allText = `# فيديو ورشة: ${videoScript.workshopTitle} \n`;
        allText += `الشخصية: ${videoScript.character.nameAr} \n`;
        allText += `الموقع: ${videoScript.location} \n`;
        allText += `المدة: ${videoScript.totalDuration} \n\n`;

        videoScript.scenes.forEach((scene) => {
            allText += `${"=".repeat(60)} \n`;
            allText += `# المشهد ${scene.sceneNumber}: ${scene.titleAr} (${scene.titleEn}) \n`;
            allText += `${"=".repeat(60)} \n\n`;
            allText += `## 🎤 النص العربي: \n"${scene.arabicScript}"\n\n`;
            allText += `## 🎬 VEO 2 PROMPT: \n${scene.veoPrompt} \n\n`;
        });

        navigator.clipboard.writeText(allText);
        showToast("تم نسخ جميع المشاهد ✓", "success");
    }, [videoScript, showToast]);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setReferenceImage(e.target?.result as string);
            setHasReferenceImage(true);
            showToast("تم رفع صورة أمل المرجعية ✓", "success");
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    return (
        <main className="min-h-screen bg-background py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-sm text-foreground-secondary hover:text-foreground mb-4 inline-flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        العودة للرئيسية
                    </Link>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <span>🎬</span>
                        مولد فيديو ورشة العمل
                    </h1>
                    <p className="text-foreground-secondary">
                        أنشئ 4 مشاهد (60 ثانية) لـ Veo 2 مع أمل
                    </p>
                </div>

                {/* Character Card */}
                <Card variant="bordered" padding="md" className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <div className="flex items-center gap-4">
                        {referenceImage ? (
                            <img
                                src={referenceImage}
                                alt="أمل"
                                className="w-20 h-20 rounded-full object-cover border-4 border-purple-300 shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center text-4xl border-4 border-purple-300">
                                👧🏻
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-purple-800">أمل (Amal)</h3>
                            <p className="text-sm text-purple-600">8 سنوات • مقدمة نادي الأطفال</p>
                            <p className="text-xs text-purple-500 mt-1">دار الثقافة بن عروس</p>
                        </div>
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <span className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-sm font-medium">
                                📷 {referenceImage ? 'تغيير الصورة' : 'رفع صورة أمل'}
                            </span>
                        </label>
                    </div>
                </Card>

                {/* JSON Import Section */}
                <Card variant="bordered" padding="md" className="mb-6 border-dashed border-2">
                    <button
                        onClick={() => setShowJsonImport(!showJsonImport)}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📥</span>
                            <div className="text-right">
                                <h3 className="font-bold text-foreground">استيراد من JSON</h3>
                                <p className="text-xs text-foreground-secondary">الصق JSON من ChatGPT لملء البيانات تلقائياً</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {importedWorkshop && (
                                <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg">✅ تم الاستيراد</span>
                            )}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20" height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`transition-transform ${showJsonImport ? 'rotate-180' : ''}`}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>
                    </button>

                    {showJsonImport && (
                        <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder='الصق JSON هنا مباشرة من ChatGPT...'
                                rows={6}
                                className="w-full p-3 font-mono text-sm bg-gray-900 text-green-400 border border-gray-700 rounded-xl focus:border-accent"
                                dir="ltr"
                            />
                            <div className="flex gap-3">
                                <Button variant="primary" onClick={handleJsonImport}>
                                    ✅ استيراد وملء البيانات
                                </Button>
                                <Link href="/program" className="px-4 py-2 text-sm text-accent hover:underline">
                                    🎓 الحصول على JSON من برنامج CASEL
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Input Form */}
                <Card variant="bordered" padding="lg" className="mb-6">
                    {/* AI Enhancement Toggle */}
                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h4 className="font-bold text-blue-800">تحسين بالذكاء الاصطناعي</h4>
                                <p className="text-xs text-blue-600">OpenAI سيحسّن البرومبتات والنصوص</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enhanceWithAI}
                                onChange={(e) => setEnhanceWithAI(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-4">معلومات الورشة</h2>

                    <div className="space-y-4">
                        {/* Workshop Title */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                اسم الورشة *
                            </label>
                            <input
                                type="text"
                                value={workshopTitle}
                                onChange={(e) => setWorkshopTitle(e.target.value)}
                                placeholder="مثال: ورشة الثقة بالنفس"
                                className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        {/* Age & Duration */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    الفئة العمرية
                                </label>
                                <select
                                    value={ageGroup}
                                    onChange={(e) => setAgeGroup(e.target.value)}
                                    className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent"
                                >
                                    <option value="6-8 سنة">6-8 سنة</option>
                                    <option value="8-10 سنة">8-10 سنة</option>
                                    <option value="10-12 سنة">10-12 سنة</option>
                                    <option value="10-15 سنة">10-15 سنة</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    مدة الورشة
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent"
                                >
                                    <option value="45 دقيقة">45 دقيقة</option>
                                    <option value="60 دقيقة">60 دقيقة</option>
                                    <option value="90 دقيقة">90 دقيقة</option>
                                </select>
                            </div>
                        </div>

                        {/* Activities */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                الأنشطة الرئيسية * (سطر لكل نشاط)
                            </label>
                            <textarea
                                value={activities}
                                onChange={(e) => setActivities(e.target.value)}
                                placeholder="نشاط التعارف&#10;لعبة بناء الثقة&#10;تمارين التواصل"
                                rows={4}
                                className="w-full p-3 bg-background-secondary border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent resize-y"
                            />
                        </div>

                        {/* Reference Image Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasReferenceImage}
                                onChange={(e) => setHasReferenceImage(e.target.checked)}
                                className="w-5 h-5 accent-purple-500 rounded"
                            />
                            <span className="text-sm text-foreground">
                                سأستخدم صورة مرجعية لأمل في Veo 2
                            </span>
                        </label>
                    </div>

                    <Button
                        variant="gradient"
                        size="lg"
                        fullWidth
                        onClick={handleGenerate}
                        loading={isGenerating}
                        className="mt-6"
                    >
                        ✨ توليد 4 مشاهد لـ Veo 2
                    </Button>
                </Card>

                {/* Results */}
                {videoScript && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-emerald-800">{videoScript.workshopTitle}</h3>
                                    <p className="text-sm text-emerald-600">
                                        {videoScript.character.nameAr} • {videoScript.location} • {videoScript.totalDuration}
                                    </p>
                                </div>
                                <Button variant="primary" onClick={copyAllPrompts}>
                                    📋 نسخ جميع المشاهد
                                </Button>
                            </div>
                        </Card>

                        {/* Scenes */}
                        {videoScript.scenes.map((scene) => (
                            <SceneCard
                                key={scene.sceneNumber}
                                scene={scene}
                                isCopied={copiedScene === scene.sceneNumber}
                                onCopyVeo={() => copyPrompt(scene, 'veo')}
                                onCopyArabic={() => copyPrompt(scene, 'arabic')}
                            />
                        ))}

                        {/* Instructions */}
                        <Card variant="bordered" padding="md" className="bg-amber-50 border-amber-200">
                            <h3 className="font-bold text-amber-800 mb-3">📌 خطوات الإنتاج</h3>
                            <ol className="space-y-2 text-amber-700 text-sm">
                                <li><strong>1.</strong> أنشئ صورة أمل المرجعية أولاً (إذا لم تكن موجودة)</li>
                                <li><strong>2.</strong> لكل مشهد: انسخ الـ Veo 2 Prompt</li>
                                <li><strong>3.</strong> في Veo 2: ارفع صورة أمل المرجعية + الصق البرومبت</li>
                                <li><strong>4.</strong> ولّد فيديو 15 ثانية لكل مشهد</li>
                                <li><strong>5.</strong> ادمج المشاهد الأربعة في فيديو واحد</li>
                                <li><strong>6.</strong> أضف صوت أمل باستخدام النصوص العربية</li>
                                <li><strong>7.</strong> أضف موسيقى خلفية مناسبة للأطفال</li>
                            </ol>
                        </Card>
                    </div>
                )}

                {/* Quick Links */}
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <Link
                        href="/program"
                        className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
                    >
                        🎓 برنامج CASEL
                    </Link>
                    <Link
                        href="/import"
                        className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
                    >
                        📥 استيراد JSON
                    </Link>
                </div>
            </div>
        </main>
    );
}

// Scene Card Component
function SceneCard({
    scene,
    isCopied,
    onCopyVeo,
    onCopyArabic,
}: {
    scene: VideoScene;
    isCopied: boolean;
    onCopyVeo: () => void;
    onCopyArabic: () => void;
}) {
    const [showVeoPrompt, setShowVeoPrompt] = useState(false);

    const sceneColors: Record<string, string> = {
        welcome: "from-blue-50 to-cyan-50 border-blue-200",
        theme: "from-purple-50 to-pink-50 border-purple-200",
        activities: "from-orange-50 to-amber-50 border-orange-200",
        invitation: "from-green-50 to-emerald-50 border-green-200",
    };

    return (
        <Card
            variant="bordered"
            padding="md"
            className={`bg - gradient - to - r ${sceneColors[scene.sceneType] || 'border-border'} ${isCopied ? 'ring-2 ring-accent' : ''} `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center font-bold text-lg">
                        {scene.sceneNumber}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">{scene.titleAr}</h4>
                        <p className="text-xs text-foreground-secondary">{scene.titleEn} • {scene.duration} ثانية</p>
                    </div>
                </div>
                {isCopied && (
                    <span className="text-sm text-accent font-medium">✓ تم النسخ!</span>
                )}
            </div>

            {/* Arabic Script */}
            <div className="mb-4 p-4 bg-white/60 rounded-xl border border-white">
                <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-bold text-foreground">🎤 النص العربي (Voiceover)</h5>
                    <Button variant="secondary" size="sm" onClick={onCopyArabic}>
                        📋 نسخ
                    </Button>
                </div>
                <p className="text-foreground leading-relaxed">"{scene.arabicScript}"</p>
            </div>

            {/* Veo Prompt Toggle */}
            <button
                onClick={() => setShowVeoPrompt(!showVeoPrompt)}
                className="w-full flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors"
            >
                <span className="font-medium text-foreground">🎬 Veo 2 Prompt</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition - transform ${showVeoPrompt ? 'rotate-180' : ''} `}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {showVeoPrompt && (
                <div className="mt-3 animate-in fade-in duration-200">
                    <div className="flex justify-end mb-2">
                        <Button variant="primary" size="sm" onClick={onCopyVeo}>
                            📋 نسخ Veo 2 Prompt
                        </Button>
                    </div>
                    <pre
                        dir="ltr"
                        className="text-xs bg-gray-900 text-green-400 p-4 rounded-xl overflow-auto max-h-64 font-mono whitespace-pre-wrap"
                    >
                        {scene.veoPrompt}
                    </pre>
                </div>
            )}
        </Card>
    );
}
