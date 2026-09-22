import { tool } from "ai";
import { z } from "zod";
import { searchSchoolRecords } from "@/lib/schools/schoolSearchData";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const pexTools = {
  findSchoolPack: tool({
    description: "Search for an official school stationery pack by school name and grade in South Africa",
    inputSchema: z.object({
      schoolName: z.string().describe("The name of the school (e.g. Bedfordview Primary, St Mary's)"),
      grade: z.string().describe("The learner's grade (e.g. Grade 4, Grade R, Grade 8)"),
    }),
    execute: async ({ schoolName, grade }) => {
      try {
        const result = await searchSchoolRecords(
          { query: schoolName.slice(0, 160), grade, phase: "", region: "" },
          1,
          0
        );
        const school = result.results[0];
        if (!school) {
          return {
            found: false,
            message: `School "${schoolName}" is not yet listed on our official school pack directory.`,
            uploadListUrl: "/upload-a-list",
          };
        }
        const supabase = createSupabaseAdminClient();
        const { data: bundle } = await supabase.rpc("get_public_school_pack" as never, {
          school_slug: school.slug,
        } as never);
        return {
          found: true,
          schoolName: school.name,
          slug: school.slug,
          city: school.city,
          bundle,
        };
      } catch (err) {
        return {
          found: false,
          error: String(err),
          uploadListUrl: "/upload-a-list",
        };
      }
    },
  }),

  calculatePexcoverQuote: tool({
    description: "Calculate the exact book-covering quote for a given number of school exercise books",
    inputSchema: z.object({
      numberOfBooks: z.number().positive().describe("Total number of exercise books that need heavy-duty covering"),
    }),
    execute: async ({ numberOfBooks }) => {
      const ratePerBook = 9.5;
      const total = numberOfBooks * ratePerBook;
      return {
        numberOfBooks,
        ratePerBook: `R ${ratePerBook.toFixed(2)}`,
        totalCost: `R ${total.toFixed(2)}`,
        specifications: "120-micron protective plastic sleeve, personalized label with learner's name, grade, and subject.",
      };
    },
  }),

  checkDeliveryEstimate: tool({
    description: "Look up courier turnaround and collection options for a South African delivery address or suburb",
    inputSchema: z.object({
      location: z.string().describe("Town, suburb, or city name in South Africa"),
    }),
    execute: async ({ location }) => {
      return {
        location,
        courierTime: "2–4 business days door-to-door courier via Courier Guy / Fastway across South Africa",
        schoolDropAvailable: "Orientation day bulk drop available for registered partner schools",
        paxiAvailable: "PEP Paxi collection point available upon request",
      };
    },
  }),
};
