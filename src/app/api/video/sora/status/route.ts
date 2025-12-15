/**
 * Sora 2 Video Status API Route
 * 
 * Check the status of a video generation request
 */

import { NextRequest, NextResponse } from "next/server";

const GEMINIGEN_HISTORY_API = "https://api.geminigen.ai/uapi/v1/history";
const GEMINIGEN_API_KEY = process.env.GEMINIGEN_API_KEY || "";

export interface VideoStatusResponse {
    id: number;
    uuid: string;
    status: number;
    status_desc: string;
    status_percentage: number;
    error_code?: string;
    error_message?: string;
    result?: {
        url: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const uuid = searchParams.get("uuid");

        if (!uuid) {
            return NextResponse.json(
                { error: "UUID is required" },
                { status: 400 }
            );
        }

        if (!GEMINIGEN_API_KEY) {
            return NextResponse.json(
                { error: "GEMINIGEN_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Call GeminiGen History API to get status
        const response = await fetch(`${GEMINIGEN_HISTORY_API}/${uuid}`, {
            method: "GET",
            headers: {
                "x-api-key": GEMINIGEN_API_KEY,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Sora 2 status API error:", errorText);
            return NextResponse.json(
                { error: `Status API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data: VideoStatusResponse = await response.json();

        // Map status codes
        const statusMap: Record<number, string> = {
            1: "processing",
            2: "completed",
            3: "failed",
        };

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                uuid: data.uuid,
                status: statusMap[data.status] || "unknown",
                statusCode: data.status,
                statusPercentage: data.status_percentage,
                errorMessage: data.error_message,
                videoUrl: data.result?.url || null,
            }
        });

    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json(
            { error: "Failed to check status", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
