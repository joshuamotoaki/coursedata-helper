// printDepts.ts
// Author: Joshua Motoaki Lau '26

import { RegistrarClient } from "./clients/registrarClient";
import { TERMS } from "./utils";
import { AnsiColors as A } from "./utils/ansiCodes";

/**
 * Fetches and prints the 3-letter department codes.
 * @param term The term to fetch departments for. If not provided, fetches for all terms.
 */
export const printDepartments = async (term: string = "") => {
    // Time to wait between requests (important for all terms case)
    const WAIT = 1000;

    if (term === "") {
        // If no term is provided, fetch all departments for all terms
        const depts = new Set<string>();
        for (const t of TERMS) {
            const departments = await RegistrarClient.fetchDeptCodes(t);
            departments.forEach((dept) => depts.add(dept));
            await new Promise((resolve) => setTimeout(resolve, WAIT));
        }
        A.print(Array.from(depts).sort().join(", "), A.green, A.bright);
    } else {
        // If a term is provided, fetch departments for that term
        const departments = await RegistrarClient.fetchDeptCodes(term);
        A.print(departments.join(", "), A.green, A.bright);
    }
};
