import Papa from "papaparse";
import { Student } from "@/types/student";

const SHEET_ID = "1mQLNL9S9h5cuM7pdinbipMF9y6OmRxu_-Qjl0aP5tlk";
const GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function toInt(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(String(value).replace(/[^0-9\-]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(value?: string): boolean | undefined {
  if (value == null) return undefined;
  const v = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "n", "false", "0", "-", "na", "n/a"].includes(v)) return false;
  return undefined;
}

function normalizeGender(value?: string): 'MALE' | 'FEMALE' | undefined {
  if (!value) return undefined;
  const v = value.toUpperCase();
  if (v.includes("F")) return 'FEMALE';
  if (v.includes("M")) return 'MALE';
  return undefined;
}

export async function fetchStudentsFromSheet(): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          const mapped: Student[] = rows
            .filter((r) => r["Roll No"] && r["Name of Student"]) 
            .map((r, idx) => {
              const totalExpMonths = toInt(r["Total Full Time Experience (In months)"]) ?? 0;
              const totalExp = Math.round(totalExpMonths / 12 * 10) / 10; // Convert months to years, round to 1 decimal
              const ugPct = toNumber(r["UG percentage"]);

              const s: Student = {
                id: toInt(r["S.No."]) ?? idx + 1,
                rollNo: r["Roll No"],
                name: r["Name of Student"],
                collegeEmail: r["College Email Id"] || "",
                personalEmail: r["Personal Email Id"] || "",
                phone: r["Phone Number"] || "",
                course: r["Course"] || "General",
                gender: (normalizeGender(r["Gender"]) as any) || 'MALE',
                dateOfBirth: r["Date of Birth"] || "",
                currentCourseScore: toNumber(r["Current Course Score"]),
                currentCoursePercentage: r["Current Course Percentage"] || undefined,
                ugBoard: r["UG Board/University"] || "",
                ugProgram: r["UG Program"] || "",
                ugBranch: r["UG Branch/Specialization"] || undefined,
                 ugPercentage: ugPct,
                 ugEndYear: toInt(r["UG End Year"]) ?? 0,
                 class12Percentage: toNumber(r["Class 12 %"]) || undefined,
                 class12YOP: toInt(r["12th YOP"]) ?? 0,
                 class10Percentage: toNumber(r["Class 10 %"]) || undefined,
                 class10YOP: toInt(r["10th YOP"]) ?? 0,
                internshipCompany: r["Mandatory Internship Company Name"] || undefined,
                internshipJobTitle: r["Mandatory Internship Job Title"] || undefined,
                internshipDuration: r["Mandatory Internship Duration"] || undefined,
                totalExperience: totalExp,
                workExperience1Company: r["Work Experience 1 Company Name"] || undefined,
                workExperience1Title: r["Work Experience 1 Job Title"] || undefined,
                workExperience1Duration: r["Work Experience 1 Duration"] || undefined,
                workExperience2Company: r["Work Experience 2 Company Name"] || undefined,
                workExperience2Title: r["Work Experience 2 Job Title"] || undefined,
                workExperience2Duration: r["Work Experience 2 Duration"] || undefined,
                category: r["Student Category"] || "",
                summerInternshipEnrolled: toBool(r["Is Student Enrolled (Summer Internship 2025)"]),
                summerInternshipStatus: r["Status (Summer Internship 2025)"] || undefined,
                campusPlacementEnrolled: toBool(r["Is Student Enrolled (Campus Placement 2026)"]),
                campusPlacementStatus: r["Status (Campus Placement 2026)"] || undefined,
                profileImage: undefined,
                state: r["State"] || undefined,
                bloodGroup: r["Blood Group"] || undefined,
                languages: undefined,
                achievements: undefined,
                comments: r["Comments"] || undefined,
              };
              return s;
            });

          resolve(mapped);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}
