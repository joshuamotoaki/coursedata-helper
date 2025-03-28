export class EvaluationClient {
    public static readonly BASE_URL = "https://registrarapps.princeton.edu/course-evaluation";

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
}
