import { JSDOM } from "jsdom";

type StatusType = "REDIRECT" | "ERROR" | "SUCCESS";

type SuccessResponse<T> = {
    status: "SUCCESS";
    data: T;
};

type NonSuccessResponse = {
    status: Exclude<StatusType, "SUCCESS">;
    message: string;
};

type Response<T> = SuccessResponse<T> | NonSuccessResponse;

//----------------------------------------------------------------------

export class EvaluationClient {
    public static readonly BASE_URL = "https://registrarapps.princeton.edu/course-evaluation";

    private static readonly NO_RESULT_MSG =
        "The student evaluation results for the class you selected are not available online; the course may be new, have no data available for display or has not been evaluated using the online system.";

    // The PHPSESSID token is used to authenticate the user session
    private token: string;

    /**
     * Constructor for the EvaluationClient class.
     * @param token The PHPSESSID token to be used for authentication
     */
    constructor(token: string) {
        if (!token) throw new Error("PHPSESSID is required");
        this.token = token;
    }

    /**
     * Update the PHPSESSID token.
     * This will be used if the token expires during the session.
     * In that case, the user will be prompted to enter the new token.
     * @param newToken The new PHPSESSID token to be set
     */
    public updateToken(newToken: string): void {
        if (!newToken) throw new Error("PHPSESSID is required");

        this.token = newToken;
    }

    //------------------------------------------------------------------

    // Format the evaluation URL with the course ID and term
    private fmtEvalUrl(courseId: string, term: string): string {
        return `${EvaluationClient.BASE_URL}?courseinfo=${courseId}&terminfo=${term}`;
    }

    public async fetchEvalPage(courseId: string, term: string): Promise<Response<JSDOM>> {
        const url = this.fmtEvalUrl(courseId, term);
        // Fetch the eval page
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Cookie": `PHPSESSID=${this.token}`,
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
            },
            redirect: "follow"
        });

        // Handle the response
        if (response.redirected && response.url.includes("/cas/login"))
            return { status: "ERROR", message: "Session expired. Please update your PHPSESSID." };
        if (response.redirected) return { status: "REDIRECT", message: response.url };
        if (!response.ok) return { status: "ERROR", message: response.statusText };
        const text = await response.text();
        if (text.includes(EvaluationClient.NO_RESULT_MSG)) {
            return {
                status: "ERROR",
                message: "No results found for course " + courseId + " in term " + term + "."
            };
        }

        // If successful, parse the HTML and return the JSDOM object
        return {
            status: "SUCCESS",
            data: new JSDOM(text, {
                url: url,
                contentType: "text/html"
            })
        };
    }
}
