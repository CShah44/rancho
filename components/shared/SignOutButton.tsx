import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200 font-medium"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </form>
  );
}
