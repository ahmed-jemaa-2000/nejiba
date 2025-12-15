/**
 * Scene Image Upload API
 * 
 * Handles direct upload of reference images for Sora 2 video generation
 * Stores images in public/uploads/scenes/
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Directory for uploaded scene images
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "scenes");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const sceneNumber = formData.get("sceneNumber") as string || "0";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Use JPEG, PNG, or WebP." },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum 10MB." },
                { status: 400 }
            );
        }

        // Ensure upload directory exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split(".").pop() || "jpg";
        const filename = `scene_${sceneNumber}_${timestamp}.${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the public URL path
        const publicUrl = `/uploads/scenes/${filename}`;

        console.log(`Uploaded scene image: ${filename}`);

        return NextResponse.json({
            success: true,
            filename,
            url: publicUrl,
            fullPath: filepath
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
