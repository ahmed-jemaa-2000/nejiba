import { NextRequest, NextResponse } from "next/server";
import {
    generateImage,
    getAspectRatio
} from "@/lib/ai/geminigen";
import {
    buildEnhancedPosterPrompt,
    getGeminiStyleForPreset
} from "@/lib/styles/posterStyles";

export interface GenerateImageRequest {
    format: "facebook" | "instagram";
    title: string;
    date: string;
    time: string;
    place: string;
    audience: string;
    description: string;
    descriptionFr?: string;
    // New style options
    styleId?: string;
    colorMoodId?: string;
    visualElementId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate based on mode
        if (body.rawPrompt) {
            // RAW PROMPT MODE: Only need description
            if (!body.description) {
                return NextResponse.json(
                    { error: "Missing required field: description (for rawPrompt mode)" },
                    { status: 400 }
                );
            }
        } else {
            // POSTER MODE: Need title (date/time optional now for flexibility)
            if (!body.title) {
                return NextResponse.json(
                    { error: "Missing required field: title" },
                    { status: 400 }
                );
            }
        }

        // Check for API key
        if (!process.env.GEMINIGEN_API_KEY) {
            console.log("No GeminiGen API key, returning placeholder");
            return NextResponse.json(createPlaceholderResponse(body));
        }

        // Use enhanced prompt builder with style presets if styleId is provided
        let prompt: string;
        let geminiStyle: "None" | "3D Render" | "Illustration" | "Photorealistic" | "Creative" | "Dynamic" | "Graphic Design 3D" = "Illustration";

        // RAW PROMPT MODE: For content kit - pass description directly for realistic scenes
        if (body.rawPrompt && body.description) {
            prompt = body.description;
            geminiStyle = "3D Render"; // Pixar-style for realistic parent-child scenes
            console.log("🎬 Using RAW PROMPT mode for realistic scene");
        } else if (body.styleId) {
            // POSTER MODE: Style-aware prompt builder for Instagram ads with text
            prompt = buildEnhancedPosterPrompt({
                title: body.title,
                topic: body.description || body.title,
                audience: body.audience || "children",
                format: body.format,
                styleId: body.styleId,
                colorMoodId: body.colorMoodId,
                visualElementId: body.visualElementId,
                // Include text in the image for Instagram ads
                date: body.date,
                time: body.time,
                place: body.place || "دار الثقافة بن عروس",
            });
            geminiStyle = getGeminiStyleForPreset(body.styleId);
            console.log(`🎨 Using style preset: ${body.styleId} → GeminiGen style: ${geminiStyle}`);
        } else {
            // Fallback prompt - also include text for ads
            prompt = `Create a professional INSTAGRAM AD poster for "${body.title}".
Include Arabic text: Title "${body.title}", Date "${body.date || "[التاريخ]"}", Time "${body.time || "[الوقت]"}", Location "${body.place || "دار الثقافة بن عروس"}".
Dark elegant background, modern design, suitable for ${body.format === "instagram" ? "Instagram story (9:16)" : "Facebook post (16:9)"}.
Professional Arabic typography, eye-catching for social media.`;
        }

        console.log("🖼️ Generating poster with GeminiGen:", body.title);
        console.log("📝 Prompt preview:", prompt.substring(0, 300) + "...");

        // Generate the image with appropriate style
        const result = await generateImage({
            prompt,
            model: "imagen-pro",
            aspect_ratio: getAspectRatio(body.format),
            style: geminiStyle,
        });

        // Check if still processing (unlikely with imagen-pro but handle it)
        if (result.status === 1) {
            return NextResponse.json({
                status: "processing",
                message: "Image is being generated, please wait...",
                uuid: result.uuid,
            });
        }

        // Return the generated image
        console.log("✅ Poster generated successfully!");
        return NextResponse.json({
            imageUrl: result.generate_result,
            thumbnailUrl: result.thumbnail_small,
            suggestedText: generateSuggestedText(body),
            uuid: result.uuid,
        });
    } catch (error) {
        console.error("❌ Image generation error:", error);

        // Return placeholder on error
        const body = await request.clone().json();
        return NextResponse.json(createPlaceholderResponse(body));
    }
}


function createPlaceholderResponse(data: GenerateImageRequest) {
    const dimensions = data.format === "facebook"
        ? { width: 1200, height: 675 }
        : { width: 675, height: 1200 };

    return {
        imageUrl: `https://placehold.co/${dimensions.width}x${dimensions.height}/1a1a24/6366f1?text=${encodeURIComponent(data.title)}`,
        suggestedText: generateSuggestedText(data),
        isPlaceholder: true,
    };
}

function generateSuggestedText(data: GenerateImageRequest) {
    return {
        ar: generateArabicText(data),
        fr: data.descriptionFr ? generateFrenchText(data) : undefined,
    };
}

function generateArabicText(data: GenerateImageRequest): string {
    const lines = [
        `🌟 ${data.title}`,
        "",
        `📅 التاريخ: ${data.date}`,
        `⏰ الوقت: ${data.time}`,
        `📍 المكان: ${data.place}`,
    ];

    if (data.description) {
        lines.push("", data.description);
    }

    lines.push(
        "",
        "🎯 نادي الطفل القائد",
        "دار الثقافة بن عروس",
        "",
        "#الطفل_القائد #دار_الثقافة_بن_عروس #أنشطة_أطفال"
    );

    return lines.join("\n");
}

function generateFrenchText(data: GenerateImageRequest): string {
    return `🌟 ${data.title}

📅 Date: ${data.date}
⏰ Heure: ${data.time}
📍 Lieu: ${data.place}

${data.descriptionFr || ""}

🎯 Club Leader Kid
Maison de Culture Ben Arous

#LeaderKid #MaisonDeCultureBenArous #ActivitésEnfants`;
}
