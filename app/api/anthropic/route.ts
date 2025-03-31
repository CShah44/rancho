import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages,
    });

    const temp = await generateText({
      model: anthropic("claude-3-5-sonnet-latest"),
      prompt: "Hello world!",
    });

    console.log(temp);

    return result.toDataStreamResponse();
  } catch (error) {
    console.log(error);
  }
}
