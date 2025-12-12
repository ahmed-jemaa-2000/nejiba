/**
 * Workshop Materials Library
 * 
 * Common materials available for children's workshops at cultural centers.
 * Users can select from these to customize their workshop plan.
 */

export interface MaterialItem {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    category: "basic" | "craft" | "tech" | "movement" | "special";
}

export interface MaterialCategory {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
    { id: "basic", name: "أساسيات", nameEn: "Basics", icon: "📝" },
    { id: "craft", name: "أعمال يدوية", nameEn: "Crafts", icon: "✂️" },
    { id: "tech", name: "تقنية", nameEn: "Tech", icon: "💻" },
    { id: "movement", name: "حركة", nameEn: "Movement", icon: "🏃" },
    { id: "special", name: "خاصة", nameEn: "Special", icon: "⭐" },
];

export const MATERIALS_LIBRARY: MaterialItem[] = [
    // Basic - الأساسيات
    { id: "paper_white", name: "ورق أبيض A4", nameEn: "White A4 Paper", icon: "📄", category: "basic" },
    { id: "paper_colored", name: "ورق ملون", nameEn: "Colored Paper", icon: "🎨", category: "basic" },
    { id: "pencils", name: "أقلام رصاص", nameEn: "Pencils", icon: "✏️", category: "basic" },
    { id: "pens_colored", name: "أقلام ملونة", nameEn: "Colored Pens", icon: "🖍️", category: "basic" },
    { id: "markers", name: "أقلام فلوماستر", nameEn: "Markers", icon: "🖊️", category: "basic" },
    { id: "crayons", name: "ألوان شمعية", nameEn: "Crayons", icon: "🖍️", category: "basic" },
    { id: "notebook", name: "دفاتر", nameEn: "Notebooks", icon: "📓", category: "basic" },
    { id: "whiteboard", name: "سبورة بيضاء", nameEn: "Whiteboard", icon: "📋", category: "basic" },
    { id: "sticky_notes", name: "ملاحظات لاصقة", nameEn: "Sticky Notes", icon: "📝", category: "basic" },

    // Crafts - أعمال يدوية (EXPANDED for creative activities)
    { id: "scissors", name: "مقصات آمنة", nameEn: "Safe Scissors", icon: "✂️", category: "craft" },
    { id: "glue", name: "صمغ", nameEn: "Glue", icon: "🧴", category: "craft" },
    { id: "glue_stick", name: "صمغ عصا", nameEn: "Glue Stick", icon: "🖍️", category: "craft" },
    { id: "tape", name: "شريط لاصق", nameEn: "Tape", icon: "📦", category: "craft" },
    { id: "cardboard", name: "كرتون مقوى", nameEn: "Cardboard", icon: "📦", category: "craft" },
    { id: "cardboard_boxes", name: "صناديق كرتون", nameEn: "Cardboard Boxes", icon: "📦", category: "craft" },
    { id: "fabric", name: "قماش", nameEn: "Fabric", icon: "🧵", category: "craft" },
    { id: "fabric_scraps", name: "قصاصات قماش", nameEn: "Fabric Scraps", icon: "🧵", category: "craft" },
    { id: "yarn", name: "خيوط صوف", nameEn: "Yarn", icon: "🧶", category: "craft" },
    { id: "string", name: "خيط", nameEn: "String/Twine", icon: "🧵", category: "craft" },
    { id: "beads", name: "خرز", nameEn: "Beads", icon: "📿", category: "craft" },
    { id: "clay", name: "صلصال", nameEn: "Clay", icon: "🎭", category: "craft" },
    { id: "paint", name: "ألوان مائية", nameEn: "Watercolors", icon: "🎨", category: "craft" },
    { id: "paint_poster", name: "ألوان بوستر", nameEn: "Poster Paint", icon: "🎨", category: "craft" },
    { id: "brushes", name: "فُرَش رسم", nameEn: "Paint Brushes", icon: "🖌️", category: "craft" },
    { id: "sponges", name: "إسفنجات", nameEn: "Sponges", icon: "🧽", category: "craft" },

    // Recyclables (NEW - for creative making)
    { id: "plastic_cups", name: "أكواب بلاستيك", nameEn: "Plastic Cups", icon: "🥤", category: "craft" },
    { id: "plastic_bottles", name: "قوارير بلاستيكية", nameEn: "Plastic Bottles", icon: "♻️", category: "craft" },
    { id: "bottle_caps", name: "أغطية قوارير", nameEn: "Bottle Caps", icon: "⭕", category: "craft" },
    { id: "egg_cartons", name: "كراتين البيض", nameEn: "Egg Cartons", icon: "🥚", category: "craft" },
    { id: "newspapers", name: "جرائد قديمة", nameEn: "Old Newspapers", icon: "📰", category: "craft" },
    { id: "magazines", name: "مجلات قديمة", nameEn: "Old Magazines", icon: "📖", category: "craft" },

    // Process Art Materials (NEW - for art & expression activities)
    { id: "cotton_balls", name: "كرات قطن", nameEn: "Cotton Balls", icon: "☁️", category: "craft" },
    { id: "cotton_swabs", name: "أعواد قطن", nameEn: "Cotton Swabs", icon: "🦴", category: "craft" },
    { id: "tissue_paper", name: "ورق مناديل ملون", nameEn: "Colored Tissue Paper", icon: "🎀", category: "craft" },
    { id: "bubble_solution", name: "محلول فقاعات", nameEn: "Bubble Solution", icon: "🫧", category: "craft" },
    { id: "straws", name: "شفاطات (قش)", nameEn: "Straws", icon: "🥤", category: "craft" },
    { id: "foil", name: "ورق ألمنيوم", nameEn: "Aluminum Foil", icon: "✨", category: "craft" },
    { id: "paper_plates", name: "صحون ورقية", nameEn: "Paper Plates", icon: "🍽️", category: "craft" },
    { id: "popsicle_sticks", name: "أعواد خشبية", nameEn: "Popsicle Sticks", icon: "🍡", category: "craft" },

    // Tech - تقنية
    { id: "projector", name: "عارض (بروجكتور)", nameEn: "Projector", icon: "📽️", category: "tech" },
    { id: "laptop", name: "حاسوب محمول", nameEn: "Laptop", icon: "💻", category: "tech" },
    { id: "speakers", name: "مكبر صوت", nameEn: "Speakers", icon: "🔊", category: "tech" },
    { id: "microphone", name: "ميكروفون", nameEn: "Microphone", icon: "🎤", category: "tech" },
    { id: "camera", name: "كاميرا", nameEn: "Camera", icon: "📷", category: "tech" },
    { id: "timer", name: "ساعة توقيت", nameEn: "Timer", icon: "⏱️", category: "tech" },

    // Movement - حركة
    { id: "ball", name: "كرة", nameEn: "Ball", icon: "⚽", category: "movement" },
    { id: "hula_hoop", name: "طوق (هولا هوب)", nameEn: "Hula Hoop", icon: "⭕", category: "movement" },
    { id: "rope", name: "حبل قفز", nameEn: "Jump Rope", icon: "🪢", category: "movement" },
    { id: "cones", name: "أقماع تنظيم", nameEn: "Cones", icon: "🔶", category: "movement" },
    { id: "mats", name: "حصائر أرضية", nameEn: "Floor Mats", icon: "🧘", category: "movement" },
    { id: "balloons", name: "بالونات", nameEn: "Balloons", icon: "🎈", category: "movement" },

    // Special - خاصة
    { id: "puppets", name: "دمى متحركة", nameEn: "Puppets", icon: "🧸", category: "special" },
    { id: "costumes", name: "أزياء تنكرية", nameEn: "Costumes", icon: "👗", category: "special" },
    { id: "masks", name: "أقنعة", nameEn: "Masks", icon: "🎭", category: "special" },
    { id: "musical_instruments", name: "آلات موسيقية", nameEn: "Musical Instruments", icon: "🎵", category: "special" },
    { id: "story_cards", name: "بطاقات قصص", nameEn: "Story Cards", icon: "🃏", category: "special" },
    { id: "emotion_cards", name: "بطاقات مشاعر", nameEn: "Emotion Cards", icon: "😊", category: "special" },
    { id: "reward_stickers", name: "ملصقات مكافآت", nameEn: "Reward Stickers", icon: "⭐", category: "special" },
    { id: "certificates", name: "شهادات", nameEn: "Certificates", icon: "📜", category: "special" },
    { id: "snacks", name: "وجبات خفيفة", nameEn: "Snacks", icon: "🍪", category: "special" },
    { id: "name_tags", name: "بطاقات أسماء", nameEn: "Name Tags", icon: "🏷️", category: "special" },
];

/**
 * Get materials by category
 */
export function getMaterialsByCategory(category: MaterialItem["category"]): MaterialItem[] {
    return MATERIALS_LIBRARY.filter(m => m.category === category);
}

/**
 * Get material names for prompt
 */
export function getMaterialNamesForPrompt(selectedIds: string[]): string[] {
    return selectedIds
        .map(id => MATERIALS_LIBRARY.find(m => m.id === id)?.name)
        .filter(Boolean) as string[];
}

/**
 * Get default materials suggestion based on topic
 * UPDATED: Now includes creative/craft materials for new activity types
 */
export function suggestMaterialsForTopic(topic: string): string[] {
    const topicLower = topic.toLowerCase();
    const suggestions: string[] = ["paper_white", "paper_colored", "markers", "pencils"]; // Always include basics

    // Creativity topics (EXPANDED - now includes making/crafting)
    if (topicLower.includes("إبداع") || topicLower.includes("ابداع") || topicLower.includes("creativity") ||
        topicLower.includes("صنع") || topicLower.includes("فن")) {
        suggestions.push(
            // Process art materials
            "paint", "brushes", "sponges", "string", "cotton_balls",
            // Making materials
            "scissors", "glue", "cardboard_boxes", "plastic_cups",
            // Recyclables
            "bottle_caps", "newspapers", "tissue_paper"
        );
    }

    // Confidence/Self-esteem topics (NEW - crafting helps confidence)
    if (topicLower.includes("ثقة") || topicLower.includes("شجاعة") || topicLower.includes("confidence") ||
        topicLower.includes("جرأة") || topicLower.includes("self")) {
        suggestions.push(
            "scissors", "glue", "markers", "plastic_cups",
            "paper_colored", "stickers", "emotion_cards"
        );
    }

    // Friendship/Social topics (NEW - collaborative making)
    if (topicLower.includes("صداقة") || topicLower.includes("friendship") ||
        topicLower.includes("تعاون") || topicLower.includes("cooperation")) {
        suggestions.push(
            "paper_colored", "markers", "glue", "cushions",
            "story_cards", "emotion_cards"
        );
    }

    // Art/Expression topics (EXPANDED - process art focus)
    if (topicLower.includes("رسم") || topicLower.includes("تعبير") || topicLower.includes("art") ||
        topicLower.includes("expression")) {
        suggestions.push(
            "paint", "brushes", "sponges", "cotton_swabs",
            "string", "bubble_solution", "straws", "tissue_paper"
        );
    }

    // Movement/Leadership topics (KEEP EXISTING)
    if (topicLower.includes("قيادة") || topicLower.includes("حركة") || topicLower.includes("رياضة") ||
        topicLower.includes("نشاط") || topicLower.includes("leadership")) {
        suggestions.push("ball", "cones", "mats", "balloons", "hula_hoop");
    }

    // Emotional/Reflection topics (EXPANDED)
    if (topicLower.includes("مشاعر") || topicLower.includes("عاطف") || topicLower.includes("تواصل") ||
        topicLower.includes("emotional") || topicLower.includes("feelings")) {
        suggestions.push("emotion_cards", "story_cards", "puppets", "cushions");
    }

    // Storytelling/Narrative topics (NEW)
    if (topicLower.includes("قصة") || topicLower.includes("رواية") || topicLower.includes("story") ||
        topicLower.includes("narrative")) {
        suggestions.push("story_cards", "puppets", "cushions", "paper_colored", "crayons");
    }

    // Making/Building topics (NEW)
    if (topicLower.includes("بناء") || topicLower.includes("صنع") || topicLower.includes("يدوي") ||
        topicLower.includes("craft") || topicLower.includes("making")) {
        suggestions.push(
            "scissors", "glue", "tape", "cardboard", "cardboard_boxes",
            "plastic_bottles", "bottle_caps", "egg_cartons",
            "popsicle_sticks", "string", "yarn"
        );
    }

    // Music/Performance topics (KEEP EXISTING)
    if (topicLower.includes("موسيقى") || topicLower.includes("تمثيل") || topicLower.includes("عرض") ||
        topicLower.includes("music") || topicLower.includes("drama")) {
        suggestions.push("musical_instruments", "costumes", "masks", "scarves");
    }

    // Always useful for any workshop
    suggestions.push("whiteboard", "sticky_notes", "timer", "reward_stickers", "name_tags");

    return [...new Set(suggestions)]; // Remove duplicates
}

export default { MATERIALS_LIBRARY, MATERIAL_CATEGORIES, getMaterialsByCategory, getMaterialNamesForPrompt, suggestMaterialsForTopic };
