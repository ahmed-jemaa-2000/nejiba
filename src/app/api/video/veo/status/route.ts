/**
 * Veo 2 Video Status API Route
 * 
 * Checks the status of a Veo 2 video generation request
 */

import { NextRequest, NextResponse } from "next/server";

const GEMINIGEN_HISTORY_URL = "https://api.geminigen.ai/uapi/v1/history";

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINIGEN_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "Missing API key configuration" },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const uuid = searchParams.get("uuid");

        if (!uuid) {
            return NextResponse.json(
                { success: false, error: "UUID is required" },
                { status: 400 }
            );
        }

        // Get generation history/status
        const response = await fetch(`${GEMINIGEN_HISTORY_URL}/${uuid}`, {
            method: "GET",
            headers: {
                "x-api-key": apiKey,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.detail?.error_message || "Status check failed" },
                { status: response.status }
            );
        }

        // Map status codes: 1 = processing, 2 = completed, 3 = failed
        let status = "processing";
        if (data.status === 2) status = "completed";
        if (data.status === 3) status = "failed";

        return NextResponse.json({
            success: true,
            data: {
                uuid: data.uuid,
                status,
                statusPercentage: data.status_percentage || 0,
                videoUrl: data.output_url || data.video_url || null,
                errorMessage: data.error_message || null,
            }
        });

    } catch (error) {
        console.error("Veo status check error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
