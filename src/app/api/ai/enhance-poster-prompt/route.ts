import { NextResponse } from "next/server";
import { enhancePosterPrompt } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const { topic, workshopPlan, date, time, place } = await req.json();

        if (!topic || !workshopPlan) {
            return NextResponse.json(
                { error: "الموضوع والخطة مطلوبان (Topic and Plan are required)" },
                { status: 400 }
            );
        }

        const enhanced = await enhancePosterPrompt({
            topic,
            workshopPlan,
            date,
            time,
            place
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
