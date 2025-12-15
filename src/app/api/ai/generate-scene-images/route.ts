import { NextRequest, NextResponse } from "next/server";
import { generateMultipleImages } from "@/lib/ai/geminigen";

interface GenerateSceneImagesRequest {
    imagePrompt: string;
    sceneNumber: number;
    count?: number;
    aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
    style?: string;
}

interface GeneratedImage {
    url: string;
    uuid: string;
    thumbnailUrl?: string;
}

/**
 * POST /api/ai/generate-scene-images
 * 
 * Generates multiple (default 3) reference images for a video scene
 * using the GeminiGen Imagen Pro API.
 * 
 * Used for the "Generate 3 Options" feature in the video page.
 */
export async function POST(request: NextRequest) {
    try {
        const body: GenerateSceneImagesRequest = await request.json();

        // Validate required fields
        if (!body.imagePrompt) {
            return NextResponse.json(
                { error: "Missing required field: imagePrompt" },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINIGEN_API_KEY) {
            return NextResponse.json(
                {
                    error: "GEMINIGEN_API_KEY not configured",
                    code: "NO_API_KEY"
                },
                { status: 500 }
            );
        }

        console.log(`🖼️ Generating ${body.count || 3} images for scene ${body.sceneNumber || "?"}`);
        console.log(`📝 Prompt: ${body.imagePrompt.substring(0, 100)}...`);

        // Get Amal reference image URL from environment variable
        // IMPORTANT: Must be a publicly accessible URL (not localhost!)
        // Upload amal.jpeg to Imgur, Cloudinary, or your deployed Vercel site
        const amalReferenceUrl = process.env.AMAL_REFERENCE_URL || null;

        if (amalReferenceUrl) {
            console.log(`👧 Using Amal reference image: ${amalReferenceUrl}`);
        } else {
            console.log(`⚠️ No AMAL_REFERENCE_URL set - generating without reference image`);
            console.log(`   To enable: Add AMAL_REFERENCE_URL=https://your-public-url/amal.jpeg to .env.local`);
        }

        // Generate multiple images (with or without Amal reference)
        const result = await generateMultipleImages(
            body.imagePrompt,
            body.count || 3,
            {
                aspectRatio: body.aspectRatio || "16:9", // 16:9 for video reference images
                style: "3D Render", // Best for animated character scenes
                referenceImageUrl: amalReferenceUrl || undefined // Only use if public URL is set
            }
        );

        // Transform results to simpler format
        const images: GeneratedImage[] = result.images
            .filter(img => img.status === 2 && img.generate_result) // Only completed images
            .map(img => ({
                url: img.generate_result,
                uuid: img.uuid,
                thumbnailUrl: img.thumbnail_small
            }));

        console.log(`✅ Generated ${images.length}/${body.count || 3} images successfully`);

        if (images.length === 0) {
            return NextResponse.json(
                {
                    error: "All image generations failed",
                    details: result.errors
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            sceneNumber: body.sceneNumber,
            images,
            errors: result.errors.length > 0 ? result.errors : undefined,
            message: images.length < (body.count || 3)
                ? `Generated ${images.length}/${body.count || 3} images (some failed)`
                : `Generated ${images.length} images successfully`
        });

    } catch (error) {
        console.error("❌ Scene image generation error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate images";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
