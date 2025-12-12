/**
 * Import Instructions Component
 *
 * Provides step-by-step guide for users to import workshop JSON from ChatGPT
 */

import { Card } from "@/components/ui";

export function ImportInstructions() {
    return (
        <Card variant="bordered" padding="md" className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
                📥 كيفية استيراد خطة ورشة من ChatGPT
            </h2>

            <ol className="space-y-3 text-foreground-secondary">
                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                        <p className="font-medium text-foreground">احصل على البرومبت JSON</p>
                        <p className="text-sm">انتقل إلى صفحة إنشاء الورشة واضغط على "معاينة JSON Prompts"</p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                        <p className="font-medium text-foreground">انسخ البرومبتين</p>
                        <p className="text-sm">انسخ كل من System Prompt و User Prompt</p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                        <p className="font-medium text-foreground">استخدم ChatGPT</p>
                        <p className="text-sm">الصق البرومبتين في ChatGPT (يُفضل GPT-4 أو أحدث)</p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                        <p className="font-medium text-foreground">احصل على JSON</p>
                        <p className="text-sm">انتظر حتى يعطيك ChatGPT نتيجة JSON كاملة (تبدأ بـ {"{"} وتنتهي بـ {"}"})</p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">5</span>
                    <div>
                        <p className="font-medium text-foreground">الصق هنا</p>
                        <p className="text-sm">انسخ نتيجة JSON كاملة والصقها في المحرر أدناه</p>
                    </div>
                </li>

                <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">6</span>
                    <div>
                        <p className="font-medium text-foreground">تحقق واحفظ</p>
                        <p className="text-sm">اضغط "التحقق من الصحة" ثم احفظ أو صدّر كـ PDF</p>
                    </div>
                </li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>نصيحة:</strong> استخدم GPT-4 أو GPT-4 Turbo للحصول على أفضل النتائج
                </p>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ <strong>تحذير:</strong> تأكد من نسخ JSON فقط (بدون ```json أو أي نص إضافي)
                </p>
            </div>
        </Card>
    );
}
