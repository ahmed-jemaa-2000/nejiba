"use client";

import { useState, useCallback } from "react";
import { Button, Card, useToast } from "@/components/ui";

interface VideoScene {
    sceneNumber: number;
    sceneType: 'welcome' | 'theme' | 'activity' | 'learning' | 'goodbye';
    title: string;
    titleAr: string;
    description: string;
    imagePrompt: string;
    videoPrompt: string;
    arabicScript: string;
    duration: number;
}

interface VideoScript {
    workshopTitle: string;
    workshopTitleEn: string;
    presenter: string;
    location: string;
    totalScenes: number;
    totalDuration: string;
    scenes: VideoScene[];
    summary: string;
    enhanced?: boolean;
}

export default function AdPromptsPage() {
    const [jsonInput, setJsonInput] = useState("");
    const [prompts, setPrompts] = useState<VideoScript | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [enhance, setEnhance] = useState(false);
    const [includeCharacter, setIncludeCharacter] = useState(true);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [activeScene, setActiveScene] = useState(1);
    const { showToast } = useToast();

    const handleGenerate = useCallback(async () => {
        if (!jsonInput.trim()) {
            showToast("الرجاء إدخال JSON الورشة", "error");
            return;
        }

        setIsLoading(true);
        try {
            const workshop = JSON.parse(jsonInput);

            const response = await fetch("/api/ai/generate-ad-prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workshop,
                    enhance,
                    includeCharacter,
                    hasReferenceImage: !!referenceImage
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate prompts");
            }

            const data = await response.json();
            setPrompts(data);
            setActiveScene(1);
            const sceneCount = data.totalScenes || data.scenes?.length || 0;
            const charMsg = includeCharacter ? (referenceImage ? "مع صورة نور المرجعية!" : "مع نور!") : "بدون شخصية";
            showToast(`تم توليد ${sceneCount} مشاهد بنجاح ${charMsg} ✨`, "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "حدث خطأ";
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput, enhance, includeCharacter, referenceImage, showToast]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`تم نسخ ${label} ✓`, "success");
    }, [showToast]);

    const copyAllPrompts = useCallback(() => {
        if (!prompts) return;

        let allText = `# ${prompts.workshopTitle}\n${prompts.summary}\n\n`;
        allText += `🎭 المقدم: ${prompts.presenter}\n`;
        allText += `📍 المكان: ${prompts.location}\n`;
        allText += `⏱️ المدة: ${prompts.totalDuration}\n\n`;

        prompts.scenes.forEach((scene: VideoScene) => {
            allText += `\n${"=".repeat(60)}\n`;
            allText += `# المشهد ${scene.sceneNumber}: ${scene.titleAr} (${scene.sceneType})\n`;
            allText += `${"=".repeat(60)}\n\n`;
            allText += `## 📝 ما ستقوله نور:\n"${scene.arabicScript}"\n\n`;
            allText += `## 🖼️ IMAGE PROMPT (Nanobanana)\n\n${scene.imagePrompt}\n\n`;
            allText += `## 🎬 VIDEO PROMPT (Sora 2)\n\n${scene.videoPrompt}\n\n`;
        });

        navigator.clipboard.writeText(allText);
        showToast("تم نسخ جميع البرومبتات ✓", "success");
    }, [prompts, showToast]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                const parsed = JSON.parse(content);
                setJsonInput(JSON.stringify(parsed, null, 2));
            } catch {
                setJsonInput(content);
            }
        };
        reader.readAsText(file);
    }, []);

    const handleReferenceImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast("الرجاء اختيار ملف صورة", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setReferenceImage(dataUrl);
            showToast("تم رفع صورة نور المرجعية ✓", "success");
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    const activeSceneData = prompts?.scenes.find((s: VideoScene) => s.sceneNumber === activeScene);

    return (
        <main className="min-h-screen bg-background py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        🎬 مولد فيديو الورشة
                    </h1>
                    <p className="text-foreground-secondary">
                        مشاهد متعددة × 15 ثانية = فيديو عرض الورشة {includeCharacter ? "مع نور!" : "للمواد والأنشطة"}
                    </p>
                </div>

                {/* Character + Scenes Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Character Toggle + Reference Image Card */}
                    <Card
                        variant="bordered"
                        padding="md"
                        className={`transition-all ${includeCharacter
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-3 cursor-pointer" onClick={() => setIncludeCharacter(!includeCharacter)}>
                            {referenceImage ? (
                                <img src={referenceImage} alt="Noor Reference" className="w-14 h-14 rounded-full object-cover border-2 border-purple-300" />
                            ) : (
                                <div className="text-5xl">{includeCharacter ? '👧🏻' : '🎨'}</div>
                            )}
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg ${includeCharacter ? 'text-purple-800' : 'text-gray-800'}`}>
                                    {includeCharacter ? 'نور (Noor)' : 'بدون شخصية'}
                                </h3>
                                <p className={`text-sm ${includeCharacter ? 'text-purple-600' : 'text-gray-600'}`}>
                                    {includeCharacter
                                        ? 'بطلة الإعلان - بأسلوب بيكسار 3D'
                                        : 'التركيز على المواد والأنشطة'}
                                </p>
                            </div>
                            <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${includeCharacter ? 'bg-purple-500 justify-end' : 'bg-gray-400 justify-start'
                                }`}>
                                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                            </div>
                        </div>

                        {/* Reference Image Upload */}
                        {includeCharacter && (
                            <div className="pt-3 border-t border-purple-200">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReferenceImageUpload}
                                        className="hidden"
                                    />
                                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                                        📷 {referenceImage ? 'تغيير صورة نور' : 'رفع صورة نور المرجعية'}
                                    </span>
                                    {referenceImage && (
                                        <span className="text-purple-600 text-xs">✓ تم الرفع</span>
                                    )}
                                </label>
                                <p className="text-xs text-purple-500 mt-1">
                                    ارفع صورة 3D لنور للحفاظ على نفس المظهر في كل المشاهد
                                </p>
                            </div>
                        )}
                    </Card>

                    <Card variant="bordered" padding="md" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2">المشاهد الأربعة:</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                            <div>1️⃣ الفضول (Opening)</div>
                            <div>2️⃣ الاكتشاف (Discovery)</div>
                            <div>3️⃣ الإبداع (Action)</div>
                            <div>4️⃣ الاحتفال (Celebration)</div>
                        </div>
                    </Card>
                </div>

                {/* Input Section */}
                <Card variant="bordered" padding="lg" className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        📥 أدخل JSON الورشة
                    </h2>

                    <div className="mb-4">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-foreground-secondary
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-accent file:text-white
                                hover:file:bg-accent/90"
                        />
                    </div>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='الصق JSON الورشة هنا أو ارفع ملف JSON...'
                        className="w-full h-40 p-4 rounded-lg border border-border bg-background-secondary text-foreground font-mono text-sm resize-y"
                        dir="ltr"
                    />

                    <div className="flex flex-col gap-3 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enhance}
                                onChange={(e) => setEnhance(e.target.checked)}
                                className="w-5 h-5 accent-amber-500 rounded"
                            />
                            <div>
                                <span className="text-sm font-bold text-amber-800">
                                    ✨ تحسين بالذكاء الاصطناعي (GPT-5)
                                </span>
                                <p className="text-xs text-amber-600">
                                    يضيف تفاصيل بصرية، إضاءة، وحركات كاميرا أكثر احترافية
                                </p>
                            </div>
                        </label>
                    </div>

                    <Button
                        variant="gradient"
                        onClick={handleGenerate}
                        loading={isLoading}
                        className="w-full mt-4"
                    >
                        {isLoading
                            ? (enhance ? "جاري التحسين بالذكاء الاصطناعي..." : "جاري توليد 4 مشاهد...")
                            : "✨ توليد 4 مشاهد"}
                    </Button>
                </Card>

                {/* Results */}
                {prompts && (
                    <div className="space-y-6">
                        {/* Summary Header */}
                        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-xl text-indigo-800">{prompts.workshopTitle}</h3>
                                        {prompts.enhanced && (
                                            <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                                                ✨ محسّن بـ AI
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-indigo-600">
                                        {prompts.totalDuration} • {prompts.presenter} • {prompts.location}
                                    </p>
                                </div>
                                <Button variant="primary" onClick={copyAllPrompts}>
                                    📋 نسخ الكل
                                </Button>
                            </div>
                        </Card>

                        {/* Scene Tabs - Dynamic */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {prompts.scenes.map((scene: VideoScene) => (
                                <button
                                    key={scene.sceneNumber}
                                    onClick={() => setActiveScene(scene.sceneNumber)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex flex-col items-center ${activeScene === scene.sceneNumber
                                        ? 'bg-accent text-white shadow-lg scale-105'
                                        : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                                        }`}
                                >
                                    <span className="text-lg">{scene.sceneNumber}</span>
                                    <span className="text-xs opacity-75">{scene.sceneType}</span>
                                </button>
                            ))}
                        </div>

                        {/* Active Scene Content */}
                        {activeSceneData && (
                            <div className="space-y-4">
                                {/* Scene Header */}
                                <div className="text-center py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                                    <p className="text-sm text-purple-600">المشهد {activeSceneData.sceneNumber} من {prompts.totalScenes}</p>
                                    <h2 className="text-2xl font-bold text-purple-800">
                                        {activeSceneData.titleAr}
                                    </h2>
                                    <p className="text-purple-600">{activeSceneData.title} ({activeSceneData.sceneType}) · 15 ثانية</p>
                                </div>

                                {/* Arabic Script - What Noor Says */}
                                <Card variant="bordered" padding="lg" className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                                            📝 ما ستقوله نور (للدبلجة)
                                        </h3>
                                        <Button
                                            variant="secondary"
                                            onClick={() => copyToClipboard(activeSceneData.arabicScript, `نص المشهد ${activeSceneData.sceneNumber}`)}
                                        >
                                            📋 نسخ
                                        </Button>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-4 text-lg font-medium text-emerald-900 border border-emerald-200">
                                        &quot;{activeSceneData.arabicScript}&quot;
                                    </div>
                                </Card>

                                {/* Image Prompt */}
                                <Card variant="bordered" padding="lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            🖼️ بروبمت الصورة (Nanobanana)
                                        </h3>
                                        <Button
                                            variant="secondary"
                                            onClick={() => copyToClipboard(activeSceneData.imagePrompt, `صورة المشهد ${activeSceneData.sceneNumber}`)}
                                        >
                                            📋 نسخ
                                        </Button>
                                    </div>
                                    <div className="bg-background-secondary rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-border max-h-64 overflow-y-auto" dir="ltr">
                                        {activeSceneData.imagePrompt}
                                    </div>
                                </Card>

                                {/* Video Prompt */}
                                <Card variant="bordered" padding="lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            🎬 بروبمت الفيديو (Sora 2)
                                        </h3>
                                        <Button
                                            variant="secondary"
                                            onClick={() => copyToClipboard(activeSceneData.videoPrompt, `فيديو المشهد ${activeSceneData.sceneNumber}`)}
                                        >
                                            📋 نسخ
                                        </Button>
                                    </div>
                                    <div className="bg-background-secondary rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-border max-h-80 overflow-y-auto" dir="ltr">
                                        {activeSceneData.videoPrompt}
                                    </div>
                                </Card>

                                {/* Navigation */}
                                <div className="flex justify-between">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setActiveScene(Math.max(1, activeScene - 1))}
                                        disabled={activeScene === 1}
                                    >
                                        ← المشهد السابق
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setActiveScene(Math.min(prompts.totalScenes, activeScene + 1))}
                                        disabled={activeScene === prompts.totalScenes}
                                    >
                                        المشهد التالي →
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <Card variant="bordered" padding="md" className="bg-amber-50 border-amber-200">
                            <h3 className="font-bold text-amber-800 mb-2">📌 خطوات الإنتاج</h3>
                            <ol className="space-y-2 text-amber-700 text-sm">
                                <li><strong>1.</strong> أنشئ صورة نور المرجعية أولاً (ستستخدم في كل المشاهد)</li>
                                <li><strong>2.</strong> أنشئ {prompts.totalScenes} صور بـ Nanobanana (صورة لكل مشهد)</li>
                                <li><strong>3.</strong> ارفع كل صورة إلى Sora 2 مع بروبمت الفيديو المناسب</li>
                                <li><strong>4.</strong> ادمج الـ {prompts.totalScenes} مقاطع (15 ثانية لكل مقطع)</li>
                                <li><strong>5.</strong> أضف صوت نور بناءً على نصوص &quot;ما ستقوله نور&quot;</li>
                                <li><strong>6.</strong> أضف موسيقى خلفية مناسبة للأطفال</li>
                                <li><strong>7.</strong> النتيجة: فيديو عرض الورشة مع نور! 🎉</li>
                            </ol>
                        </Card>
                    </div>
                )}

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <a href="/workshop" className="text-accent hover:underline">
                        ← العودة إلى صفحة الورش
                    </a>
                </div>
            </div>
        </main>
    );
}
