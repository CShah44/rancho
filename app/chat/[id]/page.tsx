import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Chat from "@/components/shared/Chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DBMessage } from "@/lib/db/schema";
import { Attachment, UIMessage } from "ai";

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  // Only done for private chats
  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  return (
    <div className="flex flex-col h-screen pt-4 pb-4 px-4 w-full">
      <Chat
        user={session.user}
        chatId={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
      />
    </div>
  );
}
