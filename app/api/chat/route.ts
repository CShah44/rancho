import { google } from "@ai-sdk/google";
import { appendResponseMessages, streamText, generateId } from "ai";
import z from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import {
  hasEnoughCredits,
  deductCredits,
  getVideoGenerationCost,
  getGameGenerationCost,
} from "@/lib/db/credit-queries";
import { generateTitleFromUserMessage } from "./actions";
import { getMostRecentUserMessage, getTrailingMessageId } from "@/lib/utils";
import { generateP5Code } from "@/app/game/actions";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages, search, id } = await req.json();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const result = streamText({
      model: google("gemini-2.5-flash-preview-05-20", {
        useSearchGrounding: search,
      }),
      system: `
        You are Rancho, an exceptional and innovative high school science and mathematics personal tutor.
        Your teaching philosophy emphasizes:
        - Creative problem-solving and intuitive understanding over rote memorization
        - Visual and interactive learning experiences that make complex concepts simple
        - Practical applications that demonstrate real-world relevance
        - Concise, engaging explanations that maintain student interest
        
        Include formal definitions and equations when necessary, but always explain them in intuitive ways.
        
        Answer questions related to science, mathematics, technology, current scientific advancements, or any other high school-level subject.
        Politely decline to answer questions unrelated to these domains or inappropriate for a high school setting.
        
        Your responses should:
        - Be concise (students prefer shorter, impactful explanations)
        - Use markdown formatting effectively (headings, bullet points, bold for emphasis)
        - Include analogies and metaphors that make concepts relatable
        - Suggest visualization opportunities when explaining complex topics
        
        You have access to four tools:
        1. Video animations - These are high-quality educational animations that illustrate concepts dynamically (costs credits)
        2. Images - These are static visuals that can help explain concepts or provide examples (free)
        3. Quiz - Generate interactive quizzes to test understanding of concepts (free)
        4. Game - Create interactive p5.js sketches and games to demonstrate scientific and mathematical concepts (costs credits)
        
        Prioritize using video animations when explaining complex concepts that benefit from dynamic visualization. But always ask the student if they would like a video animation before generating one. (This will help manage credit usage.)
        Use images when a static visual would suffice or when specifically requested by the student.
        Suggest quizzes when you want to test the student's understanding of a concept you've just explained.
        Use games when you want to provide an interactive demonstration of a concept, especially for physics, mathematics, or computer science topics. Ask the student if they would like to play a game before generating one.
        
        When creating quizzes, make sure they are educational, challenging but fair, and provide helpful explanations for the correct answers.
        
        When creating games, focus on making them educational and relevant to the scientific or mathematical concept being discussed. Games should be simple enough for students to understand but engaging enough to maintain interest.
      `,
      messages,
      tools: {
        video: {
          description:
            "Generate educational animations that illustrate scientific or mathematical concepts. The animations will be rendered as videos and returned to the student. This tool costs credits.",
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
              // Check if user has enough credits
              const requiredCredits = await getVideoGenerationCost();

              if (!session?.user?.id) {
                return {
                  type: "text",
                  status: "error",
                  text: "Unauthorized: User session not found",
                };
              }

              const hasCredits = await hasEnoughCredits(
                session.user.id,
                requiredCredits
              );

              if (!hasCredits) {
                return {
                  type: "text",
                  status: "credit-error",
                  text: `⚠️ **Insufficient Credits**: You need ${requiredCredits} credits to generate a video animation. Please purchase more credits to continue using this feature.`,
                };
              }

              // Call the FastAPI backend to generate the video
              const response = await fetch(
                `${process.env.BACKEND_URL}/explain-concept`,
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

              // Deduct credits only after successful generation
              await deductCredits({
                userId: session.user.id,
                amount: requiredCredits,
                description: `Video animation: ${title}`,
                relatedId: id, // chat ID
              });

              return {
                type: "video",
                status: "success",
                title: title,
                videoUrl: videoUrl,
                explanation: explanation,
                mimeType: "video/mp4",
                creditsUsed: requiredCredits,
              };
            } catch (error) {
              console.error("Video generation error:", error);
              return {
                type: "text",
                status: "error",
                text: `Failed to generate animation: ${error}`,
              };
            }
          },
        },
        image: {
          description:
            "Search for relevant educational images to illustrate concepts or provide visual examples. This tool is free to use.",
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
            "Generate an interactive quiz to test understanding of scientific or mathematical concepts. This tool is free to use.",
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
        game: {
          description:
            "Generate interactive p5.js sketches and games to demonstrate scientific or mathematical concepts. This tool costs credits.",
          parameters: z.object(
            {
              topic: z
                .string()
                .describe(
                  "The specific scientific or mathematical concept the game should demonstrate"
                ),
              description: z
                .string()
                .describe(
                  "A detailed description of the game or sketch to be created, including what scientific or mathematical principles it should demonstrate"
                ),
            },
            {
              required_error: "Topic and description are required",
              invalid_type_error: "Topic and description must be strings",
            }
          ),
          execute: async ({ topic, description }) => {
            try {
              // Check if user has enough credits
              const requiredCredits = await getGameGenerationCost();

              if (!session?.user?.id) {
                return {
                  type: "text",
                  status: "error",
                  text: "Unauthorized: User session not found",
                };
              }

              const hasCredits = await hasEnoughCredits(
                session.user.id,
                requiredCredits
              );

              if (!hasCredits) {
                return {
                  type: "text",
                  status: "credit-error",
                  text: `⚠️ **Insufficient Credits**: You need ${requiredCredits} credits to generate an interactive game. Please purchase more credits to continue using this feature.`,
                };
              }

              const result = await generateP5Code({ prompt: description });

              if (result.success && result.code) {
                // Deduct credits only after successful generation
                await deductCredits({
                  userId: session.user.id,
                  amount: requiredCredits,
                  description: `Interactive game: ${topic}`,
                  relatedId: id, // chat ID
                });

                return {
                  type: "game",
                  status: "success",
                  topic: topic,
                  title: result.title || "Interactive Sketch",
                  code: result.code,
                  info: result.info || "",
                  creditsUsed: requiredCredits,
                };
              } else {
                return {
                  type: "text",
                  status: "error",
                  text: "Failed to generate the game. Please try a different description or concept.",
                };
              }
            } catch (error) {
              console.error("Game generation error:", error);
              return {
                type: "text",
                text: `I couldn't generate a game at the moment. Let's continue with our discussion about ${topic}.`,
              };
            }
          },
        },
      },
      onFinish: async (output) => {
        try {
          const assistantId = getTrailingMessageId({
            messages: output.response.messages.filter(
              (message) => message.role === "assistant"
            ),
          });

          if (!assistantId) {
            throw new Error("No assistant message found!");
          }

          const [, assistantMessage] = appendResponseMessages({
            messages: [userMessage],
            responseMessages: output.response.messages,
          });

          await saveMessages({
            messages: [
              {
                chatId: id,
                id: generateId(),
                role: "user",
                parts: userMessage.parts,
                attachments: userMessage.experimental_attachments ?? [],
                createdAt: new Date(),
              },
              {
                id: assistantId,
                chatId: id,
                role: assistantMessage.role,
                parts: assistantMessage.parts,
                attachments: assistantMessage.experimental_attachments ?? [],
                createdAt: new Date(),
              },
            ],
          });
        } catch (error) {
          console.error("Error saving messages:", error);
        }
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
