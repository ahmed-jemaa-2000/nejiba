"use client";

import { useState, useCallback } from "react";
import { Button, Card, useToast } from "@/components/ui";

interface Scene {
    sceneNumber: number;
    title: string;
    titleAr: string;
    imagePrompt: string;
    videoPrompt: string;
    duration: number;
}

interface AdPrompts {
    workshopTitle: string;
    workshopTitleEn: string;
    characterName: string;
    totalDuration: string;
    scenes: Scene[];
    summary: string;
    enhanced?: boolean;
}

export default function AdPromptsPage() {
    const [jsonInput, setJsonInput] = useState("");
    const [prompts, setPrompts] = useState<AdPrompts | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [enhance, setEnhance] = useState(false);
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
                body: JSON.stringify({ workshop, enhance })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate prompts");
            }

            const data = await response.json();
            setPrompts(data);
            setActiveScene(1);
            showToast("تم توليد 4 مشاهد بنجاح! ✨", "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "حدث خطأ";
            showToast(message, "error");
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput, enhance, showToast]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`تم نسخ ${label} ✓`, "success");
    }, [showToast]);

    const copyAllPrompts = useCallback(() => {
        if (!prompts) return;

        let allText = `# ${prompts.workshopTitle}\n${prompts.summary}\n\n`;

        prompts.scenes.forEach(scene => {
            allText += `\n${"=".repeat(50)}\n`;
            allText += `# المشهد ${scene.sceneNumber}: ${scene.titleAr}\n`;
            allText += `${"=".repeat(50)}\n\n`;
            allText += `## 🖼️ IMAGE PROMPT (nanobanana)\n\n${scene.imagePrompt}\n\n`;
            allText += `## 🎬 VIDEO PROMPT (Veo 3)\n\n${scene.videoPrompt}\n\n`;
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

    const activeSceneData = prompts?.scenes.find(s => s.sceneNumber === activeScene);

    return (
        <main className="min-h-screen bg-background py-8" dir="rtl">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        🎬 مولد إعلانات الورشة
                    </h1>
                    <p className="text-foreground-secondary">
                        4 مشاهد × 15 ثانية = 60 ثانية فيديو إعلاني مع نور!
                    </p>
                </div>

                {/* Character + Scenes Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card variant="bordered" padding="md" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">👧🏻</div>
                            <div>
                                <h3 className="font-bold text-lg text-purple-800">نور (Noor)</h3>
                                <p className="text-purple-600 text-sm">
                                    بطلة الإعلان - بأسلوب بيكسار 3D
                                </p>
                            </div>
                        </div>
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

                    <div className="flex items-center gap-4 mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enhance}
                                onChange={(e) => setEnhance(e.target.checked)}
                                className="w-4 h-4 accent-accent"
                            />
                            <span className="text-sm text-foreground-secondary">
                                تحسين بالذكاء الاصطناعي
                            </span>
                        </label>
                    </div>

                    <Button
                        variant="gradient"
                        onClick={handleGenerate}
                        loading={isLoading}
                        className="w-full mt-4"
                    >
                        {isLoading ? "جاري توليد 4 مشاهد..." : "✨ توليد 4 مشاهد"}
                    </Button>
                </Card>

                {/* Results */}
                {prompts && (
                    <div className="space-y-6">
                        {/* Summary Header */}
                        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="font-bold text-xl text-indigo-800">{prompts.workshopTitle}</h3>
                                    <p className="text-sm text-indigo-600">{prompts.totalDuration}</p>
                                </div>
                                <Button variant="primary" onClick={copyAllPrompts}>
                                    📋 نسخ الكل
                                </Button>
                            </div>
                        </Card>

                        {/* Scene Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {prompts.scenes.map(scene => (
                                <button
                                    key={scene.sceneNumber}
                                    onClick={() => setActiveScene(scene.sceneNumber)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeScene === scene.sceneNumber
                                            ? 'bg-accent text-white shadow-lg scale-105'
                                            : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                                        }`}
                                >
                                    {scene.sceneNumber === 1 && '1️⃣'}
                                    {scene.sceneNumber === 2 && '2️⃣'}
                                    {scene.sceneNumber === 3 && '3️⃣'}
                                    {scene.sceneNumber === 4 && '4️⃣'}
                                    {' '}{scene.titleAr}
                                </button>
                            ))}
                        </div>

                        {/* Active Scene Content */}
                        {activeSceneData && (
                            <div className="space-y-4">
                                {/* Scene Header */}
                                <div className="text-center py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                                    <p className="text-sm text-purple-600">المشهد {activeSceneData.sceneNumber} من 4</p>
                                    <h2 className="text-2xl font-bold text-purple-800">
                                        {activeSceneData.titleAr}
                                    </h2>
                                    <p className="text-purple-600">{activeSceneData.title} · 15 ثانية</p>
                                </div>

                                {/* Image Prompt */}
                                <Card variant="bordered" padding="lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            🖼️ بروبمت الصورة (nanobanana)
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
                                            🎬 بروبمت الفيديو (Veo 3)
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
                                        onClick={() => setActiveScene(Math.min(4, activeScene + 1))}
                                        disabled={activeScene === 4}
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
                                <li><strong>1.</strong> أنشئ 4 صور بـ nanobanana (صورة لكل مشهد)</li>
                                <li><strong>2.</strong> ارفع كل صورة إلى Veo 3 مع بروبمت الفيديو المناسب</li>
                                <li><strong>3.</strong> ادمج الـ 4 مقاطع (15 ثانية لكل مقطع)</li>
                                <li><strong>4.</strong> أضف موسيقى خلفية مناسبة للأطفال</li>
                                <li><strong>5.</strong> النتيجة: فيديو إعلاني 60 ثانية مع نور! 🎉</li>
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
