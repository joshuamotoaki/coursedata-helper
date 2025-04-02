import fs from "fs";

export const createFoldersDeep = (path: string) => {
    const parts = path.split("/");
    let currentPath = path.startsWith(".") ? "." : "";

    for (const part of parts) {
        if (part) {
            currentPath += `/${part}`;
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
        }
    }
};

/**
 * A list of term codes for Princeton University.
 * Codes ending in 2 are fall terms, and codes ending in 4 are spring terms.
 * For example, 1262 is the fall term of AY 2025-2026 (fall 2025),
 * and 1254 is the spring term of AY 2024-2025 (spring 2025).
 *
 * There isn't any reason to believe the predictable pattern won't
 * continue, but you should verify the term code before adding one
 * for a new term when you go to update everything.
 */
export const TERMS = [
    "1262",
    "1254",
    "1252",
    "1244",
    "1242",
    "1234",
    "1232",
    "1224",
    "1222",
    "1214",
    "1212",
    "1204",
    "1202",
    "1194",
    "1192",
    "1184",
    "1182",
    "1174"
];

// Terms with evaluations aval
export const EVAL_TERMS = TERMS.filter((term) => term !== "1262" && term !== "1254");
