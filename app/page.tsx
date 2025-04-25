"use server";

import { auth } from "@/auth";
import Chat from "@/components/shared/Chat";
import SignIn from "@/components/shared/SignInButton";
import { generateUUID } from "@/lib/utils";
export default async function Home() {
  const session = await auth();
  const id = generateUUID();

  return (
    <main className="min-h-screen bg-zinc-900 flex flex-col items-center px-4">
      {!session && <SignIn />}
      {session && (
        <div className="w-full max-w-4xl flex flex-col h-screen pt-8 pb-4">
          <Chat chatId={id} user={session.user!} initialMessages={[]} />
        </div>
      )}
    </main>
  );
}
