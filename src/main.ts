// main.ts
// Author: Joshua Motoaki Lau '26

import { cacheCourses } from "./cacheCourses";
import { cacheEvals } from "./cacheEvals";
import { printDepartments } from "./printDepts";
import { AnsiColors as A } from "./utils/ansiCodes";

const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        A.print("No arguments provided. Exiting.", A.red, A.bright);
        A.print("Usage: node index.js <command> [term]", A.yellow, A.bright);
        A.print("Commands:", A.yellow, A.bright);
        A.print("  cache-evals <term>", A.yellow);
        A.print("  cache-dept-courses <term>", A.yellow);
        A.print("  print-depts <term>", A.yellow);
        return;
    }

    const command = args[0];
    const term = args[1];

    switch (command) {
        case "cache-evals":
            await cacheEvals(term ? [term] : []);
            break;
        case "cache-dept-courses":
            await cacheCourses(term ? [term] : []);
            break;
        case "print-depts":
            await printDepartments(term);
            break;
        default:
            A.print(`Unknown command: ${command}`, A.red, A.bright);
            break;
    }
};
main();
