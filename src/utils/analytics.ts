// analytics.ts
// Author: Joshua Motoaki Lau '26

import fs from "fs";
import type { CourseEvalData } from "../clients/evalClient";

export class Analytics {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    // Read the contents of a course evaluation file
    private readContents(courseId: string, term: string): CourseEvalData {
        const filepath = `${this.path}/${term}/${term}_${courseId}.json`;
        const data = fs.readFileSync(filepath, "utf8");
        return JSON.parse(data);
    }

    // Apply a callback to all files in the given terms
    private applyToAll<T>(
        terms: string[], // If empty, applies to all terms
        callback: (data: CourseEvalData) => T
    ): T[] {
        const results: T[] = [];
        if (terms.length === 0) terms = fs.readdirSync(`${this.path}`);
        for (const term of terms) {
            const files = fs.readdirSync(`${this.path}/${term}`);
            for (const file of files) {
                const data = fs.readFileSync(`${this.path}/${term}/${file}`, "utf8");
                results.push(callback(JSON.parse(data)));
            }
        }
        return results;
    }

    /**
     * Get the list of categories for which ratings are given
     * @returns A list of categories for which ratings are given
     * and their counts across all evaluations
     */
    public getAllRatingCategories(): Record<string, number> {
        const keys = this.applyToAll([], (data) => Object.keys(data.ratings));
        const flattened = keys.flat();
        const counts = new Map<string, number>();
        for (const key of flattened) counts.set(key, (counts.get(key) || 0) + 1);
        const sorted = new Map([...counts.entries()].sort((a, b) => b[1] - a[1]));
        return Object.fromEntries(sorted);
    }
}
