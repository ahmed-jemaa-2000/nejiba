/**
 * CASEL Progress Storage
 * 
 * Tracks completion status of the 36 CASEL workshops
 * and provides analytics for the dashboard
 */

import { UNITS, type Workshop } from "@/lib/workshop/workshopCurriculum";

export interface WorkshopProgress {
    workshopNumber: number;
    unitNumber: number;
    completed: boolean;
    completedAt?: string; // ISO date
    pdfDownloaded: boolean;
    videoGenerated: boolean;
    notes?: string;
}

export interface UnitProgress {
    unitNumber: number;
    totalWorkshops: number;
    completedWorkshops: number;
    progressPercent: number;
}

export interface OverallProgress {
    totalWorkshops: number;
    completedWorkshops: number;
    progressPercent: number;
    currentUnit: number;
    nextWorkshop: number | null;
    unitsProgress: UnitProgress[];
    recentlyCompleted: WorkshopProgress[];
}

const PROGRESS_KEY = "nejiba_casel_progress";

/**
 * Progress storage operations
 */
export const progressStorage = {
    /**
     * Get all workshop progress data
     */
    getAll(): Map<number, WorkshopProgress> {
        try {
            const data = localStorage.getItem(PROGRESS_KEY);
            if (!data) return new Map();

            const parsed = JSON.parse(data);
            return new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v as WorkshopProgress]));
        } catch {
            return new Map();
        }
    },

    /**
     * Get progress for a specific workshop
     */
    getWorkshop(workshopNumber: number): WorkshopProgress | null {
        const all = this.getAll();
        return all.get(workshopNumber) || null;
    },

    /**
     * Mark a workshop as completed
     */
    markCompleted(workshopNumber: number, unitNumber: number): void {
        const all = this.getAll();

        const existing = all.get(workshopNumber) || {
            workshopNumber,
            unitNumber,
            completed: false,
            pdfDownloaded: false,
            videoGenerated: false,
        };

        existing.completed = true;
        existing.completedAt = new Date().toISOString();

        all.set(workshopNumber, existing);
        this._save(all);
    },

    /**
     * Mark a workshop as not completed
     */
    markIncomplete(workshopNumber: number): void {
        const all = this.getAll();
        const existing = all.get(workshopNumber);

        if (existing) {
            existing.completed = false;
            existing.completedAt = undefined;
            all.set(workshopNumber, existing);
            this._save(all);
        }
    },

    /**
     * Mark PDF downloaded for a workshop
     */
    markPdfDownloaded(workshopNumber: number, unitNumber: number): void {
        const all = this.getAll();

        const existing = all.get(workshopNumber) || {
            workshopNumber,
            unitNumber,
            completed: false,
            pdfDownloaded: false,
            videoGenerated: false,
        };

        existing.pdfDownloaded = true;
        all.set(workshopNumber, existing);
        this._save(all);
    },

    /**
     * Mark video generated for a workshop
     */
    markVideoGenerated(workshopNumber: number, unitNumber: number): void {
        const all = this.getAll();

        const existing = all.get(workshopNumber) || {
            workshopNumber,
            unitNumber,
            completed: false,
            pdfDownloaded: false,
            videoGenerated: false,
        };

        existing.videoGenerated = true;
        all.set(workshopNumber, existing);
        this._save(all);
    },

    /**
     * Add notes to a workshop
     */
    addNotes(workshopNumber: number, notes: string): void {
        const all = this.getAll();
        const existing = all.get(workshopNumber);

        if (existing) {
            existing.notes = notes;
            all.set(workshopNumber, existing);
            this._save(all);
        }
    },

    /**
     * Get overall progress statistics
     */
    getOverallProgress(): OverallProgress {
        const all = this.getAll();
        const completedWorkshops = Array.from(all.values()).filter(w => w.completed).length;
        const totalWorkshops = 36;

        // Calculate per-unit progress
        const unitsProgress: UnitProgress[] = UNITS.map(unit => {
            const unitWorkshops = unit.workshops.length;
            const completedInUnit = Array.from(all.values())
                .filter(w => w.unitNumber === unit.number && w.completed).length;

            return {
                unitNumber: unit.number,
                totalWorkshops: unitWorkshops,
                completedWorkshops: completedInUnit,
                progressPercent: Math.round((completedInUnit / unitWorkshops) * 100),
            };
        });

        // Find current unit (first incomplete)
        let currentUnit = 1;
        for (const up of unitsProgress) {
            if (up.progressPercent < 100) {
                currentUnit = up.unitNumber;
                break;
            }
        }

        // Find next workshop to complete
        let nextWorkshop: number | null = null;
        for (const unit of UNITS) {
            for (const workshop of unit.workshops) {
                const progress = all.get(workshop.number);
                if (!progress?.completed) {
                    nextWorkshop = workshop.number;
                    break;
                }
            }
            if (nextWorkshop) break;
        }

        // Get recently completed (last 5)
        const recentlyCompleted = Array.from(all.values())
            .filter(w => w.completed && w.completedAt)
            .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
            .slice(0, 5);

        return {
            totalWorkshops,
            completedWorkshops,
            progressPercent: Math.round((completedWorkshops / totalWorkshops) * 100),
            currentUnit,
            nextWorkshop,
            unitsProgress,
            recentlyCompleted,
        };
    },

    /**
     * Reset all progress
     */
    reset(): void {
        localStorage.removeItem(PROGRESS_KEY);
    },

    /**
     * Export progress as JSON
     */
    export(): string {
        const all = this.getAll();
        const obj = Object.fromEntries(all);
        return JSON.stringify(obj, null, 2);
    },

    /**
     * Import progress from JSON
     */
    import(json: string): boolean {
        try {
            const parsed = JSON.parse(json);
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Internal: Save progress map to localStorage
     */
    _save(progress: Map<number, WorkshopProgress>): void {
        const obj = Object.fromEntries(progress);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(obj));
    },
};
