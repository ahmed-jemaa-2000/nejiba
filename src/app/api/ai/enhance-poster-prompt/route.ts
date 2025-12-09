import { NextResponse } from "next/server";
import { enhancePosterPrompt } from "@/lib/ai/openai";

export async function POST(req: Request) {
    try {
        const { topic, title, audience } = await req.json();

        if (!topic) {
            return NextResponse.json(
                { error: "الموضوع مطلوب (Topic is required)" },
                { status: 400 }
            );
        }

        const enhanced = await enhancePosterPrompt({
            topic,
            title,
            audience,
        });

        return NextResponse.json(enhanced);
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return NextResponse.json(
            { error: "فشل في تحسين الوصف" },
            { status: 500 }
        );
    }
}
