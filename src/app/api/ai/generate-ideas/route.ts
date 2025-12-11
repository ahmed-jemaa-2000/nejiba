import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/ai";

interface GenerateIdeasRequest {
    theme?: string;
    count?: number;
}

export async function POST(request: NextRequest) {
    try {
        // Check for API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured", code: "NO_API_KEY" },
                { status: 500 }
            );
        }

        const body: GenerateIdeasRequest = await request.json();

        const count = Math.min(Math.max(body.count || 10, 1), 20); // 1-20 ideas

        console.log(`Generating ${count} workshop ideas${body.theme ? ` for theme: ${body.theme}` : ""}`);

        const ideas = await generateIdeas(body.theme, count);

        return NextResponse.json({ ideas });
    } catch (error) {
        console.error("Ideas generation error:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, code: "GENERATION_ERROR" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate ideas", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
