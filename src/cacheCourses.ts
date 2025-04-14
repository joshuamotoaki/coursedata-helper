// cacheCourses.ts
// Author: Joshua Motoaki Lau '26

import { OitClient } from "./clients/oitClient";
import { RegistrarClient } from "./clients/registrarClient";
import { cacheData, TERMS } from "./utils";
import { AnsiColors as A } from "./utils/ansiCodes";

const cacheDeptCourses = (dept: string, term: string, data: Object, force: boolean = false) => {
    const path = `./out/courses/${term}/${term}-${dept}.json`;
    cacheData(path, data, force);
};

const cacheCourseDetail = (
    courseId: string,
    term: string,
    data: Object,
    force: boolean = false
) => {
    const path = `./out/details/${term}/${term}-${courseId}.json`;
    cacheData(path, data, force);
};

/**
 *
 * @param terms An array of term codes to fetch courses for.
 */
export const cacheCourses = async (terms: string[] = [], depts: string[] = []) => {
    // Time to wait between terms (important for all terms case)
    const WAIT = 5000;

    const OIT_API_KEY = process.env.OIT_API_KEY;
    if (!OIT_API_KEY) throw new Error("OIT API key is required");
    const oit = new OitClient(OIT_API_KEY);

    if (terms.length === 0) terms = TERMS; // Use all terms if none are provided

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];

        const allDepts = await RegistrarClient.fetchDeptCodes(term);
        if (depts.length === 0) depts = allDepts;
        else if (depts.filter((x) => !allDepts.includes(x)).length > 0)
            throw new Error(
                `Invalid department codes provided. Valid codes are: ${allDepts.join(", ")}`
            );

        A.print(
            `Fetching courses for term ${term}. ${depts.length} departments found.`,
            A.yellow,
            A.bright
        );
        for (const dept of depts) {
            const deptCourses = await oit.fetchDeptCourses(dept, term);
            if (deptCourses.length === 0) {
                A.print(`No courses found for department ${dept}.`, A.red, A.bright);
                continue;
            } else {
                A.print(`Found ${deptCourses.length} courses for department ${dept}.`, A.green);
                cacheDeptCourses(dept, term, deptCourses);
            }

            for (const course of deptCourses) {
                const courseDetails = await oit.fetchCourseDetails(course.course_id, term);
                cacheCourseDetail(course.course_id, term, courseDetails, false);
            }
        }

        A.print(`Finished fetch courses for term ${term}.`, A.green, A.bright);
        if (terms.length > 1 && i < terms.length - 1)
            await new Promise((resolve) => setTimeout(resolve, WAIT));
    }
};
