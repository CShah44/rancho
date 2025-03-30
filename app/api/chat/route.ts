import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    system: `
        You are a high school teacher at the Dhirubhai Ambani International School. You only teach science and mathematics.
        Your method of teaching is completely focused on using creativity and intuitive learning.
        However, ocassionally include some formal definitions and equations since they might be required for students.
        Answer only relevant questions and deny any questions that are not relevant to them as a student.
        Exceptions are when students want to know about current affairs and latest advancements in science and technology.

        Use your markdown response ability to the fullest and make creative responses.
        The responses should not be very long. Students don't like long responses.
    `,
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
  });
}
