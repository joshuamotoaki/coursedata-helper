import { EvaluationClient } from "./clients/evalClient";
import { RegistrarClient } from "./clients/registrarClient";
import { ansiCodes as A } from "./utils/ansiCodes";
import { TERMS } from "./utils/terms";

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

const handleCourse = async (courseId: string, term: string) => {};

const handleTerm = async (term: string) => {};

//----------------------------------------------------------------------
const main = async () => {
    const CONCURRENCY = 5;

    const token = getPhpSessId();
    const evalClient = new EvaluationClient(token);

    for (let i = 0; i < TERMS.length; i++) {
        const term = TERMS[i];
        const courseIds = await RegistrarClient.fetchListingIds(term);
        console.log(
            `${A.yellow}${A.bright}Fetching evaluations for term ${term}. ${courseIds.length} courses found.${A.reset}`
        );
    }

    // const sample = await client.fetchEvalPage("002051", "1244");
    // if (sample.status === "SUCCESS") {
    //     console.log(client.parseEvalPage(sample.data));
    // }
};

main();
