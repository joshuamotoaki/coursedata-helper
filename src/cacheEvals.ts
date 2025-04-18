// cacheEvals.ts
// Author: Joshua Motoaki Lau '26

import { EvaluationClient } from "./clients/evalClient";
import { RegistrarClient } from "./clients/registrarClient";
import { cacheData, EVAL_TERMS } from "./utils";
import { AnsiColors as A } from "./utils/ansiCodes";

// Retrieve PHPSESSID from environment variables. If not set,
// ask the user for it with detailed instructions.
const getPhpSessId = () => {
    const phpSessId = process.env.PHPSESSID;
    if (!phpSessId) {
        A.print("PHPSESSID not found in environment variables.", A.red, A.bright);
        A.print("\nFollow these steps to find your PHPSESSID:", A.green, A.bright);
        console.log(`${A.yellow}1. Visit ${A.blue}${EvaluationClient.BASE_URL}${A.reset}`);
        A.print(
            "2. Open Chrome DevTools by right-clicking anywhere on the page and selecting 'Inspect'",
            A.yellow
        );
        A.print("(or press Ctrl+Shift+I on Windows/Linux or Cmd+Option+I on Mac)", A.magenta);
        console.log(
            `${A.yellow}3. In DevTools, click on the '${A.green}Application${A.yellow}' tab${A.reset}`
        );
        console.log(
            `${A.yellow}4. In the left sidebar, expand '${A.green}Cookies${A.yellow}' and click on the website URL${A.reset}`
        );
        console.log(
            `${A.yellow}5. Find the cookie named '${A.bright}PHPSESSID${A.reset}${A.yellow}' in the list${A.reset}`
        );
        A.print("6. Copy the value (not the name) of this cookie", A.yellow);
        A.print("7. Paste it below when prompted", A.yellow);

        const id = prompt(A.formatText("Please enter your PHPSESSID: ", A.green, A.bright));
        if (!id) throw new Error("PHPSESSID is required");
        return id;
    } else return phpSessId;
};

const cacheEval = (courseId: string, term: string, data: Object, force: boolean = false) => {
    const path = `./out/evals/${term}/${term}-${courseId}.json`;
    cacheData(path, data, force);
};

/**
 * Caches evaluations for a list of terms into JSON files.
 * @param terms An array of term codes to fetch evaluations for.
 */
export const cacheEvals = async (terms: string[] = []) => {
    // These settings seem to be fast enough without being too aggressive
    // Bump up at your own risk
    const CONCURRENCY = 2;
    const WAIT = 20;

    const token = getPhpSessId();
    const evalClient = new EvaluationClient(token);
    if (terms.length === 0) terms = EVAL_TERMS; // Use all terms if none are provided

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const courseIds = await RegistrarClient.fetchListingIds(term);
        A.print(
            `Fetching evaluations for term ${term}. ${courseIds.length} courses found.`,
            A.yellow,
            A.bright
        );

        // Handle courses in batches of CONCURRENCY
        for (let j = 0; j < courseIds.length; j += CONCURRENCY) {
            const batch = courseIds.slice(j, j + CONCURRENCY);
            const promises = batch.map((id) => evalClient.fetchEvalPage(id, term));
            const responses = await Promise.all(promises);

            for (let k = 0; k < responses.length; k++) {
                const response = responses[k];
                if (response.status === "SUCCESS") {
                    const data = evalClient.parseEvalPage(response.data);
                    cacheEval(batch[k], term, data);
                } else if (
                    response.status === "ERROR" &&
                    response.message.includes("Session expired")
                ) {
                    const id = prompt(
                        `${A.green}${A.bright}Token expired. Please enter your PHPSESSID (${EvaluationClient.BASE_URL}): ${A.reset}`
                    );
                    if (!id) throw new Error("PHPSESSID is required");
                    evalClient.updateToken(id);
                    j = Math.max(0, j - CONCURRENCY);
                    A.print("Jumping back to index " + j, A.red, A.bright);
                    break; // Retry the batch
                } else {
                    A.print(`No eval for ${batch[k]} in term ${term}.`, A.orange);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, WAIT));
        }
        A.print(`Finished fetch evaluations for term ${term}.`, A.green, A.bright);
    }
};
