/**
 * A small client for utilizing the registrar's public course listings API.
 * This API is rate-limited and will (at least temporarily) IP ban you if you spam it.
 * Unfortunately, it is the most convenient way to get a list of course IDs for a given term.
 * I would recommend using the OIT API for most other purposes.
 * I.e. future maintainers, only extend this class if you absolutely need to.
 */
export class RegistrarClient {
    // API endpoint for the registrar's public course listings API
    private static readonly REG_API_URL =
        "https://api.princeton.edu/registrar/course-offerings/classes/";

    // Gets the API token for use in the registrar's API
    private static getToken = async () => {
        const response = await fetch("https://registrar.princeton.edu/course-offerings");
        const text = await response.text();
        return "Bearer " + text.split('apiToken":"')[1].split('"')[0];
    };

    // Fetches the course listings for a given term.
    private static async fetchListings(term: string): Promise<any[]> {
        const token = await this.getToken();
        const rawCourseList = await fetch(`${this.REG_API_URL}${term}`, {
            method: "GET",
            headers: {
                Authorization: token
            }
        });
        if (!rawCourseList.ok) throw new Error("Failed to fetch course list");

        // Yes, we are not doing any type checking here and just assuming
        // the response is valid and in the format we expect. If it breaks,
        // then something has changed. Otherwise, we only need the course_ids
        // and the rest of the data is irrelevant.
        const courseList: any = await rawCourseList.json();
        const valid =
            courseList &&
            courseList.classes &&
            courseList.classes.class &&
            Array.isArray(courseList.classes.class);
        if (!valid) throw new Error("Invalid course list response format");

        return courseList.classes.class as any[];
    }

    /**
     * Fetches the course listing IDs for a given term.
     * Note: This API rate-limits and IP bans and should not be spammed.
     * @param term The 4-digit term code to fetch listings for.
     * @returns An array of course IDs for the given term.
     */
    public static async fetchListingIds(term: string): Promise<string[]> {
        const regListings = await this.fetchListings(term);

        // Remove duplicates by course_id and sort by course_id
        return [...new Set<string>(regListings.map((x: any) => x.course_id))].sort((a, b) =>
            a.localeCompare(b)
        );
    }

    /**
     * Fetches the 3-letter department codes for a given term.
     * @param term The 4-digit term code to fetch listings for.
     * @returns An array of department codes for the given term.
     */
    public static async fetchDeptCodes(term: string): Promise<string[]> {
        const regListings = await this.fetchListings(term);

        // Remove duplicates by department and sort by department code
        return [...new Set<string>(regListings.map((x: any) => x.subject))].sort();
    }
}
