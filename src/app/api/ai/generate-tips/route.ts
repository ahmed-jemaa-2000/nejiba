import { NextResponse } from "next/server";
import { generateDailyTips } from "@/lib/ai/openai";

export async function POST(req: Request) {
    try {
        const { topic, workshopTitle } = await req.json();

        if (!topic || !workshopTitle) {
            return NextResponse.json(
                { error: "الموضوع والعنوان مطلوبان" },
                { status: 400 }
            );
        }

        const tips = await generateDailyTips(topic, workshopTitle);

        return NextResponse.json({ tips });
    } catch (error) {
        console.error("Error generating tips:", error);
        return NextResponse.json(
            { error: "فشل في توليد النصائح" },
            { status: 500 }
        );
    }
}
