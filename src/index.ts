import { EvaluationClient } from "./clients/evalClient";
import { RegistrarClient } from "./clients/registrarClient";
import { Analytics } from "./utils/analytics";
import { ansiCodes as A } from "./utils/ansiCodes";
import { TERMS } from "./utils/terms";
import fs from "fs";

// Retrieve PHPSESSID from environment variables. If not set,
// ask the user for it with detailed instructions.
const getPhpSessId = () => {
    const phpSessId = process.env.PHPSESSID;
    if (!phpSessId) {
        console.log(`${A.red}${A.bright}PHPSESSID not found in environment variables.${A.reset}`);
        console.log(`\n${A.green}${A.bright}Follow these steps to find your PHPSESSID:${A.reset}`);
        console.log(`${A.yellow}1. Visit ${A.blue}${EvaluationClient.BASE_URL}${A.reset}`);
        console.log(
            `${A.yellow}2. Open Chrome DevTools by right-clicking anywhere on the page and selecting 'Inspect'${A.reset}`
        );
        console.log(
            `   ${A.magenta}(or press Ctrl+Shift+I on Windows/Linux or Cmd+Option+I on Mac)${A.reset}`
        );
        console.log(
            `${A.yellow}3. In DevTools, click on the '${A.green}Application${A.yellow}' tab${A.reset}`
        );
        console.log(
            `${A.yellow}4. In the left sidebar, expand '${A.green}Cookies${A.yellow}' and click on the website URL${A.reset}`
        );
        console.log(
            `${A.yellow}5. Find the cookie named '${A.bright}PHPSESSID${A.reset}${A.yellow}' in the list${A.reset}`
        );
        console.log(`${A.yellow}6. Copy the value (not the name) of this cookie${A.reset}`);
        console.log(`${A.yellow}7. Paste it below when prompted${A.reset}\n`);

        const id = prompt(`${A.green}${A.bright}Please enter your PHPSESSID: ${A.reset}`);
        if (!id) throw new Error("PHPSESSID is required");
        return id;
    } else return phpSessId;
};

const cacheEval = (courseId: string, term: string, data: Object, force: boolean = false) => {
    const OUTPATH = "./out";
    const filepath = `${OUTPATH}/${term}`;
    const filename = `${courseId}.json`;

    if (!fs.existsSync(OUTPATH)) fs.mkdirSync(OUTPATH);
    if (!fs.existsSync(filepath)) fs.mkdirSync(filepath);

    // Check if file exists
    if (fs.existsSync(`${filepath}/${filename}`)) {
        if (force) {
            console.log(
                `${A.red}${A.bright}WARNING: ${A.orange}File already exists for ${courseId} in term ${term}. Overwriting.${A.reset}`
            );
        } else {
            console.log(
                `${A.red}${A.bright}WARNING: ${A.orange}File already exists for ${courseId} in term ${term}. Skipping.${A.reset}`
            );
            return;
        }
    }

    fs.writeFileSync(`${filepath}/${filename}`, JSON.stringify(data, null, 4));
};

//----------------------------------------------------------------------
const cacheAllEvals = async () => {
    const CONCURRENCY = 2;
    const WAIT = 20;

    const token = getPhpSessId();
    const evalClient = new EvaluationClient(token);

    for (let i = 0; i < TERMS.length; i++) {
        const term = TERMS[i];
        const courseIds = await RegistrarClient.fetchListingIds(term);
        console.log(
            `${A.yellow}${A.bright}Fetching evaluations for term ${term}. ${courseIds.length} courses found.${A.reset}`
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
                        `${A.green}${A.bright}Please enter your PHPSESSID: ${A.reset}`
                    );
                    if (!id) throw new Error("PHPSESSID is required");
                    evalClient.updateToken(id);
                    j -= CONCURRENCY;
                    break; // Retry the batch
                } else {
                    console.log(`${A.orange}No eval for ${batch[k]} in term ${term}.${A.reset}`);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, WAIT));
        }

        console.log(
            `${A.green}${A.bright}Finished fetching evaluations for term ${term}.${A.reset}`
        );
    }
};

const a = new Analytics("./out");
console.log(a.getAllRatingCategories());
