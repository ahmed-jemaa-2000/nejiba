/**
 * Social Advice Video Generator API
 * 
 * POST /api/ai/social-advice
 * Generates AI-enhanced social media advice video scripts
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
    generateSocialAdviceVideo,
    COMPETENCIES,
    TOPIC_LIBRARY,
    type CompetencyType,
    type AdviceVideoOutput
} from "@/lib/ai/prompts/socialAdviceGenerator";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
    competency: CompetencyType;
    topicId: string;
    customTopic?: string;
    enhance: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body: RequestBody = await request.json();
        const { competency, topicId, customTopic, enhance } = body;

        // Validate competency
        if (!competency || !COMPETENCIES[competency]) {
            return NextResponse.json(
                { error: "Invalid competency type" },
                { status: 400 }
            );
        }

        // Get topic info
        const topicLibrary = TOPIC_LIBRARY[competency];
        const selectedTopic = topicLibrary.find(t => t.id === topicId);

        if (!selectedTopic && !customTopic) {
            return NextResponse.json(
                { error: "Topic not found and no custom topic provided" },
                { status: 400 }
            );
        }

        const topicTitle = selectedTopic?.titleAr || customTopic || topicId;

        // Generate base video script
        let videoOutput: AdviceVideoOutput = generateSocialAdviceVideo({
            competency,
            topic: topicId,
            customTopic,
            mascotName: "أمل"
        });

        // If enhancement is requested, use OpenAI to improve scripts
        if (enhance) {
            try {
                videoOutput = await enhanceWithAI(videoOutput, competency, topicTitle);
            } catch (error) {
                console.error("AI Enhancement failed, using base output:", error);
                // Continue with base output if AI fails
            }
        }

        return NextResponse.json({
            success: true,
            ...videoOutput
        });

    } catch (error) {
        console.error("Social advice generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Generation failed" },
            { status: 500 }
        );
    }
}

/**
 * Enhance the video script with OpenAI
 */
async function enhanceWithAI(
    baseOutput: AdviceVideoOutput,
    competency: CompetencyType,
    topicTitle: string
): Promise<AdviceVideoOutput> {
    const competencyInfo = COMPETENCIES[competency];

    const systemPrompt = `أنت خبير عالمي في التربية الإيجابية والتعلم الاجتماعي العاطفي (CASEL).
مهمتك: تحسين سيناريو فيديو للسوشيال ميديا (48 ثانية = 6 مشاهد × 8 ثواني).

الموضوع: ${topicTitle}
الكفاءة: ${competencyInfo.ar} (${competencyInfo.en})
البرنامج: الطفل القائد - من إعداد نجيبة صميدة

قواعد السيناريو:
1. كل جملة يجب أن تكون قصيرة (8 ثواني كحد أقصى للنطق)
2. استخدم لغة عربية واضحة ومناسبة للمراهقين (10-15 سنة)
3. اجعل النصائح الثلاث عملية وقابلة للتطبيق فوراً
4. المشهد الأخير يجب أن يذكر "برنامج الطفل القائد" و"من إعداد نجيبة صميدة"

أعد كتابة السكربتات الستة بشكل أفضل وأكثر تأثيراً.`;

    const userPrompt = `حسّن هذه السكربتات للفيديو:

المشهد 1 (Hook - جذب الانتباه):
"${baseOutput.scenes[0]?.arabicScript || ''}"

المشهد 2 (المشكلة):
"${baseOutput.scenes[1]?.arabicScript || ''}"

المشهد 3 (النصيحة الأولى):
"${baseOutput.scenes[2]?.arabicScript || ''}"

المشهد 4 (النصيحة الثانية):
"${baseOutput.scenes[3]?.arabicScript || ''}"

المشهد 5 (النصيحة الذهبية):
"${baseOutput.scenes[4]?.arabicScript || ''}"

المشهد 6 (CTA):
"${baseOutput.scenes[5]?.arabicScript || ''}"

أعد الإجابة بصيغة JSON:
{
  "scene1": "النص المحسن للـ Hook (سؤال جذاب)",
  "scene2": "النص المحسن للمشكلة",
  "scene3": "النصيحة الأولى: نص عملي محسن",
  "scene4": "النصيحة الثانية: نص عملي محسن",
  "scene5": "والنصيحة الذهبية: أقوى نصيحة",
  "scene6": "النص المحسن للـ CTA (يجب أن يذكر الطفل القائد ونجيبة صميدة)"
}`;

    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    try {
        const enhanced = JSON.parse(content);

        // Update scripts with enhanced versions
        const updatedScenes = baseOutput.scenes.map((scene, index) => {
            const key = `scene${index + 1}` as keyof typeof enhanced;
            const enhancedScript = enhanced[key];

            if (enhancedScript && typeof enhancedScript === 'string') {
                // Also update the animation prompt with the new script
                const updatedAnimationPrompt = scene.animationPrompt.replace(
                    /الحوار بالعربية:[\s\S]*?═══════════════════════════════════════════════\n"[^"]*"/,
                    `الحوار بالعربية:\n═══════════════════════════════════════════════\n"${enhancedScript}"`
                );

                return {
                    ...scene,
                    arabicScript: enhancedScript,
                    animationPrompt: updatedAnimationPrompt
                };
            }
            return scene;
        });

        return {
            ...baseOutput,
            scenes: updatedScenes
        };
    } catch (e) {
        console.error("Failed to parse AI enhancement:", e);
        throw e;
    }
}
