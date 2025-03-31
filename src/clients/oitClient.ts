/**
 * A client for utilizing the OIT's student-app API. This is the main
 * data source for course information (with the exception of course IDs which
 * are more easily fetched from the registrar's public API and evaluations
 * which have to be web scraped, sadly).
 *
 * This API is somewhat slow and its performance fluctuates heavily.
 * Do NOT use the API directly in an application. Instead, proxy the
 * data in your application's database and ping the API periodically
 * to keep the data fresh.
 *
 * To utilize the OIT API, you need to get a Service Account through the
 * OIT. If you're in TigerApps, you can use the TigerApps service account.
 * If you're in COS 333 or conducting official independent work, then
 * your course staff can (hopefully) easily get you a service account.
 * If neither of the above apply, then good luck, have fun :)
 */
export class OitClient {
    // API key for the OIT's student-app API. This is required for authentication.
    private readonly API_KEY: string;

    // API endpoint for the OIT's student-app API.
    private static readonly OIT_API_URL = "https://api.princeton.edu/student-app/1.0.3/";

    constructor(apiKey: string) {
        if (!apiKey) throw new Error("API key is required");
        this.API_KEY = apiKey;
    }
}
