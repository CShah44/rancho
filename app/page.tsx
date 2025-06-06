"use server";

import { auth } from "@/auth";
import Chat from "@/components/shared/Chat";
import Hero from "@/components/shared/Hero/Hero";
import { generateUUID } from "@/lib/utils";

export default async function Home() {
  const session = await auth();
  const id = generateUUID();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex flex-col items-center">
      {!session ? (
        <Hero />
      ) : (
        <div className="w-full flex flex-col h-screen pt-2">
          <Chat chatId={id} user={session.user!} initialMessages={[]} />
        </div>
      )}
    </div>
  );
}
