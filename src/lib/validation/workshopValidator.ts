/**
 * Workshop Validation Utility
 *
 * Validates imported JSON workshop data and provides auto-fix capabilities
 */

import type { WorkshopPlanData, WorkshopActivity } from "@/lib/ai/providers/base";

export interface ValidationError {
    path: string; // JSON path (e.g., "timeline[0].mainSteps")
    field: string; // Human-readable field name
    message: string;
    severity: "error" | "warning";
    suggestion?: string;
    value?: any; // Current invalid value
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    fixedPlan?: WorkshopPlanData;
}

/**
 * Validate complete workshop plan
 */
export function validateWorkshopPlan(plan: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Required top-level fields
    if (!plan.title?.ar) {
        errors.push({
            path: "title.ar",
            field: "عنوان الورشة بالعربية",
            message: "العنوان العربي مطلوب",
            severity: "error",
            suggestion: "أضف عنواناً بالعربية في حقل title.ar"
        });
    }

    if (!plan.generalInfo) {
        errors.push({
            path: "generalInfo",
            field: "المعلومات العامة",
            message: "حقل generalInfo مطلوب",
            severity: "error"
        });
    }

    if (!plan.timeline || !Array.isArray(plan.timeline)) {
        errors.push({
            path: "timeline",
            field: "الأنشطة",
            message: "حقل timeline مطلوب ويجب أن يكون مصفوفة",
            severity: "error"
        });
        return { isValid: false, errors, warnings }; // Can't continue without timeline
    }

    // 2. Introduction validation (NEW)
    if (!plan.introduction) {
        warnings.push({
            path: "introduction",
            field: "المقدمة",
            message: "المقدمة غير موجودة - سيتم إنشاء واحدة تلقائياً",
            severity: "warning",
            suggestion: "أضف حقل introduction بثلاث جمل بسيطة"
        });
    } else {
        if (!plan.introduction.phrase1 || !plan.introduction.phrase2 || !plan.introduction.phrase3) {
            warnings.push({
                path: "introduction",
                field: "المقدمة",
                message: "المقدمة يجب أن تحتوي على 3 جمل (phrase1, phrase2, phrase3)",
                severity: "warning"
            });
        }
    }

    // 3. Validate each activity
    plan.timeline.forEach((activity: any, index: number) => {
        const activityErrors = validateActivity(activity, index);
        errors.push(...activityErrors.filter(e => e.severity === "error"));
        warnings.push(...activityErrors.filter(e => e.severity === "warning"));
    });

    // 4. Validate objectives
    if (!plan.objectives || plan.objectives.length < 3) {
        warnings.push({
            path: "objectives",
            field: "الأهداف",
            message: `عدد الأهداف قليل (${plan.objectives?.length || 0}) - يفضل 5 أهداف على الأقل`,
            severity: "warning"
        });
    }

    // 5. Validate materials
    if (!plan.materials || plan.materials.length < 5) {
        warnings.push({
            path: "materials",
            field: "المواد",
            message: "قائمة المواد قصيرة - يفضل 8 مواد على الأقل",
            severity: "warning"
        });
    }

    // 6. Attempt auto-fix for common issues
    const fixedPlan = errors.length === 0 ? autoFixWorkshop(plan, warnings) : undefined;

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        fixedPlan
    };
}

/**
 * Validate individual activity
 */
function validateActivity(activity: any, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const prefix = `timeline[${index}]`;
    const activityLabel = `النشاط ${index + 1}`;

    // Required fields
    const requiredFields = [
        { key: "title", name: "العنوان" },
        { key: "description", name: "الوصف" },
        { key: "activityType", name: "نوع النشاط" },
        { key: "mainSteps", name: "الخطوات الأساسية" },
        { key: "energyLevel", name: "مستوى الطاقة" },
        { key: "whatYouNeed", name: "المواد المطلوبة" },
        { key: "lifeSkillsFocus", name: "المهارات الحياتية" },
        { key: "confidenceBuildingMoment", name: "لحظة بناء الثقة" },
        { key: "visualCues", name: "الإشارات البصرية" },
        { key: "spokenPhrases", name: "العبارات المنطوقة" },
        { key: "whyItMatters", name: "لماذا هذا مهم" },
    ];

    requiredFields.forEach(field => {
        if (!activity[field.key]) {
            errors.push({
                path: `${prefix}.${field.key}`,
                field: `${activityLabel} - ${field.name}`,
                message: `الحقل ${field.name} مطلوب`,
                severity: "error",
                suggestion: `أضف ${field.name} للنشاط "${activity.title || index + 1}"`
            });
        }
    });

    // Validate mainSteps array
    if (activity.mainSteps) {
        if (!Array.isArray(activity.mainSteps)) {
            errors.push({
                path: `${prefix}.mainSteps`,
                field: `${activityLabel} - الخطوات`,
                message: "mainSteps يجب أن يكون مصفوفة",
                severity: "error",
                value: typeof activity.mainSteps
            });
        } else {
            const stepCount = activity.mainSteps.length;
            if (stepCount < 3 || stepCount > 5) {
                errors.push({
                    path: `${prefix}.mainSteps`,
                    field: `${activityLabel} - عدد الخطوات`,
                    message: `عدد الخطوات ${stepCount} - يجب أن يكون بين 3 و 5`,
                    severity: "error",
                    value: stepCount,
                    suggestion: stepCount < 3 ? "أضف المزيد من الخطوات" : "اختصر الخطوات لتكون أوضح"
                });
            }
        }
    }

    // Validate arrays have minimum length
    if (activity.visualCues && activity.visualCues.length < 3) {
        errors.push({
            path: `${prefix}.visualCues`,
            field: `${activityLabel} - الإشارات البصرية`,
            message: `يجب أن يكون هناك 3 إشارات بصرية على الأقل (موجود: ${activity.visualCues.length})`,
            severity: "warning"
        });
    }

    if (activity.spokenPhrases && activity.spokenPhrases.length < 3) {
        errors.push({
            path: `${prefix}.spokenPhrases`,
            field: `${activityLabel} - العبارات المنطوقة`,
            message: `يجب أن يكون هناك 3 عبارات منطوقة على الأقل (موجود: ${activity.spokenPhrases.length})`,
            severity: "warning"
        });
    }

    // Validate energy level enum
    const validEnergyLevels = ["high", "medium", "low"];
    if (activity.energyLevel && !validEnergyLevels.includes(activity.energyLevel)) {
        errors.push({
            path: `${prefix}.energyLevel`,
            field: `${activityLabel} - مستوى الطاقة`,
            message: `قيمة غير صحيحة "${activity.energyLevel}" - يجب أن تكون: high, medium, أو low`,
            severity: "error",
            value: activity.energyLevel
        });
    }

    return errors;
}

/**
 * Auto-fix common issues
 */
function autoFixWorkshop(plan: any, warnings: ValidationError[]): WorkshopPlanData {
    const fixed = JSON.parse(JSON.stringify(plan)); // Deep clone

    // Generate introduction if missing
    if (!fixed.introduction && fixed.title?.ar) {
        const topic = fixed.title.ar.replace("ورشة: ", "").replace("ورشة ", "");
        fixed.introduction = {
            phrase1: `مرحباً أصدقائي! اليوم عندنا ورشة رائعة!`,
            phrase2: `رح نتعلم عن ${topic} بطريقة ممتعة!`,
            phrase3: `رح نلعب ألعاب ونصنع أشياء جميلة ونتعلم مهارات جديدة!`
        };
    }

    // Fix objectives format (if array of strings, convert to objects)
    if (fixed.objectives && Array.isArray(fixed.objectives)) {
        fixed.objectives = fixed.objectives.map((obj: any) => {
            if (typeof obj === "string") {
                return { ar: obj, en: "" };
            }
            return obj;
        });
    }

    // Migrate old activities to V3 format
    if (fixed.timeline) {
        fixed.timeline = fixed.timeline.map((activity: any) => {
            // If using old 'instructions' field, migrate to 'mainSteps'
            if (!activity.mainSteps && activity.instructions) {
                activity.mainSteps = activity.instructions.slice(0, 5); // Take first 5 steps
                activity.estimatedSteps = activity.mainSteps.length;
            }

            // Add default values for missing fields
            if (!activity.lifeSkillsFocus || activity.lifeSkillsFocus.length === 0) {
                // Use diverse life skills as defaults
                activity.lifeSkillsFocus = ["creativity", "teamwork"];
            }

            if (!activity.visualCues || activity.visualCues.length < 3) {
                activity.visualCues = ["عرض المواد", "تمثيل الخطوة الأولى", "تشجيع الأطفال"];
            }

            if (!activity.spokenPhrases || activity.spokenPhrases.length < 3) {
                activity.spokenPhrases = ["يلا نبدأ!", "رائع! أحسنتم!", "من يريد أن يجرب؟"];
            }

            if (!activity.confidenceBuildingMoment) {
                activity.confidenceBuildingMoment = "عندما يكمل الطفل النشاط ويسمع التصفيق من زملائه";
            }

            if (!activity.whyItMatters) {
                activity.whyItMatters = "يساعد هذا النشاط الطفل على تطوير مهاراته وبناء ثقته بنفسه";
            }

            if (!activity.whatYouNeed) {
                activity.whatYouNeed = [];
            }

            if (!activity.complexityLevel) {
                activity.complexityLevel = activity.mainSteps && activity.mainSteps.length <= 3 ? "simple" : "moderate";
            }

            if (!activity.estimatedSteps) {
                activity.estimatedSteps = activity.mainSteps ? activity.mainSteps.length : 3;
            }

            return activity;
        });
    }

    return fixed as WorkshopPlanData;
}

/**
 * Quick validation for JSON syntax only
 */
export function validateJsonSyntax(jsonString: string): { isValid: boolean; error?: string } {
    try {
        JSON.parse(jsonString);
        return { isValid: true };
    } catch (e) {
        return {
            isValid: false,
            error: e instanceof Error ? e.message : "Invalid JSON syntax"
        };
    }
}
