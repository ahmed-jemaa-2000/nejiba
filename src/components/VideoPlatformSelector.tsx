'use client';
import { useState } from 'react';
import { VideoPlatform, PLATFORM_CONFIGS } from '@/lib/ai/prompts/amalVideoGenerator';

interface PlatformSelectorProps {
    selected: VideoPlatform;
    onSelect: (platform: VideoPlatform) => void;
}

export default function VideoPlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 mb-6">
            <h3 className="font-bold text-purple-900 text-lg mb-4 flex items-center gap-2">
                <span>🎬</span>
                <span>اختر منصة توليد الفيديو</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sora 2 Option */}
                <button
                    onClick={() => onSelect('sora2')}
                    className={`p-4 rounded-lg border-2 transition-all text-right ${selected === 'sora2'
                        ? 'border-purple-500 bg-purple-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === 'sora2' ? 'border-purple-500' : 'border-gray-300'
                            }`}>
                            {selected === 'sora2' && (
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            )}
                        </span>
                        <span className="font-bold text-purple-800">Sora 2</span>
                    </div>
                    <div className="text-sm text-gray-600" dir="rtl">
                        <p className="font-medium text-purple-700 mb-1">4 مشاهد × 15 ثانية</p>
                        <p>عمودي 9:16 • جودة عالية</p>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">720p</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">60 ثانية</span>
                    </div>
                </button>

                {/* Veo 2 Option */}
                <button
                    onClick={() => onSelect('veo31fast')}
                    className={`p-4 rounded-lg border-2 transition-all text-right ${selected === 'veo31fast'
                        ? 'border-green-500 bg-green-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === 'veo31fast' ? 'border-green-500' : 'border-gray-300'
                            }`}>
                            {selected === 'veo31fast' && (
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            )}
                        </span>
                        <span className="font-bold text-green-800">Veo 3.1 Fast</span>
                    </div>
                    <div className="text-sm text-gray-600" dir="rtl">
                        <p className="font-medium text-green-700 mb-1">5 مشاهد × 8 ثانية</p>
                        <p>عمودي 9:16 للموبايل • سريع</p>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">1080p</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">40 ثانية</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">📱 موبايل</span>
                    </div>
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center" dir="rtl">
                💡 Veo 3.1 Fast مناسب لـ TikTok, Instagram Reels, YouTube Shorts
            </p>
        </div>
    );
}
