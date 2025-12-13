/**
 * JSON Editor Component
 *
 * A textarea with line numbers, syntax checking, and formatting capabilities
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button } from "@/components/ui";

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    errors?: Array<{ line: number; message: string }>;
    placeholder?: string;
}

export function JsonEditor({ value, onChange, errors, placeholder }: JsonEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [lineCount, setLineCount] = useState(1);

    useEffect(() => {
        const lines = value.split('\n').length;
        setLineCount(lines);
    }, [value]);

    const formatJson = () => {
        try {
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            onChange(formatted);
        } catch (e) {
            // Invalid JSON, keep as is
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text');
        // Try to auto-format if it's valid JSON
        try {
            const parsed = JSON.parse(pastedText);
            const formatted = JSON.stringify(parsed, null, 2);
            e.preventDefault();
            onChange(formatted);
        } catch {
            // Not valid JSON, let default paste behavior happen
        }
    };

    return (
        <Card variant="bordered" padding="none" className="relative">
            {/* Fixed height container with internal scrolling */}
            <div className="flex h-[500px] overflow-auto">
                {/* Line numbers */}
                <div className="sticky left-0 flex flex-col bg-background-tertiary text-foreground-secondary text-xs font-mono p-4 select-none border-r border-border">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} className="leading-6 text-right min-w-[2rem]">{i + 1}</div>
                    ))}
                </div>

                {/* Editor */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={placeholder || "الصق JSON هنا..."}
                        className="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none focus:outline-none"
                        style={{ minHeight: `${lineCount * 24 + 32}px`, tabSize: 2 }}
                        dir="ltr"
                        spellCheck={false}
                    />

                    {/* Format button */}
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={formatJson}
                        >
                            تنسيق JSON
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error indicators */}
            {errors && errors.length > 0 && (
                <div className="border-t border-red-300 dark:border-red-700 p-3 bg-red-50 dark:bg-red-900/20 max-h-32 overflow-auto">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">أخطاء JSON:</p>
                    {errors.map((err, i) => (
                        <div key={i} className="text-xs text-red-700 dark:text-red-400">
                            السطر {err.line}: {err.message}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
