// oitClient.ts
// Author: Joshua Motoaki Lau

import { createTimeoutPromise } from "../utils";
import type { OitCourseDetails, OitDeptCourse, OitSeat, Status } from "../utils/oitTypes";

/**
 * A client for utilizing the OIT's student-app API. This is the main
 * data source for course information (with the exception of course IDs which
 * are more easily fetched from the registrar's public API and evaluations
 * which have to be web scraped, sadly).
 *
 * Information about courses is split between the /courses and /details
 * endpoints (on the OIT's end), which reflects in the split between
 * fetchDeptCourses and fetchCourseDetails. This split of information
 * is wonky and quite frankly annoying, and you pretty much have to
 * call both endpoints to get all the information you need about a course.
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
    private readonly TIMEOUT = 10000; // 10 seconds

    // API key for the OIT's student-app API. This is required for authentication.
    private readonly API_KEY: string;

    // API endpoint for the OIT's student-app API.
    private readonly OIT_API_URL = "https://api.princeton.edu/student-app/1.0.3/";

    constructor(apiKey: string) {
        if (!apiKey) throw new Error("API key is required");
        this.API_KEY = apiKey;
    }

    private reqWithTimeout = async (fetcher: () => Promise<Response>) => {
        return await Promise.race([fetcher(), createTimeoutPromise(this.TIMEOUT)]);
    };

    // Unfortunately, some courses just fail to load for some reason. We have
    // to handle these edge cases by manually inputting the data :(
    private handleDetailsEdgeCases = (listingId: string, term: string): OitCourseDetails | null => {
        if (listingId === "010855" && term === "1244") {
            // GHP 351, Spring 2024
            // Epidemiology: Unpacking Health with Classic Tools, Ecology and Evolution
            return null;
        } else return null;
    };

    /**
     * Fetch the list of courses with main listing being in a given department
     * @param dept 3-letter department code (e.g. "COS")
     * @param term 4-digit term code (e.g. "1262" for Fall 2025)
     * @returns A list of courses in the given department
     */
    public fetchDeptCourses = async (dept: string, term: string): Promise<OitDeptCourse[]> => {
        try {
            const rawDeptData = await this.reqWithTimeout(() =>
                fetch(`${this.OIT_API_URL}courses/courses?term=${term}&subject=${dept}&fmt=json`, {
                    method: "GET",
                    headers: {
                        Authorization: this.API_KEY
                    }
                })
            );

            const deptData: any = await rawDeptData.json();
            if (!deptData.term[0].subjects) {
                console.error("No courses found for department " + dept);
                return [];
            }

            // Find correct department
            const correctIndex = deptData.term[0].subjects.findIndex((x: any) => x.code === dept);

            if (correctIndex === -1) {
                console.error("No courses found for department " + dept);
                return [];
            }

            return deptData.term[0].subjects[correctIndex].courses as OitDeptCourse[];
        } catch (error: any) {
            console.error(
                `Error with fetchDeptCourses for dept ${dept} and term ${term}:`,
                error.message
            );
            console.error(
                "Fetch url: ",
                `${this.OIT_API_URL}courses/courses?term=${term}&subject=${dept}`
            );
            throw new Error(`Failed to fetch department courses: ${error.message}`);
        }
    };

    /**
     * Fetch the details for a given course listing
     * @param listingId The course listing ID (e.g. "015230")
     * @param term 4-digit term code (e.g. "1262" for Fall 2025)
     * @returns The course details for the given listing ID
     */
    public fetchCourseDetails = async (
        listingId: string,
        term: string
    ): Promise<OitCourseDetails> => {
        const edgeCase = this.handleDetailsEdgeCases(listingId, term);
        if (edgeCase !== null) return edgeCase;

        try {
            const rawCourseDetails = await this.reqWithTimeout(() =>
                fetch(
                    `${this.OIT_API_URL}courses/details?term=${term}&course_id=${listingId}&fmt=json`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: this.API_KEY
                        }
                    }
                )
            );

            const courseDetails: any = await rawCourseDetails.json();

            const valid =
                courseDetails &&
                courseDetails.course_details &&
                courseDetails.course_details.course_detail;
            if (!valid) throw new Error("Invalid course details response format");

            return courseDetails.course_details.course_detail as OitCourseDetails;
        } catch (error: any) {
            console.error(
                `Error with fetchCourseDetails for listingId ${listingId} and term ${term}:`,
                error.message
            );
            console.error(
                "Fetch url: ",
                `${this.OIT_API_URL}courses/details?term=${term}&course_id=${listingId}`
            );
            throw new Error(`Failed to fetch course details: ${error.message}`);
        }
    };

    /**
     * Fetch seat capacity information for a list of course IDs
     * Note: This uses the OIT's accelerated API which means you
     * can spam it to your heart's content (be nice though).
     * @param courseIds A list of course IDs (e.g. ["015230", "017266"])
     * @param term 4-digit term code (e.g. "1262" for Fall 2025)
     * @returns A list of seat information for the given course IDs
     */
    public fetchSeats = async (courseIds: string[], term: string): Promise<OitSeat[]> => {
        try {
            const rawSeatData = await this.reqWithTimeout(() =>
                fetch(
                    `${this.OIT_API_URL}courses/seats?term=${term}&course_ids=${courseIds.join(",")}&fmt=json`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: this.API_KEY
                        }
                    }
                )
            );

            const seatData: any = await rawSeatData.json();

            const valid = seatData.course && Array.isArray(seatData.course);
            if (!valid) throw new Error("Invalid seat data response format");

            const formattedSeatData = seatData.course.map((x: any) => {
                return {
                    listingId: x.course_id,
                    sections: x.classes.map((y: any) => {
                        return {
                            num: y.class_number,
                            tot: parseInt(y.enrollment),
                            cap: parseInt(y.capacity),
                            status: y.pu_calc_status.toLowerCase() as Status
                        };
                    })
                };
            }) as OitSeat[];

            // Ensure section status is valid
            for (const seat of formattedSeatData) {
                if (seat.sections.some((x) => !["open", "closed", "canceled"].includes(x.status))) {
                    console.error("Unknown section status for " + seat.listingId);
                }
            }

            return formattedSeatData;
        } catch (error: any) {
            console.error(
                `Error with fetchSeats for courseIds ${courseIds} and term ${term}:`,
                error.message
            );
            console.error(
                "Fetch url: ",
                `${this.OIT_API_URL}courses/seats?term=${term}&course_ids=${courseIds.join(",")}`
            );
            throw new Error(`Failed to fetch seat data: ${error.message}`);
        }
    };
}
