"use client";

import { useState } from "react";

interface GeneratedImage {
    url: string;
    uuid: string;
    thumbnailUrl?: string;
}

interface ImageSelectorProps {
    /** Array of generated images (up to 3) */
    images: GeneratedImage[];
    /** Index of currently selected image (-1 if none) */
    selectedIndex: number;
    /** Callback when an image is selected */
    onSelect: (index: number) => void;
    /** Whether images are currently being generated */
    isLoading: boolean;
    /** Callback to regenerate all images */
    onRegenerate?: () => void;
    /** Number of images to show slots for (default 3) */
    slotCount?: number;
    /** Error message to display */
    error?: string;
}

/**
 * ImageSelector - Display 3 AI-generated images in a grid for selection
 * 
 * Used in video scene cards to let users choose a reference image
 * for video generation from 3 AI-generated options.
 */
export function ImageSelector({
    images,
    selectedIndex,
    onSelect,
    isLoading,
    onRegenerate,
    slotCount = 3,
    error
}: ImageSelectorProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Create array of slots (filled or empty)
    const slots = Array.from({ length: slotCount }, (_, i) => images[i] || null);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>🎨</span>
                    اختر صورة مرجعية
                </h4>
                {onRegenerate && images.length > 0 && !isLoading && (
                    <button
                        onClick={onRegenerate}
                        className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
                    >
                        <span>🔄</span>
                        توليد خيارات جديدة
                    </button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    ⚠️ {error}
                </div>
            )}

            {/* Image Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-3">
                {slots.map((image, index) => (
                    <div
                        key={index}
                        className={`
                            relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer
                            ${isLoading && !image
                                ? "bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse border-gray-300"
                                : image
                                    ? selectedIndex === index
                                        ? "border-purple-500 ring-4 ring-purple-200 shadow-lg"
                                        : hoveredIndex === index
                                            ? "border-purple-300 shadow-md"
                                            : "border-gray-200 hover:border-gray-300"
                                    : "bg-gray-100 border-dashed border-gray-300"
                            }
                        `}
                        onClick={() => image && onSelect(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Loading state */}
                        {isLoading && !image && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-xs text-gray-500">
                                    {index + 1}/3
                                </span>
                            </div>
                        )}

                        {/* Image */}
                        {image && (
                            <>
                                <img
                                    src={image.thumbnailUrl || image.url}
                                    alt={`Option ${index + 1}`}
                                    className="w-full h-full object-contain bg-gray-100"
                                    loading="lazy"
                                />

                                {/* Selection overlay */}
                                {selectedIndex === index && (
                                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                {hoveredIndex === index && selectedIndex !== index && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                                            اختيار
                                        </span>
                                    </div>
                                )}

                                {/* Option number badge */}
                                <div className={`
                                    absolute top-1 left-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                                    ${selectedIndex === index
                                        ? "bg-purple-500 text-white"
                                        : "bg-black/50 text-white"
                                    }
                                `}>
                                    {index + 1}
                                </div>
                            </>
                        )}

                        {/* Empty slot */}
                        {!image && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                {index + 1}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Selection status */}
            {images.length > 0 && (
                <div className="text-center">
                    {selectedIndex >= 0 ? (
                        <p className="text-sm text-green-600 font-medium">
                            ✅ تم اختيار الصورة {selectedIndex + 1}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500">
                            اضغط على صورة لاختيارها
                        </p>
                    )}
                </div>
            )}

            {/* Loading status */}
            {isLoading && (
                <div className="text-center">
                    <p className="text-sm text-purple-600 animate-pulse">
                        ⏳ جاري توليد 3 صور... قد يستغرق دقيقة
                    </p>
                </div>
            )}
        </div>
    );
}

export default ImageSelector;
