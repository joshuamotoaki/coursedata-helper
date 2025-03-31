export class RegistrarClient {
    // API endpoint for the public course listings API
    private static readonly REG_PUBLIC_URL =
        "https://api.princeton.edu/registrar/course-offerings/classes/";

    // API endpoint for the registrar student-app API
    private static readonly REG_API_URL = "https://api.princeton.edu/student-app/1.0.3/";

    // Gets the API token for use in the public course listings API
    private static getToken = async () => {
        const response = await fetch("https://registrar.princeton.edu/course-offerings");
        const text = await response.text();
        return "Bearer " + text.split('apiToken":"')[1].split('"')[0];
    };

    /**
     * Fetches the course listings for a given term.
     * Note: Uses the public API, which should not be spammed.
     * @param term The 4-digit term code to fetch listings for.
     * @returns An array of course IDs for the given term.
     */
    public static async fetchListingIds(term: string): Promise<string[]> {
        const token = await this.getToken();
        const rawCourseList = await fetch(`${this.REG_PUBLIC_URL}${term}`, {
            method: "GET",
            headers: {
                Authorization: token
            }
        });
        const courseList: any = await rawCourseList.json();

        const valid =
            courseList &&
            courseList.classes &&
            courseList.classes.class &&
            Array.isArray(courseList.classes.class);
        if (!valid) throw new Error("Invalid course list response format");

        const regListings = courseList.classes.class as any[];

        // Remove duplicates by course_id and sort by course_id
        return [...new Set<string>(regListings.map((x: any) => x.course_id))].sort((a, b) =>
            a.localeCompare(b)
        );
    }
}
