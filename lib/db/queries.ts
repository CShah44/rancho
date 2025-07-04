import { db } from ".";
import {
  chat,
  message,
  users,
  type DBMessage,
  type Chat,
  CREDIT_COSTS,
} from "./schema";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";

// Add this import for credit operations
import { deductCredits } from "./credit-queries";

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // First, get all messages for this chat to find any video URLs
    const messages = await getMessagesByChatId({ id });

    // Look for tool invocations with videos in the messages
    for (const msg of messages) {
      if (msg.parts) {
        try {
          // parts is an array of objects, so we need to iterate through it
          const parts = msg.parts as Array<{
            type: string;
            text?: string;
            toolInvocation?: {
              toolName: string;
              state: string;
              toolCallId: string;
              args?: {
                title?: string;
                description?: string;
                query?: string;
              };
              step: number;
              result?: {
                videoUrl?: string;
                type?: string;
                mimeType?: string;
                title?: string;
                explanation?: string;
                status?: string;
                images?: Array<{
                  title: string;
                  imageUrl: string;
                }>;
              };
            };
          }>;

          for (const part of parts) {
            if (part.toolInvocation?.result?.videoUrl) {
              // Delete the video from the server, send request to your server to delete the video
              const response = await fetch(
                `${process.env.BACKEND_URL}/delete-video`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    video_url: part.toolInvocation.result.videoUrl,
                  }),
                }
              );

              if (!response.ok) {
                throw new Error("Failed to delete video from chat");
              }
            }
          }
        } catch (parseError) {
          // If content isn't valid JSON or doesn't have the expected structure, just continue
          console.error("Error parsing message content:", parseError);
        }
      }
    }

    await db.delete(message).where(eq(message.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({
  id,
}: {
  id: string;
}): Promise<DBMessage[]> {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}

export async function updateChatTitle({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    const [updatedChat] = await db
      .update(chat)
      .set({ title })
      .where(eq(chat.id, chatId))
      .returning();

    return updatedChat;
  } catch (error) {
    console.error("Failed to update chat title in database");
    throw error;
  }
}

export async function deductCreditsForVideo({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}) {
  try {
    return await deductCredits({
      userId,
      amount: CREDIT_COSTS.VIDEO,
      description: "Video generation",
      relatedId: chatId,
    });
  } catch (error) {
    console.error("Failed to deduct credits for video generation");
    throw error;
  }
}

export async function deductCreditsForGame({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}) {
  try {
    return await deductCredits({
      userId,
      amount: CREDIT_COSTS.GAME,
      description: "Game generation",
      relatedId: chatId,
    });
  } catch (error) {
    console.error("Failed to deduct credits for game generation");
    throw error;
  }
}

// Get user with credits
export async function getUserWithCredits(userId: string) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        credits: users.credits,
        totalCreditsPurchased: users.totalCreditsPurchased,
      })
      .from(users)
      .where(eq(users.id, userId));

    return user;
  } catch (error) {
    console.error("Failed to get user with credits");
    throw error;
  }
}
