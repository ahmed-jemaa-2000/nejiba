'use client';
import { useState } from 'react';

interface VideoSegment {
    segmentNumber: number;
    duration: number;
    soraPrompt: string;
    sceneDescription: string;
    visualElements: string[];
    cameraMovement: string;
    mood: string;
    voiceoverText: string;
}

interface DailyVideoContent {
    day: number;
    theme: string;
    segments: VideoSegment[];
    transitionNotes: string;
}

export default function VideoPromptsDisplay({ videoContent }: { videoContent: DailyVideoContent }) {
    const [enhancing, setEnhancing] = useState<number | null>(null);
    const [enhancedPrompts, setEnhancedPrompts] = useState<Record<number, string>>({});
    const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

    const handleCopyPrompt = (prompt: string, segmentNumber: number) => {
        navigator.clipboard.writeText(prompt);
        setCopyFeedback(segmentNumber);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    const handleEnhancePrompt = async (segment: VideoSegment) => {
        setEnhancing(segment.segmentNumber);
        try {
            const res = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: segment.soraPrompt,
                    context: `Day ${videoContent.day} - ${videoContent.theme}`
                })
            });

            const data = await res.json();
            if (data.success) {
                setEnhancedPrompts(prev => ({
                    ...prev,
                    [segment.segmentNumber]: data.enhancedPrompt
                }));
            } else {
                console.error('Enhancement failed:', data.error);
            }
        } catch (error) {
            console.error('Enhancement failed:', error);
        } finally {
            setEnhancing(null);
        }
    };

    return (
        <div className="mt-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-purple-900 text-lg">
                    🎬 مخططات الفيديو لـ Sora-2
                </h4>
                <span className="text-sm text-purple-700 bg-white px-3 py-1 rounded-full">
                    {videoContent.segments.length} مشاهد × {videoContent.segments[0]?.duration || 12}ث
                </span>
            </div>

            <div className="grid gap-4">
                {videoContent.segments.map((segment) => {
                    const currentPrompt = enhancedPrompts[segment.segmentNumber] || segment.soraPrompt;
                    const isEnhanced = !!enhancedPrompts[segment.segmentNumber];

                    return (
                        <div key={segment.segmentNumber}
                             className="bg-white rounded-lg p-4 border-r-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        {segment.segmentNumber}
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        مشهد {segment.segmentNumber}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    {segment.duration}ث
                                </span>
                            </div>

                            {/* Scene Description (Arabic) */}
                            <p className="text-sm text-gray-700 mb-3" dir="rtl">
                                {segment.sceneDescription}
                            </p>

                            {/* Sora-2 Prompt */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-purple-700">
                                        Sora-2 Prompt {isEnhanced && <span className="text-green-600">✨ Enhanced</span>}
                                    </span>
                                </div>
                                <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap font-sans">
                                    {currentPrompt}
                                </pre>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopyPrompt(currentPrompt, segment.segmentNumber)}
                                    className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                                >
                                    {copyFeedback === segment.segmentNumber ? '✅ تم النسخ' : '📋 نسخ Prompt'}
                                </button>
                                <button
                                    onClick={() => handleEnhancePrompt(segment)}
                                    disabled={enhancing === segment.segmentNumber}
                                    className="flex-1 text-xs bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {enhancing === segment.segmentNumber ? '⏳ جاري التحسين...' : '✨ تحسين بـ GPT-mini'}
                                </button>
                            </div>

                            {/* Voiceover */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">🎙️ التعليق الصوتي:</span>
                                <p className="text-sm text-gray-700 mt-1" dir="rtl">
                                    {segment.voiceoverText}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Transition Notes */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900" dir="rtl">
                    <strong className="font-semibold">💡 ملاحظات الدمج:</strong> {videoContent.transitionNotes}
                </p>
            </div>
        </div>
    );
}
