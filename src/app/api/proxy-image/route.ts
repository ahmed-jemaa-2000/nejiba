
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers(response.headers);

        // Ensure accurate content type
        headers.set("Content-Type", response.headers.get("Content-Type") || "image/png");

        // Critical: Allow CORS for the canvas
        headers.set("Access-Control-Allow-Origin", "*");

        // Cache control for performance
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(blob, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
