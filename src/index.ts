import { EvaluationClient } from "./client";
import { ansiCodes as A } from "./utils/ansiCodes";

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

        return prompt(`${A.green}${A.bright}Please enter your PHPSESSID: ${A.reset}`);
    }
    return phpSessId;
};

//----------------------------------------------------------------------

const main = async () => {
    const token = getPhpSessId();
    console.log(token);
};

main();
