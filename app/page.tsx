import Chat from "@/components/shared/Chat";
import SignIn from "@/components/shared/SignInButton";
import { SignOut } from "@/components/shared/SignOutButton";
export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-900 flex flex-col items-center px-4">
      <SignIn />
      <SignOut />
      <div className="w-full max-w-4xl flex flex-col h-screen pt-8 pb-4">
        <Chat />
      </div>
    </main>
  );
}
