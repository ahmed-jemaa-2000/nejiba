/**
 * Veo 3.1 Fast Video Generation API Route
 * 
 * Uses GeminiGen API to generate videos with Veo 3.1 Fast model
 * Supports: 9:16 portrait, 8 seconds fixed, 1080p
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINIGEN_API_URL = "https://api.geminigen.ai/uapi/v1/video-gen/veo";

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINIGEN_API_KEY;

        if (!apiKey) {
            console.error("Missing GEMINIGEN_API_KEY");
            return NextResponse.json(
                { success: false, error: "Missing API key configuration" },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { prompt, referenceImageUrl, aspectRatio = "16:9" } = body;

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Prompt is required" },
                { status: 400 }
            );
        }

        console.log("=== Veo 3.1 Fast API Request ===");
        console.log("Prompt length:", prompt.length, "chars");
        console.log("Aspect ratio:", aspectRatio);
        console.log("Prompt content:", prompt.substring(0, 300) + "...");

        // Create FormData for multipart request
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("model", "veo-3.1-fast");
        formData.append("resolution", "1080p");
        formData.append("aspect_ratio", aspectRatio);

        // Handle reference image (supports both local paths and URLs)
        if (referenceImageUrl && referenceImageUrl.trim()) {
            console.log("Reference image provided:", referenceImageUrl);

            if (referenceImageUrl.startsWith("/") && !referenceImageUrl.startsWith("//")) {
                // Local file - read and upload as blob
                const localPath = path.join(process.cwd(), "public", referenceImageUrl);
                console.log("Reading local reference image:", localPath);

                if (fs.existsSync(localPath)) {
                    const imageBuffer = fs.readFileSync(localPath);
                    const extension = referenceImageUrl.split(".").pop()?.toLowerCase() || "jpeg";
                    const mimeType = extension === "png" ? "image/png" :
                        extension === "webp" ? "image/webp" : "image/jpeg";
                    const imageBlob = new Blob([imageBuffer], { type: mimeType });
                    formData.append("ref_images", imageBlob, `reference.${extension}`);
                    console.log("Uploaded local file as ref_images blob");
                } else {
                    console.warn("Local reference file not found:", localPath);
                }
            } else if (referenceImageUrl.startsWith("http")) {
                // External URL - pass directly
                console.log("Using external reference URL");
                formData.append("ref_images", referenceImageUrl);
            } else if (referenceImageUrl.startsWith("data:")) {
                // Base64 data URL - extract and upload
                console.log("Processing base64 image data");
                const matches = referenceImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
                if (matches) {
                    const extension = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, "base64");
                    const mimeType = `image/${extension}`;
                    const imageBlob = new Blob([buffer], { type: mimeType });
                    formData.append("ref_images", imageBlob, `reference.${extension}`);
                    console.log("Uploaded base64 image as ref_images blob");
                }
            }
        } else {
            console.log("No reference image provided");
        }

        const response = await fetch(GEMINIGEN_API_URL, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
            },
            body: formData,
        });

        const data = await response.json();

        console.log("Veo 3.1 Fast API response status:", response.status);

        if (!response.ok) {
            console.error("Veo 3.1 Fast API error:", JSON.stringify(data));
            return NextResponse.json(
                { success: false, error: data.detail?.error_message || "Veo API error" },
                { status: response.status }
            );
        }

        console.log("Veo 3.1 Fast generation started:", data.uuid);

        return NextResponse.json({
            success: true,
            data: {
                uuid: data.uuid,
                status: data.status === 1 ? "processing" : data.status === 2 ? "completed" : "failed",
                statusPercentage: data.status_percentage || 0,
                model: data.model_name,
            }
        });

    } catch (error) {
        console.error("Veo 3.1 Fast generation error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
