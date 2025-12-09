import { NextRequest, NextResponse } from "next/server";
import {
    generateImage,
    buildPosterPrompt,
    getAspectRatio
} from "@/lib/ai/geminigen";

export interface GenerateImageRequest {
    format: "facebook" | "instagram";
    title: string;
    date: string;
    time: string;
    place: string;
    audience: string;
    description: string;
    descriptionFr?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateImageRequest = await request.json();

        // Validate required fields
        if (!body.title || !body.date || !body.time) {
            return NextResponse.json(
                { error: "Missing required fields: title, date, time" },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINIGEN_API_KEY) {
            console.log("No GeminiGen API key, returning placeholder");
            return NextResponse.json(createPlaceholderResponse(body));
        }

        // Build the optimized prompt
        let description = body.description;

        // Safety: Replace TBD/Placeholders with actual values if provided
        if (body.date && body.date !== "TBD") {
            description = description.replace(/Date:\s*(TBD|\(To Be Verified\)|\[Date\])/gi, `Date: ${body.date}`);
        }
        if (body.time && body.time !== "TBD") {
            description = description.replace(/Time:\s*(TBD|\(To Be Verified\)|\[Time\])/gi, `Time: ${body.time}`);
        }

        const prompt = buildPosterPrompt({
            title: body.title,
            topic: description,
            audience: body.audience,
            format: body.format,
        });

        console.log("Generating poster with GeminiGen:", body.title);
        console.log("Prompt:", prompt.substring(0, 200) + "...");

        // Generate the image
        const result = await generateImage({
            prompt,
            model: "imagen-4-fast",
            aspect_ratio: getAspectRatio(body.format),
            style: "Illustration", // Good for event posters
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
        return NextResponse.json({
            imageUrl: result.generate_result,
            thumbnailUrl: result.thumbnail_small,
            suggestedText: generateSuggestedText(body),
            uuid: result.uuid,
        });
    } catch (error) {
        console.error("Image generation error:", error);

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
