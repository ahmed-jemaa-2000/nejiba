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

    // Crafts - أعمال يدوية
    { id: "scissors", name: "مقصات آمنة", nameEn: "Safe Scissors", icon: "✂️", category: "craft" },
    { id: "glue", name: "صمغ", nameEn: "Glue", icon: "🧴", category: "craft" },
    { id: "tape", name: "شريط لاصق", nameEn: "Tape", icon: "📦", category: "craft" },
    { id: "cardboard", name: "كرتون مقوى", nameEn: "Cardboard", icon: "📦", category: "craft" },
    { id: "fabric", name: "قماش", nameEn: "Fabric", icon: "🧵", category: "craft" },
    { id: "yarn", name: "خيوط صوف", nameEn: "Yarn", icon: "🧶", category: "craft" },
    { id: "beads", name: "خرز", nameEn: "Beads", icon: "📿", category: "craft" },
    { id: "clay", name: "صلصال", nameEn: "Clay", icon: "🎭", category: "craft" },
    { id: "paint", name: "ألوان مائية", nameEn: "Watercolors", icon: "🎨", category: "craft" },
    { id: "brushes", name: "فُرَش رسم", nameEn: "Paint Brushes", icon: "🖌️", category: "craft" },

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
 */
export function suggestMaterialsForTopic(topic: string): string[] {
    const topicLower = topic.toLowerCase();
    const suggestions: string[] = ["paper_white", "pencils", "pens_colored"]; // Always include basics

    // Art-related topics
    if (topicLower.includes("رسم") || topicLower.includes("إبداع") || topicLower.includes("فن") || topicLower.includes("art")) {
        suggestions.push("paper_colored", "paint", "brushes", "crayons");
    }

    // Movement/Leadership topics
    if (topicLower.includes("قيادة") || topicLower.includes("حركة") || topicLower.includes("رياضة") || topicLower.includes("نشاط")) {
        suggestions.push("ball", "cones", "mats", "balloons");
    }

    // Emotional/Social topics
    if (topicLower.includes("مشاعر") || topicLower.includes("عاطف") || topicLower.includes("تواصل") || topicLower.includes("ثقة")) {
        suggestions.push("emotion_cards", "sticky_notes", "puppets");
    }

    // Crafts topics
    if (topicLower.includes("يدوي") || topicLower.includes("صنع") || topicLower.includes("craft")) {
        suggestions.push("scissors", "glue", "cardboard", "fabric", "yarn");
    }

    // Music/Performance topics
    if (topicLower.includes("موسيقى") || topicLower.includes("تمثيل") || topicLower.includes("عرض")) {
        suggestions.push("musical_instruments", "costumes", "masks", "microphone");
    }

    // Always good to have
    suggestions.push("whiteboard", "reward_stickers", "name_tags");

    return [...new Set(suggestions)]; // Remove duplicates
}

export default { MATERIALS_LIBRARY, MATERIAL_CATEGORIES, getMaterialsByCategory, getMaterialNamesForPrompt, suggestMaterialsForTopic };
