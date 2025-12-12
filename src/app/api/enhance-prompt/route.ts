import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a professional video prompt engineer for Sora-2 AI video generation.

Your job: Take a basic Sora-2 prompt and enhance it with:
- More specific visual details
- Better cinematography language
- Richer emotional cues
- Professional camera movement descriptions
- Lighting and atmosphere details
- Character actions and micro-expressions

Keep the same:
- Duration
- Core scene concept
- Characters and setting
- Overall mood

Return ONLY the enhanced prompt text, nothing else.`
                },
                {
                    role: "user",
                    content: `Enhance this Sora-2 prompt:

${prompt}

Context: ${context || "Parent-child interaction in Tunisian home for educational content"}

Enhanced prompt:`
                }
            ],
            max_completion_tokens: 500,
        });

        const enhancedPrompt = completion.choices[0]?.message?.content?.trim();

        if (!enhancedPrompt) {
            throw new Error("No enhanced prompt generated");
        }

        console.log("\n✨ PROMPT ENHANCED:");
        console.log("Original:", prompt.substring(0, 100) + "...");
        console.log("Enhanced:", enhancedPrompt.substring(0, 100) + "...");

        return NextResponse.json({
            success: true,
            enhancedPrompt,
            originalPrompt: prompt
        });

    } catch (error: any) {
        console.error('❌ Prompt enhancement error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to enhance prompt' },
            { status: 500 }
        );
    }
}
