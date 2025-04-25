import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-zinc-900">
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
