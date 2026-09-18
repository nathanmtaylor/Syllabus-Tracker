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
- The course name.
- The grading breakdown: each category (e.g. Homework, Exams) and what percent of the final grade it's worth. Give each category a short lowercase id with no spaces (e.g. "homework").
- Every graded assignment, quiz, or exam mentioned, with its title, due date in YYYY-MM-DD format, and which grading category id it belongs to. If a year isn't stated, use your best judgment based on the surrounding dates.
If the syllabus doesn't clearly state something, make a reasonable estimate rather than leaving it out.`,
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
