"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// P5.js system instructions
const P5JS_SYSTEM_INSTRUCTIONS = `you're an extremely proficient creative coding agent for p5.js.
Based on the user's prompt, write a complete, self-contained javascript p5.js sketch.
Return only the javascript code block, without any surrounding text, explanation, or markdown formatting like \`\`\`javascript or \`\`\`.
Ensure all functions are either declared in the code or are part of the standard p5.js library.
Do not use external dependencies or libraries other than p5.js.
The code should be ready to run directly in a p5.js environment.
The entire sketch, including setup() and draw() functions, must be provided.
If the prompt is vague, make reasonable creative choices to produce a functional and interesting visual sketch.
Example of a complete sketch:
function setup() {
  createCanvas(400, 400);
}
function draw() {
  background(220);
  ellipse(width/2, height/2, 50, 50);
}`;

// Generate p5.js code based on a prompt
export async function generateP5Code({
  prompt,
  currentCode = "",
}: {
  prompt: string;
  currentCode?: string;
}) {
  try {
    let effectivePrompt = prompt;
    if (currentCode) {
      effectivePrompt = `The current code is:\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nMy request is: ${prompt}`;
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      output: "object",
      schema: z.object({
        info: z
          .string()
          .describe(
            "It contains instructions for the game. If a sketch is generated instead of game then there should be an explanation here instead."
          ),
        title: z.string(),
        code: z.string(),
      }),
      system: P5JS_SYSTEM_INSTRUCTIONS,
      prompt: effectivePrompt,
    });

    // Since we're using the updated system instructions that ask for code only,
    // we need to handle the response differently
    // const code = responseText.trim();

    return {
      explanation: "", // No explanation in the new format
      code: object.code,
      info: object.info,
      title: object.title,
      success: true,
    };
  } catch (error) {
    console.error("Failed to generate p5.js code:", error);
    return {
      explanation: "Failed to generate code. Please try again.",
      code: "",
      success: false,
    };
  }
}

// Fix runtime errors in p5.js code
export async function fixP5CodeError({
  code,
  error,
}: {
  code: string;
  error: string;
}) {
  try {
    const prompt = `The following p5.js code has an error:\n\`\`\`javascript\n${code}\n\`\`\`\n\nError: ${error}\n\nPlease fix the code.`;

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      output: "object",
      schema: z.object({
        info: z
          .string()
          .describe(
            "It contains instructions for the game. If a sketch is generated instead of game then there should be an explanation here instead."
          ),
        title: z.string(),
        code: z.string(),
      }),
      system: P5JS_SYSTEM_INSTRUCTIONS,
      prompt: prompt,
    });

    return {
      explanation: "", // No explanation in the new format
      code: object.code,
      info: object.info,
      title: object.title,
      success: true,
    };
  } catch (error) {
    console.error("Failed to fix p5.js code:", error);
    return {
      explanation: "Failed to fix the code. Please try again.",
      code: "",
      success: false,
    };
  }
}
