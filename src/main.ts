// main.ts
// Author: Joshua Motoaki Lau '26

import { cacheCourses } from "./cacheCourses";
import { cacheEvals } from "./cacheEvals";
import { printDepartments } from "./printDepts";
import yargs from "yargs";

const main = async () => {
    yargs(process.argv.slice(2))
        .scriptName("bun run main")
        .usage("$0 <cmd> [args]")
        .command(
            "cache-evals",
            "Cache course evaluations",
            (yargs) => {
                return yargs.option("terms", {
                    alias: "t",
                    type: "array",
                    description: "List of terms to cache evaluations for",
                    default: []
                });
            },
            async (argv) => {
                await cacheEvals(argv.terms as string[]);
            }
        )
        .command(
            "cache-courses",
            "Cache course data",
            (yargs) => {
                return yargs
                    .option("terms", {
                        alias: "t",
                        type: "array",
                        description: "List of terms to cache course data for",
                        default: []
                    })
                    .option("depts", {
                        alias: "d",
                        type: "array",
                        description: "List of departments to cache course data for",
                        default: []
                    });
            },
            async (argv) => {
                await cacheCourses(argv.terms as string[], argv.depts as string[]);
            }
        )
        .command(
            "print-depts",
            "Print department codes",
            (yargs) => {
                return yargs.option("term", {
                    alias: "t",
                    type: "string",
                    description: "Term to print department codes for"
                });
            },
            async (argv) => {
                await printDepartments(argv.term as string);
            }
        )
        .demandCommand(1, "You need to specify a command")
        .help()
        .alias("help", "h").argv;
};

main();
