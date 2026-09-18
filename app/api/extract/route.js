import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Reads ANTHROPIC_API_KEY from the server's environment (.env.local locally,
// a Vercel project env var in production). This code only ever runs on the
// server, so the key never reaches the browser.
const client = new Anthropic();

// Describes the exact shape we want back, matching lib/sampleData.js.
// The API guarantees the response matches this shape - no more "hope the
// model returned valid JSON" parsing.
const SyllabusSchema = z.object({
  courseName: z.string(),
  // A short code like "PSY 101" or "MELC 0003" - null if the syllabus
  // doesn't clearly state one. See the system prompt.
  courseCode: z.string().nullable(),
  gradingBreakdown: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      weight: z.number(),
    })
  ),
  assignments: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      categoryId: z.string(),
      dueDate: z.string(),
    })
  ),
  // Only present when the syllabus text states explicit numeric cutoffs
  // (e.g. "A 93-100, A- 90-92"). null otherwise - see the system prompt.
  gradeScale: z
    .array(
      z.object({
        letter: z.string(),
        min: z.number(),
      })
    )
    .nullable(),
});

export async function POST(request) {
  let syllabusText;
  try {
    ({ syllabusText } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!syllabusText || !syllabusText.trim()) {
    return Response.json(
      { error: "No syllabus text was provided." },
      { status: 400 }
    );
  }

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: `You extract structured data from college syllabi. Read the syllabus text and pull out:
- The course name: the full title as written.
- A short course code (courseCode), if the syllabus states one - usually a department abbreviation plus a number (e.g. "PSY 101", "MELC 0003", "Physics 8"). It may appear inside the full course title itself. If there's no clear short code, set courseCode to null - the app will build a short label on its own in that case, so don't guess or invent one.
- The grading breakdown: each category (e.g. Homework, Exams) and what percent of the final grade it's worth. Give each category a short lowercase id with no spaces (e.g. "homework").
- Every graded assignment, quiz, or exam mentioned, with its title, due date in YYYY-MM-DD format, and which grading category id it belongs to. If a year isn't stated, use your best judgment based on the surrounding dates.
- The letter grade scale (gradeScale), ONLY if the syllabus explicitly states numeric percentage cutoffs for letter grades (e.g. "A: 93-100, A-: 90-92, B+: 87-89"). Represent each letter as the minimum percentage required to earn it.

For the course name, grading breakdown, and assignments: if something isn't perfectly clear, make a reasonable estimate rather than leaving it out.

The gradeScale and courseCode fields are the exceptions to that - gradeScale must be null unless the syllabus states specific numeric cutoffs, and courseCode must be null unless the syllabus clearly states a short code. Never invent, estimate, or assume either one (e.g. do not assume "90 and up is an A" just because that's common, and do not make up a course code that isn't actually written in the text).`,
      messages: [{ role: "user", content: syllabusText }],
      output_config: {
        // Extraction like this doesn't need deep reasoning, so "low" keeps
        // this call cheap and fast. Bump to "medium" if messy syllabi come
        // back with mistakes.
        effort: "low",
        format: zodOutputFormat(SyllabusSchema),
      },
    });

    if (!response.parsed_output) {
      return Response.json(
        {
          error:
            "Claude couldn't extract structured data from that text. Try pasting more of the syllabus.",
        },
        { status: 422 }
      );
    }

    return Response.json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Server is misconfigured: invalid API key." },
        { status: 500 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "Rate limited by the AI provider. Try again in a moment." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "The AI request failed. Try again." },
        { status: 502 }
      );
    }
    return Response.json(
      { error: "Something went wrong extracting the syllabus." },
      { status: 500 }
    );
  }
}
