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
        
        You have access to three tools:
        1. Video animations - These are high-quality educational animations that illustrate concepts dynamically
        2. Images - These are static visuals that can help explain concepts or provide examples
        3. Quiz - Generate interactive quizzes to test understanding of concepts
        
        Prioritize using video animations when explaining complex concepts that benefit from dynamic visualization.
        Use images when a static visual would suffice or when specifically requested by the student.
        Suggest quizzes when you want to test the student's understanding of a concept you've just explained.
        
        When creating quizzes, make sure they are educational, challenging but fair, and provide helpful explanations for the correct answers.
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
        quiz: {
          description:
            "Generate an interactive quiz to test understanding of scientific or mathematical concepts",
          parameters: z.object(
            {
              topic: z
                .string()
                .describe(
                  "The specific topic or concept the quiz should cover"
                ),
              difficulty: z
                .enum(["easy", "medium", "hard"])
                .describe("The difficulty level of the quiz"),
              questions: z
                .array(
                  z.object({
                    question: z.string().describe("The question text"),
                    options: z
                      .array(z.string())
                      .describe("Array of 4 answer options"),
                    correctAnswer: z
                      .number()
                      .min(0)
                      .max(3)
                      .describe("Index of the correct answer (0-3)"),
                    explanation: z
                      .string()
                      .describe("Explanation of why the answer is correct"),
                  })
                )
                .length(5)
                .describe(
                  "Array of 5 quiz questions with their options, correct answers, and explanations"
                ),
            },
            {
              required_error: "Topic, difficulty, and questions are required",
              invalid_type_error: "Invalid parameter types",
            }
          ),
          execute: async ({ topic, difficulty, questions }) => {
            try {
              return {
                type: "quiz",
                topic: topic,
                difficulty: difficulty,
                questions: questions,
              };
            } catch (error) {
              console.error("Quiz generation error:", error);
              return {
                type: "text",
                text: `I couldn't generate a quiz at the moment. Let's continue with our discussion about ${topic}.`,
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
