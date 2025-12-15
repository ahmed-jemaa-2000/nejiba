/**
 * Sora 2 Video Generation API Route
 * 
 * Integrates with GeminiGen.AI Sora 2 API for video generation
 * Can use either local file or URL reference image
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINIGEN_API_URL = "https://api.geminigen.ai/uapi/v1/video-gen/sora";
const GEMINIGEN_API_KEY = process.env.GEMINIGEN_API_KEY || "";

// Default Amal reference image URL (hosted externally for better API compatibility)
// Can be overridden with AMAL_REFERENCE_URL env variable
const AMAL_REFERENCE_URL = process.env.AMAL_REFERENCE_URL || "";

// Path to local Amal image as fallback
const AMAL_IMAGE_PATH = path.join(process.cwd(), "public", "amal.jpeg");

export interface SoraVideoRequest {
    prompt: string;
    duration?: 10 | 15;
    aspectRatio?: "landscape" | "portrait";
    referenceImageUrl?: string;
}

export interface SoraVideoResponse {
    id: number;
    uuid: string;
    status: number;
    status_desc: string;
    status_percentage: number;
    error_code?: string;
    error_message?: string;
    estimated_credit: number;
    created_at: string;
}

export async function POST(request: NextRequest) {
    try {
        // Check API key
        if (!GEMINIGEN_API_KEY) {
            return NextResponse.json(
                { error: "GEMINIGEN_API_KEY not configured" },
                { status: 500 }
            );
        }

        const body: SoraVideoRequest = await request.json();
        const { prompt, duration = 15, aspectRatio = "landscape", referenceImageUrl } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Build form data for multipart request
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("model", "sora-2");
        formData.append("resolution", "small"); // 720p
        formData.append("duration", duration.toString());
        formData.append("aspect_ratio", aspectRatio);

        // Handle reference image
        const imageRef = referenceImageUrl || AMAL_REFERENCE_URL;

        if (imageRef) {
            // Check if it's a local path (starts with / or /uploads/)
            if (imageRef.startsWith("/") && !imageRef.startsWith("//")) {
                // Local file - read and upload directly
                const localPath = path.join(process.cwd(), "public", imageRef);
                console.log("Reading local reference image:", localPath);

                if (fs.existsSync(localPath)) {
                    const imageBuffer = fs.readFileSync(localPath);
                    const extension = imageRef.split(".").pop()?.toLowerCase() || "jpeg";
                    const mimeType = extension === "png" ? "image/png" :
                        extension === "webp" ? "image/webp" : "image/jpeg";
                    const imageBlob = new Blob([imageBuffer], { type: mimeType });
                    formData.append("files", imageBlob, `reference.${extension}`);
                    console.log("Uploaded local file as multipart");
                } else {
                    console.warn("Local reference file not found:", localPath);
                }
            } else if (imageRef.startsWith("http")) {
                // External URL - use file_urls
                console.log("Using external reference URL:", imageRef);
                formData.append("file_urls", imageRef);
            }
        } else if (fs.existsSync(AMAL_IMAGE_PATH)) {
            // Fallback to local file upload
            console.log("Using local reference image:", AMAL_IMAGE_PATH);
            const imageBuffer = fs.readFileSync(AMAL_IMAGE_PATH);
            const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });
            formData.append("files", imageBlob, "amal.jpeg");
        } else {
            // No reference image - generate without (may have inconsistent character)
            console.log("No reference image available, generating without reference");
        }

        console.log("=== Sora 2 API Request ===");
        console.log("Prompt length:", prompt.length, "chars");
        console.log("Duration:", duration, "seconds");
        console.log("Aspect ratio:", aspectRatio);

        // Call GeminiGen Sora 2 API
        const response = await fetch(GEMINIGEN_API_URL, {
            method: "POST",
            headers: {
                "x-api-key": GEMINIGEN_API_KEY,
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log("Sora 2 API response:", response.status);
        console.log("Response body:", responseText.substring(0, 500));

        if (!response.ok) {
            console.error("Sora 2 API error:", responseText);
            return NextResponse.json(
                { error: `Sora 2 API error: ${responseText}` },
                { status: response.status }
            );
        }

        const data: SoraVideoResponse = JSON.parse(responseText);

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                uuid: data.uuid,
                status: data.status,
                statusDesc: data.status_desc,
                statusPercentage: data.status_percentage,
                estimatedCredit: data.estimated_credit,
                createdAt: data.created_at,
            }
        });

    } catch (error) {
        console.error("Sora 2 generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate video", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
