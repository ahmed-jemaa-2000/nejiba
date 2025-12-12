/**
 * Activity Type Taxonomy for Kids Workshops
 *
 * This file defines 11 diverse activity types beyond just games,
 * with metadata for clarity, energy levels, and life skills alignment.
 *
 * Design Principles:
 * - Clarity First: Each type specifies max steps (3-5 for simple activities)
 * - Energy Balance: Mix of high/medium/low energy types
 * - Skills-Aligned: Each type maps to life skills (confidence, bravery, friendship)
 * - Materials-Conscious: Emphasize cheap, accessible materials
 */

export type ActivityType =
  // Creative & Making Activities (NEW)
  | "صنع وإبداع"        // Creative Making/Crafts
  | "فن وتعبير"         // Art & Expression

  // Cognitive Activities (NEW + ENHANCED)
  | "حل مشكلات"         // Problem-Solving Challenges
  | "عصف ذهني"          // Group Brainstorming
  | "استكشاف"           // Exploration & Discovery

  // Reflective & Social Activities (NEW)
  | "تأمل وتفكير"       // Reflection & Mindfulness
  | "قصص ورواية"        // Storytelling & Narrative
  | "نقاش ومشاركة"      // Discussion & Sharing

  // Physical & Expressive Activities (EXISTING - SIMPLIFIED)
  | "حركة"              // Movement/Physical Games
  | "تمثيل"             // Drama/Acting
  | "موسيقى"            // Music & Rhythm

  // Collaborative Activities (EXISTING)
  | "تحدي فريق"         // Team Challenges (simplified)
  | "تعاون";            // Collaboration

export type ComplexityLevel = "simple" | "moderate" | "complex";
export type EnergyLevel = "low" | "medium" | "high";
export type InstructionStyle = "visual" | "verbal" | "hands-on";

export interface ActivityTypeMetadata {
  type: ActivityType;
  nameEn: string;
  nameAr: string;
  energyLevel: EnergyLevel;
  complexity: ComplexityLevel;

  // Clarity markers - enforce simplicity
  stepsCount: {
    min: number;
    max: number;
  };
  instructionStyle: InstructionStyle;

  // Developmental appropriateness
  bestForAges: string[];
  attentionSpanMinutes: number;

  // Life skills alignment
  primarySkills: string[];
  confidenceBuildingNature: string;

  // Material requirements
  typicalMaterials: string[];

  // Usage guidelines
  bestUsedIn: string[];  // Which workshop blocks work best
  description: string;
}

/**
 * Complete Activity Type Library
 * Defines metadata for all 11 activity types
 */
export const ACTIVITY_TYPE_LIBRARY: Record<ActivityType, ActivityTypeMetadata> = {
  "صنع وإبداع": {
    type: "صنع وإبداع",
    nameAr: "صنع وإبداع",
    nameEn: "Creative Making",
    energyLevel: "medium",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "hands-on",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 25,
    primarySkills: ["creativity", "confidence", "self-expression", "fine-motor"],
    confidenceBuildingNature: "Child completes tangible creation - 'I made this!'",
    typicalMaterials: [
      "colored paper", "scissors", "glue", "cardboard",
      "plastic cups", "bottle caps", "recyclables", "markers", "tape"
    ],
    bestUsedIn: ["Create & Try", "Explore"],
    description: "Hands-on crafting and building activities using cheap materials. Focus on process over perfect product. Examples: Courage Jar, Cardboard Robot, Paper Masks"
  },

  "فن وتعبير": {
    type: "فن وتعبير",
    nameAr: "فن وتعبير",
    nameEn: "Art & Expression",
    energyLevel: "low",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "visual",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 20,
    primarySkills: ["self-expression", "emotional-awareness", "creativity", "confidence"],
    confidenceBuildingNature: "Child expresses emotions/identity through art - 'This is me!'",
    typicalMaterials: [
      "paper", "markers", "paint", "string", "sponges",
      "cotton balls", "bubble solution", "collage materials"
    ],
    bestUsedIn: ["Create & Try", "Reflect & Share"],
    description: "Process art activities focused on emotional expression. No 'right way' to do it. Examples: String Painting, Hero Poster, Emotion Faces, Splatter Art"
  },

  "حل مشكلات": {
    type: "حل مشكلات",
    nameAr: "حل مشكلات",
    nameEn: "Problem-Solving",
    energyLevel: "medium",
    complexity: "moderate",
    stepsCount: { min: 4, max: 6 },
    instructionStyle: "hands-on",
    bestForAges: ["8-10", "10-12", "8-14"],
    attentionSpanMinutes: 20,
    primarySkills: ["problem-solving", "critical-thinking", "persistence", "teamwork"],
    confidenceBuildingNature: "Child solves challenge through experimentation - 'I figured it out!'",
    typicalMaterials: [
      "cardboard", "tape", "paper", "cups", "straws",
      "balloons", "string", "recyclables", "puzzle materials"
    ],
    bestUsedIn: ["Explore", "Create & Try"],
    description: "Simple challenges with clear goals, multiple solutions OK. Examples: Build a Bridge, Paper Tower Challenge, Scavenger Hunt, Mystery Box"
  },

  "عصف ذهني": {
    type: "عصف ذهني",
    nameAr: "عصف ذهني",
    nameEn: "Brainstorming",
    energyLevel: "medium",
    complexity: "simple",
    stepsCount: { min: 3, max: 4 },
    instructionStyle: "verbal",
    bestForAges: ["8-10", "10-12", "8-14"],
    attentionSpanMinutes: 15,
    primarySkills: ["divergent-thinking", "creativity", "confidence", "speaking-up"],
    confidenceBuildingNature: "Child's 'crazy idea' gets celebrated - 'My ideas matter!'",
    typicalMaterials: [
      "whiteboard", "markers", "paper", "sticky notes",
      "common objects for prompts (cups, balls, scarves)"
    ],
    bestUsedIn: ["Explore", "Create & Try"],
    description: "Open-ended idea generation - all ideas are good! Examples: 100 Uses for a Cup, 'What If' Scenarios, Idea Storm, Crazy Inventions"
  },

  "استكشاف": {
    type: "استكشاف",
    nameAr: "استكشاف",
    nameEn: "Exploration",
    energyLevel: "medium",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "hands-on",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 18,
    primarySkills: ["curiosity", "discovery", "observation", "bravery"],
    confidenceBuildingNature: "Child discovers something new - 'I found it!'",
    typicalMaterials: [
      "mystery boxes", "sensory materials", "magnifying glasses",
      "natural objects", "texture cards", "sound makers"
    ],
    bestUsedIn: ["Explore", "Welcome Circle"],
    description: "Discovery-based activities with surprise elements. Examples: Mystery Box, Texture Hunt, Sound Detective, What's in the Bag?"
  },

  "تأمل وتفكير": {
    type: "تأمل وتفكير",
    nameAr: "تأمل وتفكير",
    nameEn: "Reflection",
    energyLevel: "low",
    complexity: "simple",
    stepsCount: { min: 3, max: 4 },
    instructionStyle: "verbal",
    bestForAges: ["6-8", "8-10", "10-12", "8-14"],
    attentionSpanMinutes: 12,
    primarySkills: ["self-awareness", "emotional-regulation", "mindfulness", "confidence"],
    confidenceBuildingNature: "Child articulates feelings/growth - 'I understand myself!'",
    typicalMaterials: [
      "cushions", "calm music", "breathing cards",
      "emotion cards", "reflection prompts", "journals"
    ],
    bestUsedIn: ["Reflect & Share", "Welcome Circle", "Celebrate & Close"],
    description: "Quiet moments for thinking about feelings/experiences. Pairs or small groups. Examples: Feelings Check-In, Gratitude Circle, 'What Made Me Brave Today?'"
  },

  "قصص ورواية": {
    type: "قصص ورواية",
    nameAr: "قصص ورواية",
    nameEn: "Storytelling",
    energyLevel: "low",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "verbal",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 15,
    primarySkills: ["communication", "vulnerability", "empathy", "bravery"],
    confidenceBuildingNature: "Child shares personal story and feels heard - 'My story matters!'",
    typicalMaterials: [
      "story cards", "puppets", "props", "cushions",
      "paper", "drawing materials", "story prompts"
    ],
    bestUsedIn: ["Explore", "Reflect & Share"],
    description: "Personal storytelling, not reading books. Examples: 'The Day I Was Brave', Story Circle, Puppet Shows, Collaborative Tales"
  },

  "نقاش ومشاركة": {
    type: "نقاش ومشاركة",
    nameAr: "نقاش ومشاركة",
    nameEn: "Discussion",
    energyLevel: "low",
    complexity: "simple",
    stepsCount: { min: 3, max: 4 },
    instructionStyle: "verbal",
    bestForAges: ["8-10", "10-12", "8-14"],
    attentionSpanMinutes: 12,
    primarySkills: ["communication", "listening", "empathy", "friendship"],
    confidenceBuildingNature: "Child's opinion is valued by peers - 'I belong!'",
    typicalMaterials: [
      "talking stick", "circle seating", "discussion prompts",
      "emotion cards", "whiteboard for notes"
    ],
    bestUsedIn: ["Reflect & Share", "Celebrate & Close"],
    description: "Structured sharing in pairs or small groups. Examples: Partner Share, Circle Talk, 'One Thing I Learned', Group Debrief"
  },

  "حركة": {
    type: "حركة",
    nameAr: "حركة",
    nameEn: "Movement",
    energyLevel: "high",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "visual",
    bestForAges: ["6-8", "8-10", "10-12", "8-14"],
    attentionSpanMinutes: 12,
    primarySkills: ["gross-motor", "energy-release", "body-confidence", "teamwork"],
    confidenceBuildingNature: "Child succeeds at physical challenge - 'My body is strong!'",
    typicalMaterials: [
      "balls", "balloons", "scarves", "cones", "hula hoops",
      "bean bags", "music player", "timer"
    ],
    bestUsedIn: ["Welcome Circle", "Move & Energize"],
    description: "SIMPLIFIED physical games (less rules than before). Examples: Freeze Dance, Animal Walks, Mirror Game, Friendly Staring Contest"
  },

  "تمثيل": {
    type: "تمثيل",
    nameAr: "تمثيل",
    nameEn: "Drama",
    energyLevel: "medium",
    complexity: "moderate",
    stepsCount: { min: 4, max: 6 },
    instructionStyle: "visual",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 15,
    primarySkills: ["self-expression", "imagination", "confidence", "empathy"],
    confidenceBuildingNature: "Child performs/acts without judgment - 'I can be anyone!'",
    typicalMaterials: [
      "costumes", "props", "masks", "puppets",
      "emotion cards", "scenario cards", "fabric", "scarves"
    ],
    bestUsedIn: ["Explore", "Create & Try", "Move & Energize"],
    description: "Role-play and acting activities (non-competitive). Examples: Emotion Charades, Role-Play Scenarios, Puppet Theatre, Freeze Frame"
  },

  "موسيقى": {
    type: "موسيقى",
    nameAr: "موسيقى",
    nameEn: "Music",
    energyLevel: "high",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "visual",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 12,
    primarySkills: ["rhythm", "listening", "coordination", "self-expression"],
    confidenceBuildingNature: "Child creates music/rhythm - 'I made sounds!'",
    typicalMaterials: [
      "simple instruments", "cups", "spoons", "bottles",
      "rice shakers", "music player", "body percussion"
    ],
    bestUsedIn: ["Welcome Circle", "Move & Energize", "Celebrate & Close"],
    description: "Rhythm and music-making activities. Examples: Cup Rhythms, Body Percussion, Sound Patterns, Musical Freeze Dance"
  },

  "تحدي فريق": {
    type: "تحدي فريق",
    nameAr: "تحدي فريق",
    nameEn: "Team Challenge",
    energyLevel: "high",
    complexity: "moderate",
    stepsCount: { min: 4, max: 6 },
    instructionStyle: "hands-on",
    bestForAges: ["8-10", "10-12", "8-14"],
    attentionSpanMinutes: 18,
    primarySkills: ["teamwork", "communication", "problem-solving", "leadership"],
    confidenceBuildingNature: "Team succeeds together - 'We did it!'",
    typicalMaterials: [
      "balls", "ropes", "hula hoops", "cones", "balloons",
      "cups", "cardboard", "tape", "challenge materials"
    ],
    bestUsedIn: ["Create & Try", "Move & Energize"],
    description: "SIMPLIFIED team challenges (focus on cooperation, not winning). Examples: Human Knot, Bridge Building, Group Juggle, Circle Keep-Up"
  },

  "تعاون": {
    type: "تعاون",
    nameAr: "تعاون",
    nameEn: "Collaboration",
    energyLevel: "medium",
    complexity: "simple",
    stepsCount: { min: 3, max: 5 },
    instructionStyle: "hands-on",
    bestForAges: ["6-8", "8-10", "10-12"],
    attentionSpanMinutes: 15,
    primarySkills: ["cooperation", "sharing", "communication", "friendship"],
    confidenceBuildingNature: "Child works successfully with others - 'I'm a good partner!'",
    typicalMaterials: [
      "shared materials", "collaborative art supplies",
      "building materials", "common objects", "partner cards"
    ],
    bestUsedIn: ["Create & Try", "Explore", "Celebrate & Close"],
    description: "Partner or small group activities focused on working together. Examples: Partner Drawing, Collaborative Mural, Pass the Pattern, Group Story"
  }
};

/**
 * Get activity type metadata by type
 */
export function getActivityTypeMetadata(type: ActivityType): ActivityTypeMetadata {
  return ACTIVITY_TYPE_LIBRARY[type];
}

/**
 * Get all activity types suitable for a given energy level
 */
export function getActivityTypesByEnergy(energy: EnergyLevel): ActivityType[] {
  return Object.values(ACTIVITY_TYPE_LIBRARY)
    .filter(metadata => metadata.energyLevel === energy)
    .map(metadata => metadata.type);
}

/**
 * Get all activity types suitable for a given workshop block
 */
export function getActivityTypesForBlock(blockName: string): ActivityType[] {
  return Object.values(ACTIVITY_TYPE_LIBRARY)
    .filter(metadata => metadata.bestUsedIn.some(block =>
      block.toLowerCase().includes(blockName.toLowerCase())
    ))
    .map(metadata => metadata.type);
}

/**
 * Get all activity types that develop a specific life skill
 */
export function getActivityTypesBySkill(skill: string): ActivityType[] {
  return Object.values(ACTIVITY_TYPE_LIBRARY)
    .filter(metadata => metadata.primarySkills.includes(skill.toLowerCase()))
    .map(metadata => metadata.type);
}

/**
 * Check if an activity type is suitable for an age range
 */
export function isActivityTypeSuitableForAge(type: ActivityType, ageRange: string): boolean {
  const metadata = ACTIVITY_TYPE_LIBRARY[type];
  return metadata.bestForAges.includes(ageRange);
}

/**
 * Get recommended max steps for an activity type
 */
export function getMaxStepsForType(type: ActivityType): number {
  const metadata = ACTIVITY_TYPE_LIBRARY[type];
  return metadata.stepsCount.max;
}

/**
 * Validate activity type diversity in a workshop
 * Returns true if diversity is good (min 4 different types)
 */
export function validateActivityDiversity(activityTypes: ActivityType[]): {
  isValid: boolean;
  uniqueCount: number;
  message: string;
} {
  const uniqueTypes = new Set(activityTypes);
  const uniqueCount = uniqueTypes.size;

  if (uniqueCount >= 5) {
    return {
      isValid: true,
      uniqueCount,
      message: `✅ Excellent diversity: ${uniqueCount} different activity types`
    };
  } else if (uniqueCount >= 4) {
    return {
      isValid: true,
      uniqueCount,
      message: `✅ Good diversity: ${uniqueCount} different activity types`
    };
  } else {
    return {
      isValid: false,
      uniqueCount,
      message: `⚠️ Low diversity: only ${uniqueCount} activity types (need at least 4)`
    };
  }
}

/**
 * Validate energy balance in a workshop
 * Target: 40% high, 40% medium, 20% low
 */
export function validateEnergyBalance(activityTypes: ActivityType[]): {
  isValid: boolean;
  highPercent: number;
  mediumPercent: number;
  lowPercent: number;
  message: string;
} {
  const energyLevels = activityTypes.map(type => ACTIVITY_TYPE_LIBRARY[type].energyLevel);
  const total = energyLevels.length;

  const highCount = energyLevels.filter(e => e === "high").length;
  const mediumCount = energyLevels.filter(e => e === "medium").length;
  const lowCount = energyLevels.filter(e => e === "low").length;

  const highPercent = Math.round((highCount / total) * 100);
  const mediumPercent = Math.round((mediumCount / total) * 100);
  const lowPercent = Math.round((lowCount / total) * 100);

  // Good if high energy is less than 60%
  const isValid = highPercent <= 60;

  return {
    isValid,
    highPercent,
    mediumPercent,
    lowPercent,
    message: isValid
      ? `✅ Good energy balance: ${highPercent}% high, ${mediumPercent}% medium, ${lowPercent}% low`
      : `⚠️ Too much high energy: ${highPercent}% (should be ~40%)`
  };
}
