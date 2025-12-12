/**
 * Workshop LocalStorage Management
 *
 * Provides CRUD operations for storing workshop plans in browser localStorage
 */

import type { WorkshopPlanData } from "@/lib/ai/providers/base";

export interface StoredWorkshop {
    id: string; // UUID
    plan: WorkshopPlanData;
    metadata: {
        createdAt: string; // ISO date
        source: "generated" | "imported"; // Track origin
        importedFrom?: "chatgpt" | "file"; // If imported
        lastModified: string;
        topic: string; // For easy filtering
        duration: string;
        ageRange: string;
    };
}

// Storage key: "nejiba_workshops"
const STORAGE_KEY = "nejiba_workshops";

/**
 * Generate a simple UUID
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Workshop storage operations
 */
export const workshopStorage = {
    /**
     * Save workshop to localStorage
     */
    save(plan: WorkshopPlanData, source: "generated" | "imported", importedFrom?: "chatgpt" | "file"): string {
        const workshops = this.getAll();
        const id = generateUUID();

        const stored: StoredWorkshop = {
            id,
            plan,
            metadata: {
                createdAt: new Date().toISOString(),
                source,
                importedFrom,
                lastModified: new Date().toISOString(),
                topic: plan.title.ar,
                duration: plan.generalInfo.duration,
                ageRange: plan.generalInfo.ageGroup,
            }
        };

        workshops.push(stored);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workshops));
            return id;
        } catch (e) {
            if (e instanceof DOMException && e.name === "QuotaExceededError") {
                throw new Error("مساحة التخزين ممتلئة. يرجى حذف بعض الورش السابقة.");
            }
            throw new Error("فشل الحفظ في localStorage");
        }
    },

    /**
     * Get all workshops from localStorage
     */
    getAll(): StoredWorkshop[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * Get workshop by ID
     */
    getById(id: string): StoredWorkshop | null {
        const workshops = this.getAll();
        return workshops.find(w => w.id === id) || null;
    },

    /**
     * Update existing workshop
     */
    update(id: string, plan: WorkshopPlanData): boolean {
        const workshops = this.getAll();
        const index = workshops.findIndex(w => w.id === id);

        if (index === -1) return false;

        workshops[index].plan = plan;
        workshops[index].metadata.lastModified = new Date().toISOString();

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workshops));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Delete workshop
     */
    delete(id: string): boolean {
        const workshops = this.getAll();
        const filtered = workshops.filter(w => w.id !== id);

        if (filtered.length === workshops.length) return false;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Search workshops by topic or title
     */
    search(query: string): StoredWorkshop[] {
        const workshops = this.getAll();
        const lowerQuery = query.toLowerCase();

        return workshops.filter(w =>
            w.metadata.topic.toLowerCase().includes(lowerQuery) ||
            w.plan.title.ar.toLowerCase().includes(lowerQuery) ||
            (w.plan.title.en && w.plan.title.en.toLowerCase().includes(lowerQuery))
        );
    },

    /**
     * Get count of stored workshops
     */
    count(): number {
        return this.getAll().length;
    },

    /**
     * Clear all workshops (use with caution!)
     */
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};
