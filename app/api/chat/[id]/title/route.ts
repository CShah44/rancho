import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateChatTitle, getChatById } from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  const { params } = segmentData;
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Check if chat exists and belongs to user
    const existingChat = await getChatById({ id });

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (existingChat.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the chat title
    const updatedChat = await updateChatTitle({
      chatId: id,
      title: title.trim(),
    });

    return NextResponse.json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
