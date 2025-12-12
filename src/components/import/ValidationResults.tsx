/**
 * Validation Results Component
 *
 * Displays validation errors and warnings for imported workshop JSON
 */

import { Card, Button } from "@/components/ui";
import type { ValidationError } from "@/lib/validation/workshopValidator";

interface ValidationResultsProps {
    errors: ValidationError[];
    warnings: ValidationError[];
    onAutoFix?: () => void;
    canAutoFix?: boolean;
}

export function ValidationResults({ errors, warnings, onAutoFix, canAutoFix }: ValidationResultsProps) {
    if (errors.length === 0 && warnings.length === 0) {
        return (
            <Card variant="bordered" padding="md" className="border-green-300 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <div>
                        <h3 className="text-green-800 dark:text-green-300 font-bold">
                            التحقق ناجح!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-400">
                            البيانات صحيحة ويمكنك الآن معاينة الورشة أو حفظها
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Errors */}
            {errors.length > 0 && (
                <Card variant="bordered" padding="md" className="border-red-300 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-red-800 dark:text-red-300 font-bold flex items-center gap-2">
                            <span>❌</span>
                            أخطاء يجب إصلاحها ({errors.length})
                        </h3>
                        {canAutoFix && onAutoFix && (
                            <Button size="sm" variant="secondary" onClick={onAutoFix}>
                                إصلاح تلقائي
                            </Button>
                        )}
                    </div>
                    <ul className="space-y-2">
                        {errors.map((error, i) => (
                            <li key={i} className="text-sm text-red-700 dark:text-red-400 bg-white/50 dark:bg-black/20 p-2 rounded">
                                <div className="flex items-start gap-2">
                                    <span className="font-mono text-xs text-red-600 dark:text-red-500 mt-0.5">{error.path}</span>
                                </div>
                                <p className="font-semibold">{error.field}: {error.message}</p>
                                {error.suggestion && (
                                    <p className="text-xs text-red-600 dark:text-red-500 mt-1 flex items-start gap-1">
                                        <span>💡</span>
                                        <span>{error.suggestion}</span>
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <Card variant="bordered" padding="md" className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                    <h3 className="text-yellow-800 dark:text-yellow-300 font-bold mb-3 flex items-center gap-2">
                        <span>⚠️</span>
                        تحذيرات (اختيارية) ({warnings.length})
                    </h3>
                    <ul className="space-y-2">
                        {warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400 bg-white/50 dark:bg-black/20 p-2 rounded">
                                <div className="flex items-start gap-2">
                                    <span className="font-mono text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">{warning.path}</span>
                                </div>
                                <p className="font-semibold">{warning.field}: {warning.message}</p>
                                {warning.suggestion && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1 flex items-start gap-1">
                                        <span>💡</span>
                                        <span>{warning.suggestion}</span>
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
                        ℹ️ التحذيرات لا تمنع الحفظ، لكن إصلاحها يحسن جودة الورشة
                    </p>
                </Card>
            )}
        </div>
    );
}
