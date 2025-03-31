import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import z from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
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

        When teaching physics, use physics_tool to create helpful visual aids.
        When teaching coordinate geometry, vectors, or any mathematical concept that can be visualized, use the graph_visualization tool to create helpful visual aids.
        `,
      messages,
      tools: {
        physics_tool: {
          description: "This tool is used to solve physics problems.",
          parameters: z.object({
            concept: z
              .string()
              .describe("The name of the physics concept to be visualized."),
          }),
          execute: async ({ concept }) => {
            // dummy implementation
            return (
              "The physics visualization tool is not implemented yet." + concept
            );
          },
        },
        graph_visualization: {
          description:
            "Generate interactive mathematical visualizations using Plotly python code.",
          parameters: z.object({
            code: z
              .string()
              .describe(
                "Python code that generates a visualization using Plotly. The code should create clear, educational visualizations with proper labels, titles, and colors."
              ),
          }),
          execute: async ({ code }) => {
            console.log("I AM HERE FIRST");
            // Create a sandbox, execute visualization code, and return the result
            const sandbox = await Sandbox.create({
              apiKey: process.env.E2B_API_KEY,
            });

            // Install Plotly and supporting libraries
            await sandbox.runCode(`
import sys
!{sys.executable} -m pip install plotly numpy sympy pandas kaleido
          `);

            // Add template code to ensure proper static image rendering with Plotly
            const enhancedCode = `
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import numpy as np
from IPython.display import Image, display
import io

# Set renderer to generate high-quality static images
pio.renderers.default = "png"

# Execute the visualization code
${code}

# If the code doesn't explicitly save the figure, try to capture the last created figure
try:
    # Check if 'fig' exists in the local namespace
    if 'fig' in locals():
        img_bytes = pio.to_image(fig, format="png", width=800, height=600, scale=2)
        display(Image(img_bytes))
except Exception as e:
    print(f"Error generating visualization: {e}")
          `;

            console.log("I AM HERE");

            // Run the enhanced visualization code
            const { text, results, logs, error } = await sandbox.runCode(
              enhancedCode
            );

            console.log(text, logs, error);

            return results || text;
          },
        },
      },
    });

    return result.toDataStreamResponse({
      sendSources: true,
    });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
