"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button, Card, useToast } from "@/components/ui";
import { ImageSelector } from "@/components/video/ImageSelector";
import {
    COMPETENCIES,
    TOPIC_LIBRARY,
    type CompetencyType,
    type AdviceVideoOutput,
    type AdviceVideoScene,
    type AdviceTopic
} from "@/lib/ai/prompts/socialAdviceGenerator";

// Video generation status per scene
interface SceneVideoStatus {
    status: "idle" | "generating" | "completed" | "failed";
    uuid?: string;
    progress?: number;
    videoUrl?: string;
    errorMessage?: string;
}

// Generated image option
interface GeneratedImageOption {
    url: string;
    uuid: string;
    thumbnailUrl?: string;
}

export default function SocialAdvicePage() {
    const { showToast } = useToast();

    // Form state
    const [selectedCompetency, setSelectedCompetency] = useState<CompetencyType>('self-awareness');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');
    const [customTopic, setCustomTopic] = useState('');
    const [useCustomTopic, setUseCustomTopic] = useState(false);
    const [enhanceWithAI, setEnhanceWithAI] = useState(true);

    // Amal reference image
    const [hasReferenceImage, setHasReferenceImage] = useState(true);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

    // Generated output
    const [adviceOutput, setAdviceOutput] = useState<AdviceVideoOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Per-scene generated images
    const [sceneGeneratedImages, setSceneGeneratedImages] = useState<Record<number, GeneratedImageOption[]>>({});
    const [sceneSelectedImageIndex, setSceneSelectedImageIndex] = useState<Record<number, number>>({});
    const [imageGeneratingScenes, setImageGeneratingScenes] = useState<Set<number>>(new Set());

    // Per-scene reference URLs (for video generation)
    const [sceneReferenceUrls, setSceneReferenceUrls] = useState<Record<number, string>>({});

    // Per-scene video generation status
    const [sceneVideoStatus, setSceneVideoStatus] = useState<Record<number, SceneVideoStatus>>({});

    // Copied scene tracking
    const [copiedScene, setCopiedScene] = useState<number | null>(null);

    // Get topics for selected competency
    const availableTopics = TOPIC_LIBRARY[selectedCompetency] || [];

    // Handle reference image upload
    const handleReferenceImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setReferenceImage(e.target?.result as string);
                setHasReferenceImage(true);
                showToast("تم رفع صورة أمل المرجعية ✓", "success");
            };
            reader.readAsDataURL(file);
        }
    }, [showToast]);

    // Generate the advice video
    const handleGenerate = useCallback(async () => {
        const topicId = useCustomTopic ? 'custom' : selectedTopicId;

        if (!topicId && !customTopic) {
            showToast("الرجاء اختيار موضوع أو كتابة موضوع مخصص", "error");
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch("/api/ai/social-advice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    competency: selectedCompetency,
                    topicId: useCustomTopic ? 'custom' : selectedTopicId,
                    customTopic: useCustomTopic ? customTopic : undefined,
                    enhance: enhanceWithAI
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "فشل التوليد");
            }

            setAdviceOutput(data);
            showToast(`تم توليد ${data.sceneCount} مشاهد بنجاح! ✨`, "success");

        } catch (error) {
            const message = error instanceof Error ? error.message : "حدث خطأ";
            showToast(message, "error");
        } finally {
            setIsGenerating(false);
        }
    }, [selectedCompetency, selectedTopicId, customTopic, useCustomTopic, enhanceWithAI, showToast]);

    // Generate 3 AI images for a scene
    const generateSceneImages = useCallback(async (sceneNumber: number, imagePrompt: string) => {
        setImageGeneratingScenes(prev => new Set(prev).add(sceneNumber));

        try {
            const response = await fetch("/api/ai/generate-scene-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imagePrompt,
                    sceneNumber,
                    count: 3,
                    aspectRatio: "9:16" // Vertical for social media
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "فشل توليد الصور");
            }

            setSceneGeneratedImages(prev => ({
                ...prev,
                [sceneNumber]: data.images
            }));

            setSceneSelectedImageIndex(prev => ({
                ...prev,
                [sceneNumber]: -1
            }));

            showToast(`تم توليد 3 صور للمشهد ${sceneNumber} ✨`, "success");

        } catch (error) {
            const message = error instanceof Error ? error.message : "خطأ غير معروف";
            showToast(`فشل توليد الصور: ${message}`, "error");
        } finally {
            setImageGeneratingScenes(prev => {
                const next = new Set(prev);
                next.delete(sceneNumber);
                return next;
            });
        }
    }, [showToast]);

    // Handle image selection
    const handleSelectImage = useCallback((sceneNumber: number, index: number) => {
        setSceneSelectedImageIndex(prev => ({
            ...prev,
            [sceneNumber]: index
        }));

        const images = sceneGeneratedImages[sceneNumber];
        if (images && images[index]) {
            setSceneReferenceUrls(prev => ({
                ...prev,
                [sceneNumber]: images[index].url
            }));
        }
    }, [sceneGeneratedImages]);

    // Generate video for a scene
    const generateSceneVideo = useCallback(async (scene: AdviceVideoScene) => {
        setSceneVideoStatus(prev => ({
            ...prev,
            [scene.sceneNumber]: { status: "generating", progress: 0 }
        }));

        try {
            const referenceUrl = sceneReferenceUrls[scene.sceneNumber] || "";

            if (!referenceUrl) {
                throw new Error("الرجاء اختيار صورة مرجعية أولاً");
            }

            const response = await fetch("/api/video/veo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: scene.animationPrompt,
                    referenceImageUrl: referenceUrl,
                    aspectRatio: "9:16" // Vertical for social media
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "فشل بدء توليد الفيديو");
            }

            const data = await response.json();
            const uuid = data.uuid;

            setSceneVideoStatus(prev => ({
                ...prev,
                [scene.sceneNumber]: {
                    status: "generating",
                    uuid,
                    progress: 10
                }
            }));

            showToast(`بدأ توليد فيديو المشهد ${scene.sceneNumber}... 🎬`, "success");
            pollVideoStatus(scene.sceneNumber, uuid);

        } catch (error) {
            const message = error instanceof Error ? error.message : "خطأ غير معروف";
            setSceneVideoStatus(prev => ({
                ...prev,
                [scene.sceneNumber]: {
                    status: "failed",
                    errorMessage: message
                }
            }));
            showToast(`فشل توليد الفيديو: ${message}`, "error");
        }
    }, [sceneReferenceUrls, showToast]);

    // Poll video generation status
    const pollVideoStatus = useCallback(async (sceneNumber: number, uuid: string) => {
        const statusEndpoint = `/api/video/veo/status?uuid=${uuid}`;
        const maxAttempts = 60;
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const response = await fetch(statusEndpoint);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("فشل التحقق من الحالة");
                }

                const statusData = data.data;

                if (statusData.status === "completed" && statusData.videoUrl) {
                    setSceneVideoStatus(prev => ({
                        ...prev,
                        [sceneNumber]: {
                            status: "completed",
                            uuid,
                            progress: 100,
                            videoUrl: statusData.videoUrl
                        }
                    }));
                    showToast(`اكتمل فيديو المشهد ${sceneNumber}! 🎉`, "success");
                    return;
                }

                if (statusData.status === "failed") {
                    setSceneVideoStatus(prev => ({
                        ...prev,
                        [sceneNumber]: {
                            status: "failed",
                            uuid,
                            errorMessage: statusData.error || "فشل التوليد"
                        }
                    }));
                    showToast(`فشل توليد المشهد ${sceneNumber}`, "error");
                    return;
                }

                const estimatedProgress = Math.min(10 + (attempts * 3), 90);
                setSceneVideoStatus(prev => ({
                    ...prev,
                    [sceneNumber]: {
                        status: "generating",
                        uuid,
                        progress: estimatedProgress
                    }
                }));

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 30000);
                } else {
                    showToast(`انتهت مهلة توليد المشهد ${sceneNumber}`, "error");
                }

            } catch (error) {
                console.error("Status check error:", error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 30000);
                }
            }
        };

        checkStatus();
    }, [showToast]);

    // Copy prompt
    const copyPrompt = useCallback((scene: AdviceVideoScene, type: 'veo' | 'arabic' | 'image') => {
        const text = type === 'veo' ? scene.animationPrompt
            : type === 'arabic' ? scene.arabicScript
                : scene.imagePrompt;
        navigator.clipboard.writeText(text);
        setCopiedScene(scene.sceneNumber);
        const labels = { veo: 'Video Prompt', arabic: 'النص العربي', image: 'Image Prompt' };
        showToast(`تم نسخ ${labels[type]} ✓`, "success");
        setTimeout(() => setCopiedScene(null), 2000);
    }, [showToast]);

    // Copy all prompts
    const copyAllPrompts = useCallback(() => {
        if (!adviceOutput) return;

        let allText = `# نصيحة السوشيال ميديا - برنامج الطفل القائد\n\n`;
        allText += `الكفاءة: ${COMPETENCIES[adviceOutput.competency].ar}\n`;
        allText += `الموضوع: ${adviceOutput.topic}\n`;
        allText += `المدة: ${adviceOutput.totalDuration}\n\n`;

        adviceOutput.scenes.forEach((scene) => {
            allText += `${"=".repeat(60)}\n`;
            allText += `## المشهد ${scene.sceneNumber}: ${scene.titleAr}\n`;
            allText += `${"=".repeat(60)}\n\n`;
            allText += `### 🎤 النص العربي:\n"${scene.arabicScript}"\n\n`;
            allText += `### 🖼️ Image Prompt:\n${scene.imagePrompt}\n\n`;
            allText += `### 🎬 Video Prompt:\n${scene.animationPrompt}\n\n`;
        });

        navigator.clipboard.writeText(allText);
        showToast("تم نسخ جميع المشاهد ✓", "success");
    }, [adviceOutput, showToast]);

    return (
        <main className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8" dir="rtl">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        📱 مولد نصائح السوشيال ميديا
                    </h1>
                    <p className="text-foreground-secondary">
                        فيديوهات نصائح قصيرة من برنامج الطفل القائد • 6 مشاهد × 8 ثواني
                    </p>
                    <p className="text-sm text-foreground-secondary mt-1">
                        من إعداد نجيبة صميدة
                    </p>
                </div>

                {/* Back link */}
                <div className="mb-6">
                    <Link href="/" className="text-accent hover:underline flex items-center gap-2">
                        ← العودة للرئيسية
                    </Link>
                </div>

                {/* Input Form */}
                <Card variant="bordered" padding="lg" className="mb-8">
                    <h2 className="text-xl font-bold mb-6" dir="rtl">⚙️ اختر موضوع النصيحة</h2>

                    {/* Competency Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3" dir="rtl">🎯 الكفاءة</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(COMPETENCIES).map(([id, info]) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setSelectedCompetency(id as CompetencyType);
                                        setSelectedTopicId('');
                                    }}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${selectedCompetency === id
                                        ? 'border-accent bg-accent/10 scale-105'
                                        : 'border-border hover:border-accent/50'
                                        }`}
                                    style={{
                                        borderColor: selectedCompetency === id ? info.color : undefined,
                                        backgroundColor: selectedCompetency === id ? `${info.color}15` : undefined
                                    }}
                                >
                                    <span className="text-2xl block mb-1">{info.icon}</span>
                                    <span className="text-sm font-medium" dir="rtl">{info.ar}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Selector */}
                    <div className="mb-6" dir="rtl">
                        <label className="block text-sm font-medium mb-3">📝 اختر الموضوع</label>

                        {/* Toggle for custom topic */}
                        <div className="flex items-center gap-3 mb-3">
                            <input
                                type="checkbox"
                                checked={useCustomTopic}
                                onChange={(e) => setUseCustomTopic(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">أريد كتابة موضوع مخصص</span>
                        </div>

                        {useCustomTopic ? (
                            <input
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="اكتب موضوع النصيحة..."
                                className="w-full p-3 bg-background-secondary border border-border rounded-lg"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {availableTopics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => setSelectedTopicId(topic.id)}
                                        className={`p-3 rounded-lg border-2 text-right transition-all ${selectedTopicId === topic.id
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border hover:border-accent/50'
                                            }`}
                                    >
                                        <p className="font-medium">{topic.titleAr}</p>
                                        <p className="text-xs text-foreground-secondary mt-1">{topic.description}</p>
                                        <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${topic.targetAudience === 'parents'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {topic.targetAudience === 'parents' ? 'للأهل' : 'للمراهقين'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Amal Reference Image */}
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200" dir="rtl">
                        <div className="flex items-center gap-3 mb-3">
                            <input
                                type="checkbox"
                                checked={hasReferenceImage}
                                onChange={(e) => setHasReferenceImage(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span className="font-medium">استخدام صورة مرجعية لشخصية أمل</span>
                        </div>

                        {hasReferenceImage && (
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    📤 رفع صورة أمل
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReferenceImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {referenceImage && (
                                    <img src={referenceImage} alt="Amal Reference" className="w-16 h-16 object-cover rounded-lg" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Enhancement Toggle */}
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200" dir="rtl">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={enhanceWithAI}
                                onChange={(e) => setEnhanceWithAI(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <div>
                                <span className="font-medium">🤖 تحسين السكربت بالذكاء الاصطناعي</span>
                                <p className="text-xs text-foreground-secondary mt-1">
                                    يستخدم OpenAI لكتابة نصوص أكثر إبداعاً وتأثيراً
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="gradient"
                        onClick={handleGenerate}
                        loading={isGenerating}
                        fullWidth
                        size="lg"
                    >
                        ✨ Generate Social Media Advice Video (6 Scenes)
                    </Button>
                </Card>

                {/* Generated Output */}
                {adviceOutput && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card variant="glow" padding="md" className="bg-gradient-to-r from-purple-600 to-pink-600">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="text-white" dir="rtl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{COMPETENCIES[adviceOutput.competency].icon}</span>
                                        <h3 className="text-xl font-bold">{adviceOutput.topic}</h3>
                                    </div>
                                    <p className="opacity-80">{adviceOutput.totalDuration} • {COMPETENCIES[adviceOutput.competency].ar}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={copyAllPrompts}>
                                        📋 Copy All
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Scene Cards */}
                        {adviceOutput.scenes.map((scene) => (
                            <SceneCard
                                key={scene.sceneNumber}
                                scene={scene}
                                isCopied={copiedScene === scene.sceneNumber}
                                generatedImages={sceneGeneratedImages[scene.sceneNumber]}
                                selectedImageIndex={sceneSelectedImageIndex[scene.sceneNumber]}
                                isGeneratingImages={imageGeneratingScenes.has(scene.sceneNumber)}
                                referenceUrl={sceneReferenceUrls[scene.sceneNumber]}
                                videoStatus={sceneVideoStatus[scene.sceneNumber]}
                                onCopyVeo={() => copyPrompt(scene, 'veo')}
                                onCopyArabic={() => copyPrompt(scene, 'arabic')}
                                onCopyImage={() => copyPrompt(scene, 'image')}
                                onGenerateImages={() => generateSceneImages(scene.sceneNumber, scene.imagePrompt)}
                                onSelectImage={(index) => handleSelectImage(scene.sceneNumber, index)}
                                onSetReferenceUrl={(url) => setSceneReferenceUrls(prev => ({ ...prev, [scene.sceneNumber]: url }))}
                                onGenerateVideo={() => generateSceneVideo(scene)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// ============================================================================
// Scene Card Component
// ============================================================================

function SceneCard({
    scene,
    isCopied,
    generatedImages,
    selectedImageIndex,
    isGeneratingImages,
    referenceUrl,
    videoStatus,
    onCopyVeo,
    onCopyArabic,
    onCopyImage,
    onGenerateImages,
    onSelectImage,
    onSetReferenceUrl,
    onGenerateVideo,
}: {
    scene: AdviceVideoScene;
    isCopied: boolean;
    generatedImages?: GeneratedImageOption[];
    selectedImageIndex?: number;
    isGeneratingImages: boolean;
    referenceUrl?: string;
    videoStatus?: SceneVideoStatus;
    onCopyVeo: () => void;
    onCopyArabic: () => void;
    onCopyImage: () => void;
    onGenerateImages: () => void;
    onSelectImage: (index: number) => void;
    onSetReferenceUrl: (url: string) => void;
    onGenerateVideo: () => void;
}) {
    const [showImagePrompt, setShowImagePrompt] = useState(false);
    const [showVideoPrompt, setShowVideoPrompt] = useState(false);

    // Scene type icons and colors
    const sceneConfig: Record<string, { icon: string; color: string }> = {
        hook: { icon: '🎯', color: 'from-yellow-500 to-orange-500' },
        problem: { icon: '🤔', color: 'from-blue-500 to-cyan-500' },
        tip1: { icon: '1️⃣', color: 'from-green-500 to-emerald-500' },
        tip2: { icon: '2️⃣', color: 'from-teal-500 to-cyan-500' },
        tip3: { icon: '🌟', color: 'from-amber-500 to-yellow-500' },
        cta: { icon: '📲', color: 'from-purple-500 to-pink-500' }
    };

    const config = sceneConfig[scene.sceneType];

    return (
        <Card variant="bordered" padding="md" className={`relative ${isCopied ? 'ring-2 ring-green-500' : ''}`}>
            {/* Scene Header */}
            <div className="flex items-center justify-between mb-4" dir="rtl">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} text-white flex items-center justify-center font-bold text-xl`}>
                        {scene.sceneNumber}
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">{scene.titleAr}</h3>
                        <p className="text-sm text-foreground-secondary">{scene.duration} ثواني • {scene.titleEn}</p>
                    </div>
                </div>
                <span className="text-3xl">{config.icon}</span>
            </div>

            {/* Arabic Script */}
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200" dir="rtl">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-700">🎤 التعليق الصوتي</span>
                    <Button size="sm" variant="ghost" onClick={onCopyArabic}>📋 نسخ</Button>
                </div>
                <p className="text-foreground font-medium text-lg">&ldquo;{scene.arabicScript}&rdquo;</p>
            </div>

            {/* Image Generation Section */}
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowImagePrompt(!showImagePrompt)}>
                    <span className="font-bold text-indigo-700">🖼️ Nanobanana Image Prompt</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onCopyImage(); }}>📋</Button>
                        <span className={`transition-transform ${showImagePrompt ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>

                {showImagePrompt && (
                    <pre dir="ltr" className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg max-h-48 overflow-auto font-mono whitespace-pre-wrap mb-3">
                        {scene.imagePrompt}
                    </pre>
                )}

                <Button
                    variant="primary"
                    size="md"
                    onClick={onGenerateImages}
                    loading={isGeneratingImages}
                    fullWidth
                    className="mb-3"
                >
                    ✨ Generate 3 AI Images (9:16 Vertical)
                </Button>

                {(generatedImages && generatedImages.length > 0) || isGeneratingImages ? (
                    <ImageSelector
                        images={generatedImages || []}
                        selectedIndex={selectedImageIndex ?? -1}
                        onSelect={onSelectImage}
                        isLoading={isGeneratingImages}
                        onRegenerate={onGenerateImages}
                    />
                ) : null}

                <div className="mt-3">
                    <label className="block text-sm text-indigo-600 mb-1">Or paste image URL:</label>
                    <input
                        type="text"
                        value={referenceUrl || ""}
                        onChange={(e) => onSetReferenceUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 text-sm bg-white border border-indigo-200 rounded-lg"
                    />
                </div>
            </div>

            {/* Video Generation Section */}
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowVideoPrompt(!showVideoPrompt)}>
                    <span className="font-bold text-violet-700">🎬 Veo 3.1 Video Prompt</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onCopyVeo(); }}>📋</Button>
                        <span className={`transition-transform ${showVideoPrompt ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>

                {showVideoPrompt && (
                    <pre dir="ltr" className="text-xs bg-gray-900 text-blue-400 p-3 rounded-lg max-h-48 overflow-auto font-mono whitespace-pre-wrap mb-3">
                        {scene.animationPrompt}
                    </pre>
                )}

                <Button
                    variant="gradient"
                    size="md"
                    onClick={onGenerateVideo}
                    disabled={!referenceUrl || videoStatus?.status === "generating"}
                    loading={videoStatus?.status === "generating"}
                    fullWidth
                >
                    {videoStatus?.status === "generating"
                        ? `⏳ Generating... ${videoStatus.progress || 0}%`
                        : "🎬 Generate Video from Selected Image"
                    }
                </Button>

                {videoStatus?.status === "completed" && videoStatus.videoUrl && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                        <p className="text-green-700 font-medium mb-2">✅ Video Ready!</p>
                        <a
                            href={videoStatus.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 underline"
                        >
                            📥 Download Video
                        </a>
                    </div>
                )}

                {videoStatus?.status === "failed" && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                        <p className="text-red-700">❌ {videoStatus.errorMessage}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
