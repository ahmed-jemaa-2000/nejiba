
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt required" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert AI art prompter. 
                    Expand the user's short description into a detailed, photorealistic image prompt.
                    Style: Professional, Cinematic, Tunisian Cultural Context (Mediterranean light, realistic).
                    Include specific visual details (lighting, composition, textures).
                    Keep it under 60 words.`
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const enhanced = completion.choices[0]?.message?.content || prompt;

        return NextResponse.json({ enhanced });
    } catch (error) {
        console.error("Enhancement error:", error);
        return NextResponse.json({ error: "Failed to enhance" }, { status: 500 });
    }
}
