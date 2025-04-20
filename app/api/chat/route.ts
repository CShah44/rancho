import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import z from "zod";
import { NextResponse } from "next/server";

// Allow streaming responses up to 60 seconds for video generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, search } = await req.json();

    const result = streamText({
      model: google("gemini-2.0-flash-001", {
        useSearchGrounding: search,
      }),
      system: `
        You are Rancho, an exceptional and innovative high school science and mathematics teacher at Dhirubhai Ambani International School.
        Your teaching philosophy emphasizes:
        - Creative problem-solving and intuitive understanding over rote memorization
        - Visual and interactive learning experiences that make complex concepts simple
        - Practical applications that demonstrate real-world relevance
        - Concise, engaging explanations that maintain student interest
        
        Include formal definitions and equations when necessary, but always explain them in intuitive ways.
        
        Answer questions related to science, mathematics, technology, and current scientific advancements.
        Politely decline to answer questions unrelated to these domains or inappropriate for a high school setting.
        
        Your responses should:
        - Be concise (students prefer shorter, impactful explanations)
        - Use markdown formatting effectively (headings, bullet points, bold for emphasis)
        - Include analogies and metaphors that make concepts relatable
        - Suggest visualization opportunities when explaining complex topics
        
        You have access to two visualization tools:
        1. Video animations - These are high-quality educational animations that illustrate concepts dynamically
        2. Images - These are static visuals that can help explain concepts or provide examples
        
        Prioritize using video animations when explaining complex concepts that benefit from dynamic visualization.
        Use images when a static visual would suffice or when specifically requested by the student.
        
        When appropriate, recommend creating a visualization to illustrate concepts. The video tool is generally more effective for explaining scientific and mathematical concepts as it can show processes and transformations over time.
      `,
      messages,
      tools: {
        video: {
          description:
            "Generate educational animations that illustrate scientific or mathematical concepts. The animations will be rendered as videos and returned to the student.",
          parameters: z.object(
            {
              title: z
                .string()
                .describe(
                  "Descriptive title for the animation that clearly indicates the concept being visualized."
                ),
              description: z
                .string()
                .describe(
                  "A short description of the concept to be taught and visualized. This should include the specific scientific or mathematical concept, key principles, and any important aspects that should be highlighted in the visualization. Be concise as this will be used to generate the educational animation."
                ),
            },
            {
              required_error: "Title and description are required",
              invalid_type_error: "Title and description must be strings",
            }
          ),
          execute: async ({ title, description }) => {
            try {
              // Call the FastAPI backend to generate the video
              const response = await fetch(
                "http://localhost:8000/explain-concept",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ description: description }),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                return {
                  type: "text",
                  status: "error",
                  text: `Error generating animation: ${errorText}`,
                };
              }

              const data = await response.json();
              const videoUrl = data.video_url;
              const explanation = data.explanation;

              if (!videoUrl) {
                return {
                  type: "text",
                  status: "error",
                  text: "Animation generated but video URL not found. Please try again.",
                };
              }

              return {
                type: "video",
                status: "success",
                title: title,
                videoUrl: videoUrl,
                explanation: explanation,
                mimeType: "video/mp4",
              };
            } catch (error) {
              return {
                type: "text",
                text: `Failed to generate animation: ${error}`,
              };
            }
          },
        },
        image: {
          description:
            "Search for relevant educational images to illustrate concepts or provide visual examples",
          parameters: z.object(
            {
              query: z
                .string()
                .describe(
                  "Specific search query describing the educational image needed. Be precise about the scientific or mathematical concept you want to illustrate."
                ),
            },
            {
              required_error: "Query is required",
              invalid_type_error: "Query must be a string",
            }
          ),
          execute: async ({ query }) => {
            const myHeaders = new Headers();
            myHeaders.append(
              "X-API-KEY",
              process.env.SERP_API_KEY || "serper.dev API key"
            );
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
              q: query,
              gl: "in",
            });

            try {
              const response = await fetch("https://google.serper.dev/images", {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
              });
              const result = await response.json();

              if (!result || !result.images || result.images.length === 0) {
                return {
                  type: "text",
                  text: "No relevant images found. Let me explain the concept differently.",
                };
              }

              // Return the top 3 images (or fewer if less are available)
              interface Image {
                imageUrl: string;
                title: string;
                imageWidth: number;
                imageHeight: number;
                thumbnailUrl: string;
                thumbnailWidth: number;
                thumbnailHeight: number;
                source: string;
                domain: string;
                googleUrl: string;
                position: number;
                link: string;
              }

              const imagesToReturn: Image[] = result.images.slice(0, 5);

              return {
                type: "image",
                images: imagesToReturn.map((i) => {
                  return {
                    imageUrl: i.imageUrl,
                    title: i.title,
                  };
                }),
              };
            } catch (error) {
              console.error(error);
              return {
                type: "text",
                text: "I couldn't retrieve images at the moment. Let me explain the concept differently.",
              };
            }
          },
        },
      },
    });

    return result.toDataStreamResponse({
      sendSources: true,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
